import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const target=path.join(root,'public/models/acne');
const runtime=path.join(root,'node_modules/onnxruntime-web');
const version=JSON.parse(await fs.readFile(path.join(runtime,'package.json'),'utf8')).version;
if(version!=='1.31.1')throw new Error('Use pinned onnxruntime-web 1.31.1');
await fs.mkdir(target,{recursive:true});
for(const name of ['ort.wasm.bundle.min.mjs','ort-wasm-simd-threaded.mjs','ort-wasm-simd-threaded.wasm'])await fs.copyFile(path.join(runtime,'dist',name),path.join(target,name));
const model=path.join(target,'acne_detector.onnx');
const url='https://huggingface.co/mufasabrownie/glowlytics-skin-models/resolve/a1bbdb624b6045bdb1503050c56045728f2efaf0/acne_detector.onnx';
let bytes;
try{bytes=await fs.readFile(model);}catch{
  const response=await fetch(url,{signal:AbortSignal.timeout(120000)});
  if(!response.ok)throw new Error('Could not download pinned local prototype model');
  bytes=Buffer.from(await response.arrayBuffer());
}
const digest=crypto.createHash('sha256').update(bytes).digest('hex');
if(digest!=='de7b25f3d1e2af69ee18f2b55cb6d93edf3c8dd29662a1c64cf8d903c3fa8526')throw new Error('Acne model SHA-256 mismatch');
await fs.writeFile(model,bytes);
await fs.writeFile(path.join(target,'manifest.json'),JSON.stringify({runtime:'onnxruntime-web',version,modelUrl:url,sha256:digest,scope:'local experimental prototype; resolve MIT/AGPL discrepancy before publishing'},null,2));
const licensePath=path.join(target,'ONNX_RUNTIME_LICENSE.txt');
try{await fs.access(licensePath);}catch{
  const response=await fetch('https://raw.githubusercontent.com/microsoft/onnxruntime/v1.31.1/LICENSE',{signal:AbortSignal.timeout(30000)});
  if(!response.ok)throw new Error('Could not retrieve official ONNX Runtime licence');
  await fs.writeFile(licensePath,await response.text());
}
console.log('Pinned local highlight model and matching WASM assets are ready.');
