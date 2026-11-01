import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createPerfectSkin, normalizeSkinResult, providerImageUrl, signSkinJob, verifySkinJob } from '../src/lib/perfectSkin';
import { createSkinAnalysisHandlers } from '../src/lib/skinAnalysisRoute';
import { SKIN_CONCERNS, SKIN_CONSENT_VERSION, SKIN_PHOTO_LIMIT, skinCaptureIssue } from '../src/lib/skinAnalysis';

const origin = 'http://localhost:3000';
const key = 'test-key-not-a-real-credential';
const imageUrl = 'https://yce-us.s3-accelerate.amazonaws.com/test/fixture.jpg?signature=fixture';
// Minimal SOF header fixture tests routing rules, not real image decoding or model accuracy.
const jpeg = new Uint8Array([255,216,255,192,0,17,8,3,32,2,88,3,1,17,0,2,17,0,3,17,0,255,217]);
const json = (data: unknown) => Response.json({ status: 200, data });
function post(body: BodyInit = jpeg, headers: Record<string, string> = {}) {
  return new Request(`${origin}/api/skin-analysis`, { method: 'POST', body, headers: { Origin: origin, 'Content-Type': 'image/jpeg', 'X-Mina-Consent': SKIN_CONSENT_VERSION, ...headers } });
}
function mockedProvider() {
  const calls: { url: string; init?: RequestInit }[] = [];
  const fetcher: typeof fetch = async (input, init) => {
    const url = String(input); calls.push({ url, init });
    if (url.endsWith('/file')) return json({ files: [{ file_id: 'fixture-file', requests: [{ method: 'PUT', url: imageUrl, headers: { 'Content-Type': 'image/jpeg', 'Content-Length': String(jpeg.length) } }] }] });
    if (init?.method === 'PUT') return new Response(null, { status: 200 });
    if (init?.method === 'POST') return json({ task_id: 'fixture-task' });
    return json({ task_status: 'success', results: { output: SKIN_CONCERNS.map(c => ({ type: c.id, raw_score: 57.33, ui_score: 92, mask_urls: [imageUrl] })) } });
  };
  return { calls, fetcher };
}

test('No key: configuration says unavailable and photo causes zero upstream calls', async () => {
  const provider = mockedProvider();
  const handlers = createSkinAnalysisHandlers(() => undefined, provider.fetcher);
  const config = await handlers.GET(new Request(`${origin}/api/skin-analysis`));
  assert.equal((await config.json()).configured, false);
  assert.match(config.headers.get('cache-control')!, /no-store/);
  const response = await handlers.POST(post());
  assert.equal(response.status, 503);
  assert.equal(provider.calls.length, 0);
});

test('Consent version, same-origin and loopback are required before any photo transmission', async () => {
  const provider = mockedProvider(); const handlers = createSkinAnalysisHandlers(() => key, provider.fetcher);
  const deniedHeaders: Record<string, string>[] = [{ 'X-Mina-Consent': '' }, { 'X-Mina-Consent': 'older' }, { Origin: 'https://other.example' }];
  for (const headers of deniedHeaders) {
    assert.equal((await handlers.POST(post(jpeg, headers))).status, 403);
  }
  assert.equal((await handlers.POST(new Request('https://mina.example/api/skin-analysis', { method: 'POST', body: jpeg }))).status, 403);
  assert.equal(provider.calls.length, 0);
});

test('Wrong formats, bad dimensions, oversized declared and streamed bodies never reach the provider', async () => {
  const provider = mockedProvider();
  const submit = (request: Request) => createSkinAnalysisHandlers(() => key, provider.fetcher).POST(request);
  assert.equal((await submit(post('not a jpeg'))).status, 400);
  assert.equal((await submit(post(jpeg, { 'Content-Type': 'image/png' }))).status, 415);
  const small = jpeg.slice(); small[7] = 0; small[8] = 90;
  assert.equal((await submit(post(small))).status, 400);
  assert.equal((await submit(post(jpeg, { 'Content-Length': String(SKIN_PHOTO_LIMIT + 1) }))).status, 413);
  assert.equal((await submit(post(new Uint8Array(SKIN_PHOTO_LIMIT + 1)))).status, 413);
  assert.equal(provider.calls.length, 0);
});

test('Real adapter contract: File API -> signed PUT -> src_file_id task -> signed status -> normalized results', async () => {
  const provider = mockedProvider(); const handlers = createSkinAnalysisHandlers(() => key, provider.fetcher);
  const started = await handlers.POST(post());
  assert.equal(started.status, 202);
  const handle = await started.json();
  assert.equal(verifySkinJob(handle.job, key), 'fixture-task');
  const taskBody = JSON.parse(provider.calls[2].init!.body as string);
  assert.deepEqual(taskBody.dst_actions, SKIN_CONCERNS.map(c => c.id));
  assert.equal(taskBody.src_file_id, 'fixture-file'); assert.equal(taskBody.format, 'json');
  assert.equal(taskBody.pf_camera_kit, false); assert.equal(taskBody.src_file_url, undefined);
  assert.equal(new Headers(provider.calls[0].init!.headers).get('Authorization'), `Bearer ${key}`);
  assert.equal(new Headers(provider.calls[1].init!.headers).has('Authorization'), false);
  assert.equal(provider.calls[1].init!.redirect, 'error');
  const response = await handlers.GET(new Request(`${origin}/api/skin-analysis?job=${encodeURIComponent(handle.job)}`));
  assert.equal(response.status, 200);
  const body = await response.json();
  assert.equal(body.status, 'success'); assert.equal(body.result.observations.length, 5);
  assert.equal(body.result.observations[0].rawScore, 57.33);
  const serialized = JSON.stringify(body);
  for (const excluded of [key, 'ui_score', 'overallHealth', 'skin_age', 'fixture-file']) assert(!serialized.includes(excluded));
});

