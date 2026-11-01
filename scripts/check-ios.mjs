import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const assets = join(root, 'ios/App/App/public');
const config = JSON.parse(await readFile(join(root, 'ios/App/App/capacitor.config.json'), 'utf8'));
assert.equal(config.appId, 'app.mina.skincare');
assert.equal(config.server?.url, undefined, 'An iOS release must not load a development server.');
assert.equal(config.loggingBehavior, 'none', 'Native bridge logging must not expose photos.');
const html = await readFile(join(assets, 'index.html'), 'utf8');
assert(html.includes('viewport-fit=cover'));
assert(!html.includes('fonts.googleapis.com'));
const model = await readFile(join(assets, 'models/acne/acne_detector.onnx'));
assert.equal(createHash('sha256').update(model).digest('hex'), 'de7b25f3d1e2af69ee18f2b55cb6d93edf3c8dd29662a1c64cf8d903c3fa8526');
await readFile(join(assets, 'models/face/face_landmarker.task'));
const notice = await readFile(join(assets, 'models/acne/NOTICE.md'), 'utf8');
assert(notice.includes('AGPL') && notice.includes('MIT'), 'The unresolved model licence must remain disclosed.');
async function checkDirectory(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    assert(!entry.name.startsWith('.env'), 'Environment files must never enter the app bundle.');
    assert(!['api', 'fixtures', 'photos'].includes(entry.name), 'Server routes and test/user photos must not be bundled.');
    const path = join(directory, entry.name);
    if (entry.isDirectory()) await checkDirectory(path);
    else if (entry.name.endsWith('.js')) {
      const source = await readFile(path, 'utf8');
      assert(!source.includes('/api/skin-analysis'), 'The retired paid API must not enter the iOS client.');
    }
  }
}
await checkDirectory(assets);
console.log('iOS bundle checks passed: standalone assets, local model hash, licence disclosure, no env/server/fixture data, no paid route.');
