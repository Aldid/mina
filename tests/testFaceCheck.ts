import assert from 'node:assert/strict';
import { assessFace, pixelStats } from '../src/lib/faceCheck';
import type { FacePoint, FaceInference } from '../src/lib/faceCheck';

let passed = 0;
function test(name: string, run: () => void) { run(); passed += 1; console.log(`PASS ${name}`); }
function face(): FacePoint[] {
  const points = Array.from({ length: 478 }, (_, i) => ({ x: .5 + .2 * Math.cos(i * Math.PI * 2 / 478), y: .5 + .3 * Math.sin(i * Math.PI * 2 / 478), z: 0 }));
  points[33] = { x: .4, y: .42, z: 0 }; points[263] = { x: .6, y: .42, z: 0 };
  return points;
}
function inference(): FaceInference { return { faces: [face()], pixels: { brightness: 130, darkFraction: 0, brightFraction: 0, detail: 100 } }; }

test('No face and several faces cannot produce a successful face report', () => {
  const none = assessFace({ faces: [], pixels: null }, 640, 800, 'upload');
  assert.equal(none.ready, false); assert.equal(none.facesDetected, 0); assert.equal(none.landmarkCount, 0);
  const many = assessFace({ faces: [face(), face()], pixels: null }, 640, 800, 'webcam');
  assert.equal(many.ready, false); assert.equal(many.facesDetected, 2);
  assert(many.checks[0].hint.includes('несколько'));
});

test('One valid face can pass capture checks without inventing skin metrics', () => {
  const report = assessFace(inference(), 640, 800, 'upload');
  assert.equal(report.ready, true); assert.equal(report.landmarkCount, 478);
  assert.equal(report.checks.length, 6);
  const serialized = JSON.stringify(report);
  for (const forbidden of ['hydration', 'barrier', 'skinType', 'overallHealthScore', 'landmarks', 'imageData']) assert(!serialized.includes(forbidden));
});

test('Small, clipped and strongly tilted faces receive specific framing guidance', () => {
  const small = inference(); small.faces = [small.faces[0].map(p => ({ ...p, x: .5 + (p.x - .5) * .3, y: .5 + (p.y - .5) * .3 }))];
  assert.equal(assessFace(small, 640, 800, 'upload').checks.find(c => c.id === 'size')?.pass, false);
  const clipped = inference(); clipped.faces[0] = clipped.faces[0].map(p => ({ ...p, x: p.x + .4 }));
  assert.equal(assessFace(clipped, 640, 800, 'upload').checks.find(c => c.id === 'position')?.pass, false);
  const tilted = inference(); tilted.faces[0][33].y += .12;
  assert.equal(assessFace(tilted, 640, 800, 'upload').checks.find(c => c.id === 'tilt')?.pass, false);
});

test('Missing geometry or pixel checks cannot silently pass', () => {
  const invalid = inference(); invalid.faces[0][0].x = NaN;
  assert.equal(assessFace(invalid, 640, 800, 'upload').ready, false);
  const missing = inference(); missing.pixels = null;
  assert.equal(assessFace(missing, 640, 800, 'upload').ready, false);
});

test('Exposure and detail heuristics are independent of landmark detection', () => {
  const dark = inference(); dark.pixels!.brightness = 12;
  assert.equal(assessFace(dark, 640, 800, 'upload').checks.find(c => c.id === 'light')?.pass, false);
  const blurry = inference(); blurry.pixels!.detail = 0;
  assert.equal(assessFace(blurry, 640, 800, 'upload').checks.find(c => c.id === 'detail')?.pass, false);
  assert.equal(assessFace(blurry, 640, 800, 'upload').facesDetected, 1);
  const flat = new Uint8ClampedArray(8 * 8 * 4).fill(128);
  const stats = pixelStats(flat, 8, 8);
  assert(Math.abs(stats.brightness - 128) < .001); assert.equal(stats.detail, 0);
});

console.log(`\n${passed} face-capture rule groups passed. These do not validate dermatology or model accuracy.\n`);
