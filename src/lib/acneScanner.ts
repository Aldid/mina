import type { PhotoMark } from './photoObservations';

export class AcneScanner {
  private worker: Worker;
  private disposed=false;
  private pending:{resolve:(marks:PhotoMark[])=>void;reject:(error:Error)=>void;timer:ReturnType<typeof setTimeout>}|null=null;
  private busy=false;
  constructor(){
    this.worker=new Worker(new URL('./acne.worker.ts',import.meta.url),{name:'mina-local-highlights'});
    this.worker.onmessage=(event:MessageEvent<{marks?:PhotoMark[];error?:string}>)=>{
      const pending=this.pending;if(!pending)return;
      clearTimeout(pending.timer);this.pending=null;
      if(event.data.marks)pending.resolve(event.data.marks);else pending.reject(new Error(event.data.error||'Не удалось подготовить подсветку.'));
    };
    this.worker.onerror=()=>this.dispose(new Error('Подсветка не загрузилась. Можно перейти к ручным отметкам.'));
  }
  async analyze(canvas:HTMLCanvasElement):Promise<PhotoMark[]>{
    if(this.disposed||this.busy)throw new Error('Проверка уже идёт или отменена.');
    this.busy=true;
    try{
      const image=await createImageBitmap(canvas);
      if(this.disposed){image.close();throw new Error('Проверка отменена.');}
      return await new Promise((resolve,reject)=>{
        const timer=setTimeout(()=>this.dispose(new Error('Подсветка заняла слишком долго. Можно отметить участки вручную.')),90_000);
        this.pending={resolve,reject,timer};
        try{this.worker.postMessage({id:1,image},[image]);}catch{image.close();this.dispose(new Error('Не удалось передать кадр модели.'));}
      });
    }finally{this.busy=false;}
  }
  dispose(reason=new Error('Подсветка отменена.')){
    this.disposed=true;this.worker.terminate();
    if(this.pending){clearTimeout(this.pending.timer);this.pending.reject(reason);this.pending=null;}
  }
}
