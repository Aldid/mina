import type { InferenceSession, Tensor } from 'onnxruntime-web/wasm';
import { ACNE_MODEL_SHA, acneMarks, letterbox } from './photoObservations';

let session: Promise<InferenceSession> | null = null;
type OrtModule=typeof import('onnxruntime-web/wasm');
let runtime:Promise<OrtModule>|null=null;
function loadRuntime(){
  if(!runtime){
    const url=new URL('/models/acne/ort.wasm.bundle.min.mjs',self.location.origin).href;
    // Native module loading keeps import.meta in module scope instead of a Next 14 asset transform.
    runtime=import(/* webpackIgnore: true */ url) as Promise<OrtModule>;
  }
  return runtime;
}
function loadModel() {
  if (!session) session = (async()=>{
    const base = new URL('/models/acne/',self.location.origin).href;
    const ort=await loadRuntime();
    ort.env.wasm.numThreads=1; ort.env.wasm.proxy=false; ort.env.wasm.wasmPaths=base;
    const response=await fetch(`${base}acne_detector.onnx`);
    if(!response.ok)throw new Error('Model unavailable');
    const bytes=await response.arrayBuffer();
    const digest=await crypto.subtle.digest('SHA-256',bytes);
    const hash=Array.from(new Uint8Array(digest)).map(x=>x.toString(16).padStart(2,'0')).join('');
    if(hash!==ACNE_MODEL_SHA)throw new Error('Model checksum mismatch');
    return ort.InferenceSession.create(bytes,{executionProviders:['wasm'],graphOptimizationLevel:'all'});
  })().catch(error=>{session=null;throw error;});
  return session;
}
self.onmessage=async(event: MessageEvent<{id:number;image:ImageBitmap}>)=>{
  const {id,image}=event.data;
  let tensor:Tensor|null=null;
  const canvas=new OffscreenCanvas(640,640);
  try {
    const detector=await loadModel();
    const ort=await loadRuntime();
    const context=canvas.getContext('2d',{willReadFrequently:true});
    if(!context)throw new Error('Canvas unavailable');
    const geometry=letterbox(image.width,image.height);
    context.fillStyle='rgb(114,114,114)';context.fillRect(0,0,640,640);
    context.drawImage(image,geometry.left,geometry.top,geometry.resizedWidth,geometry.resizedHeight);
    const rgb=context.getImageData(0,0,640,640).data, channel=640*640;
    const data=new Float32Array(channel*3);
    for(let i=0;i<channel;i++){data[i]=rgb[i*4]/255;data[channel+i]=rgb[i*4+1]/255;data[2*channel+i]=rgb[i*4+2]/255;}
    tensor=new ort.Tensor('float32',data,[1,3,640,640]);
    const output=await detector.run({[detector.inputNames[0]]:tensor});
    try {
      const result=output[detector.outputNames[0]];
      const marks=acneMarks(result.data as Float32Array,result.dims,image.width,image.height);
      self.postMessage({id,marks});
    } finally { Object.values(output).forEach(value=>value.dispose()); }
  } catch {
    self.postMessage({id,error:'Не удалось запустить подсветку на устройстве. Можно отметить участки вручную или попробовать снова.'});
  } finally { tensor?.dispose();image.close();canvas.width=0;canvas.height=0; }
};
