import { mkdir, readFile, writeFile, copyFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const packageRoot = path.join(root, 'node_modules/@mediapipe/tasks-vision');
const pkg = JSON.parse(await readFile(path.join(packageRoot, 'package.json'), 'utf8'));
if (pkg.version !== '1.2.0') throw new Error('Review runtime assets before changing the pinned MediaPipe version.');
const destination = path.join(root, 'public/models/face');
await mkdir(path.join(destination, 'wasm'), { recursive: true });
const names = ['vision_wasm_internal.js', 'vision_wasm_internal.wasm', 'vision_wasm_nosimd_internal.js', 'vision_wasm_nosimd_internal.wasm'];
for (const name of names) await copyFile(path.join(packageRoot, 'wasm', name), path.join(destination, 'wasm', name));
const modelUrl = 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task';
const expectedHash = '64184e229b263107bc2b804c6625db1341ff2bb731874b0bcc2fe6544e0bc9ff';
const modelPath = path.join(destination, 'face_landmarker.task');
let bytes;
try { bytes = await readFile(modelPath); } catch {
  const response = await fetch(modelUrl, { signal: AbortSignal.timeout(60_000) });
  if (!response.ok) throw new Error(`Model download failed: ${response.status}`);
  bytes = Buffer.from(await response.arrayBuffer());
}
if (createHash('sha256').update(bytes).digest('hex') !== expectedHash) throw new Error('Model checksum mismatch; model was not installed.');
await writeFile(modelPath, bytes);
await writeFile(path.join(destination, 'manifest.json'), JSON.stringify({ runtime: '@mediapipe/tasks-vision@1.2.0', model: modelUrl, sha256: expectedHash }, null, 2) + '\n');
console.log('Pinned Face Landmarker model and SIMD/non-SIMD runtime assets are ready.');
