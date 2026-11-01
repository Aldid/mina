import { MAX_PHOTOS, MAX_PHOTO_BYTES, validMarks, type ReviewedPhoto } from './photoObservations';
import { cleanPhotoMetadata } from './photoMetadata';

export class PhotoStorageError extends Error {}
function cleanPhoto(value:ReviewedPhoto,reading=false):ReviewedPhoto{
  if(!value || typeof value.id!=='string' || !/^[a-zA-Z0-9-]{1,100}$/.test(value.id) ||
    typeof value.capturedAt!=='string' || !Number.isFinite(Date.parse(value.capturedAt)) ||
    !Number.isInteger(value.width)||!Number.isInteger(value.height)||value.width<1||value.height<1||value.width>960||value.height>960||
    !(value.image instanceof Blob)||value.image.type!=='image/jpeg'||value.image.size<1||value.image.size>MAX_PHOTO_BYTES||!validMarks(value.marks))throw new PhotoStorageError('Снимок не удалось проверить. Выбери его заново.');
  let metadata:ReviewedPhoto['metadata'];
  if(value.metadata!==undefined){
    try{
      metadata=cleanPhotoMetadata(value.metadata,value.capturedAt);
      if(metadata.analysis.status!=='completed'&&value.marks.some(mark=>mark.source==='model'))throw new Error('Analysis and marks disagree');
    }
    catch{metadata=undefined;if(!reading)throw new PhotoStorageError('Данные добавления или анализа фото не удалось проверить. Выбери снимок заново.');}
  }
  // Reading a legacy/unknown metadata format never rewrites or deletes the stored record.
  return {id:value.id,capturedAt:value.capturedAt,width:value.width,height:value.height,image:value.image,
    marks:value.marks.map(m=>({id:m.id,x:m.x,y:m.y,width:m.width,height:m.height,source:m.source})),...(metadata?{metadata}:{})};
}
export class PhotoStore {
  constructor(private factory:()=>IDBFactory=()=>window.indexedDB,private name='mina.photos.v1'){}
  private open():Promise<IDBDatabase>{
    return new Promise((resolve,reject)=>{
      let request:IDBOpenDBRequest;
      try{request=this.factory().open(this.name,1);}catch{reject(new PhotoStorageError('Хранилище фото недоступно. Снимок можно просмотреть в этой сессии.'));return;}
      request.onupgradeneeded=()=>{if(!request.result.objectStoreNames.contains('photos'))request.result.createObjectStore('photos',{keyPath:'id'});};
      let blocked=false;
      request.onblocked=()=>{blocked=true;reject(new PhotoStorageError('Закрой другие вкладки Mina и попробуй открыть фото снова.'));};
      request.onerror=()=>reject(new PhotoStorageError('Не удалось открыть сохранённые фото. Попробуй ещё раз.'));
      request.onsuccess=()=>{if(blocked){request.result.close();return;}request.result.onversionchange=()=>request.result.close();resolve(request.result);};
    });
  }
  async list():Promise<ReviewedPhoto[]>{
    const db=await this.open();
    return new Promise((resolve,reject)=>{
      const transaction=db.transaction('photos','readonly');
      const request=transaction.objectStore('photos').getAll();
      transaction.oncomplete=()=>{db.close();try{resolve(request.result.map(value=>cleanPhoto(value,true)).sort((a,b)=>b.capturedAt.localeCompare(a.capturedAt)));}catch{reject(new PhotoStorageError('Сохранённые фото не удалось прочитать. Они не были удалены.'));}};
      transaction.onerror=()=>{db.close();reject(new PhotoStorageError('Не удалось прочитать фото. Попробуй ещё раз.'));};
      transaction.onabort=()=>{db.close();reject(new PhotoStorageError('Чтение фото прервано. Попробуй ещё раз.'));};
    });
  }
  async save(value:ReviewedPhoto):Promise<void>{
    const photo=cleanPhoto(value),db=await this.open();
    return new Promise((resolve,reject)=>{
      const transaction=db.transaction('photos','readwrite'),store=transaction.objectStore('photos');
      let full=false;
      const existing=store.get(photo.id);
      existing.onsuccess=()=>{
        const count=store.count();
        count.onsuccess=()=>{
          if(!existing.result&&count.result>=MAX_PHOTOS){full=true;transaction.abort();return;}
          store.put(photo);
        };
      };
      transaction.oncomplete=()=>{db.close();resolve();};
      transaction.onabort=()=>{db.close();reject(new PhotoStorageError(full?'Сохранено 20 снимков. Удали один, чтобы добавить новый.':'Не удалось сохранить фото. Возможно, на устройстве мало места. Снимок остаётся в этой сессии.'));};
    });
  }
  async remove(id:string):Promise<void>{
    const db=await this.open();
    return new Promise((resolve,reject)=>{
      const transaction=db.transaction('photos','readwrite');transaction.objectStore('photos').delete(id);
      transaction.oncomplete=()=>{db.close();resolve();};
      transaction.onabort=()=>{db.close();reject(new PhotoStorageError('Фото не удалено. Попробуй ещё раз.'));};
    });
  }
}