test('Invalid, tampered, expired handles cannot query provider tasks', async () => {
  const valid = signSkinJob('fixture-task', key, 1000);
  assert.equal(verifySkinJob(valid, key, 1001), 'fixture-task');
  for (const [token, time] of [[valid + 'x', 1001], [valid, 1_201_000], ['made-up', 1001]] as const) assert.throws(() => verifySkinJob(token, key, time));
  const provider = mockedProvider(); const handlers = createSkinAnalysisHandlers(() => key, provider.fetcher);
  assert.equal((await handlers.GET(new Request(`${origin}/api/skin-analysis?job=made-up`))).status, 400);
  assert.equal(provider.calls.length, 0);
});

test('Only exact HTTPS image host is accepted; no redirect, credentials or arbitrary upload headers', async () => {
  for (const url of ['http://yce-us.s3-accelerate.amazonaws.com/a', 'https://yce-us.s3-accelerate.amazonaws.com.evil.test/a', 'https://127.0.0.1/a', 'https://user:pass@yce-us.s3-accelerate.amazonaws.com/a', 'https://yce-us.s3-accelerate.amazonaws.com:9999/a']) assert.equal(providerImageUrl(url), null);
  for (const invalid of [{ url: 'http://127.0.0.1/admin', headers: {} }, { url: imageUrl, headers: { Authorization: 'should-not-leak' } }]) {
    let calls = 0;
    const fetcher: typeof fetch = async () => { calls++; return json({ files: [{ file_id: 'id', requests: [{ method: 'PUT', ...invalid }] }] }); };
    await assert.rejects(createPerfectSkin(key, fetcher).start(jpeg, new AbortController().signal));
    assert.equal(calls, 1);
  }
});

test('Missing and malformed metrics stay missing; no demo fallback or psychologically adjusted score', () => {
  const result = normalizeSkinResult({ output: [{ type: 'acne', raw_score: NaN, ui_score: 99, mask_urls: ['https://evil.test/mask'] }, { type: 'pore', raw_score: 68 }, { type: 'skin_age', raw_score: 30 }] });
  assert.equal(result.observations.length, 1); assert.equal(result.observations[0].id, 'pore');
  assert.equal(result.observations[0].maskUrl, null);
  for (const output of [[], [{ type: 'redness', ui_score: 99 }], [{ type: 'redness', raw_score: 101 }]]) assert.throws(() => normalizeSkinResult({ output }));
});

test('Running status remains pending; engine and upstream errors are surfaced without raw identifiers', async () => {
  const pending = createPerfectSkin(key, async () => json({ task_status: 'running' }));
  assert.deepEqual(await pending.status('id', new AbortController().signal), { status: 'running' });
  for (const upstreamStatus of [401, 402, 429, 500]) {
    const handlers = createSkinAnalysisHandlers(() => key, async () => new Response(`${key} secret upstream body`, { status: upstreamStatus }));
    const response = await handlers.GET(new Request(`${origin}/api/skin-analysis?job=${signSkinJob('id', key)}`));
    assert(response.status >= 400); assert(!(await response.text()).includes(key));
  }
  const failed = createPerfectSkin(key, async () => json({ task_status: 'error', error: 'error_src_face_too_small' }));
  await assert.rejects(failed.status('id', new AbortController().signal), /крупный план/);
});

test('Repeated starts are bounded locally while status requests do not create new paid tasks', async () => {
  const provider = mockedProvider(); const handlers = createSkinAnalysisHandlers(() => key, provider.fetcher);
  const responses = await Promise.all(Array.from({ length: 6 }, () => handlers.POST(post())));
  assert.equal(responses.filter(response => response.status === 202).length, 3);
  assert.equal(responses.filter(response => response.status === 429).length, 3);
  assert.equal((await handlers.POST(post())).status, 429);
  assert.equal(provider.calls.filter(c => c.init?.method === 'POST' && c.url.includes('task')).length, 3);
});

test('Aborting a stalled input stream cancels body reading without contacting the provider', async () => {
  let cancelled = false;
  const controller = new AbortController();
  const body = new ReadableStream<Uint8Array>({ cancel() { cancelled = true; } });
  const request = new Request(`${origin}/api/skin-analysis`, {
    method: 'POST', body, signal: controller.signal, duplex: 'half',
    headers: { Origin: origin, 'Content-Type': 'image/jpeg', 'X-Mina-Consent': SKIN_CONSENT_VERSION },
  } as RequestInit & { duplex: 'half' });
  const provider = mockedProvider();
  const pending = createSkinAnalysisHandlers(() => key, provider.fetcher).POST(request);
  controller.abort();
  assert.equal((await pending).status, 502);
  assert.equal(cancelled, true); assert.equal(provider.calls.length, 0);
});

test('Provider capture rules demand SD resolution and >60% face width separately from local landmarks', () => {
  const face = { faces: [[{ x: .18, y: .1, z: 0 }, { x: .82, y: .9, z: 0 }]], pixels: null };
  assert.equal(skinCaptureIssue(face, 600, 800), null);
  assert.match(skinCaptureIssue(face, 300, 400)!, /480/);
  assert.match(skinCaptureIssue({ ...face, faces: [[{ x: .3, y: .2, z: 0 }, { x: .7, y: .8, z: 0 }]] }, 600, 800)!, /60%/);
});
