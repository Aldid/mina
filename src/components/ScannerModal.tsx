'use client';
import React,{useCallback,useEffect,useRef,useState} from 'react';
import {Camera,Upload,X,ShieldCheck,ChevronRight,Check,CircleAlert} from 'lucide-react';
import {assessFace,type FaceCheckReport,type FaceInference} from '../lib/faceCheck';
import type {FaceScanner} from '../lib/faceScanner';
import type {AcneScanner} from '../lib/acneScanner';
import {ACNE_MODEL_ID,ACNE_MODEL_SHA,MAX_PHOTO_BYTES,type PhotoAnalysis,type PhotoMark,type ReviewedPhoto} from '../lib/photoObservations';
import {photoAddition,photoMetadata,type PhotoAddition} from '../lib/photoMetadata';
import {PhotoReview} from './PhotoReview';
import {isNativeApp,nativePhoto} from '../lib/nativePhoto';

interface Props{isOpen:boolean;onClose:()=>void;onPhotoComplete:(photo:ReviewedPhoto)=>void;}
type Tab='upload'|'camera';
const FOCUSABLE='button:not([disabled]), summary, [href], input:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function ScannerModal({isOpen,onClose,onPhotoComplete}:Props){
  const [tab,setTab]=useState<Tab>('upload');
  const [cameraActive,setCameraActive]=useState(false),[cameraStarting,setCameraStarting]=useState(false);
  const [error,setError]=useState<string|null>(null);
  const [stage,setStage]=useState<'face'|'highlights'|null>(null);
  const [native,setNative]=useState(false),[nativePicking,setNativePicking]=useState(false);
  useEffect(()=>setNative(isNativeApp()),[]);
  const [faceCheck,setFaceCheck]=useState<{inference:FaceInference;report:FaceCheckReport}|null>(null);
  const [draft,setDraft]=useState<ReviewedPhoto|null>(null);
  const dialogRef=useRef<HTMLDivElement>(null),videoRef=useRef<HTMLVideoElement>(null),canvasRef=useRef<HTMLCanvasElement>(null),previewRef=useRef<HTMLCanvasElement>(null);
  const inputRef=useRef<HTMLInputElement>(null),streamRef=useRef<MediaStream|null>(null);
  const faceScanner=useRef<FaceScanner|null>(null),acneScanner=useRef<AcneScanner|null>(null);
  const operation=useRef(0),cameraRequest=useRef(0),additionRef=useRef<PhotoAddition|null>(null);
  const imageRef=useRef<HTMLImageElement|null>(null),urlRef=useRef<string|null>(null),closeRef=useRef(onClose);
  useEffect(()=>{closeRef.current=onClose;},[onClose]);
  const stopCamera=useCallback(()=>{
    cameraRequest.current++;streamRef.current?.getTracks().forEach(track=>track.stop());streamRef.current=null;
    if(videoRef.current)videoRef.current.srcObject=null;
    setCameraActive(false);setCameraStarting(false);
  },[]);
  const releaseImage=useCallback(()=>{
    if(imageRef.current){imageRef.current.onload=null;imageRef.current.onerror=null;imageRef.current.src='';imageRef.current=null;}
    if(urlRef.current)URL.revokeObjectURL(urlRef.current);urlRef.current=null;
  },[]);
  const cancel=useCallback(()=>{
    operation.current++;faceScanner.current?.dispose();faceScanner.current=null;acneScanner.current?.dispose();acneScanner.current=null;
    releaseImage();stopCamera();
    for(const canvas of [canvasRef.current,previewRef.current])if(canvas){canvas.width=0;canvas.height=0;}
    additionRef.current=null;setStage(null);setFaceCheck(null);setDraft(null);setNativePicking(false);
  },[releaseImage,stopCamera]);
  const close=useCallback(()=>{cancel();setError(null);closeRef.current();},[cancel]);
  useEffect(()=>{
    if(!isOpen){cancel();return;}
    setError(null);const previousFocus=document.activeElement,overflow=document.body.style.overflow;
    document.body.style.overflow='hidden';dialogRef.current?.focus();
    const keydown=(event:KeyboardEvent)=>{
      if(event.key==='Escape'){event.preventDefault();close();}
      if(event.key!=='Tab')return;
      const elements=Array.from(dialogRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE)||[]).filter(el=>el.getClientRects().length>0);
      const first=elements[0],last=elements[elements.length-1];
      if(!first){event.preventDefault();dialogRef.current?.focus();}
      else if(!dialogRef.current?.contains(document.activeElement)){event.preventDefault();(event.shiftKey?last:first).focus();}
      else if(event.shiftKey&&(document.activeElement===first||document.activeElement===dialogRef.current)){event.preventDefault();last.focus();}
      else if(!event.shiftKey&&(document.activeElement===last||document.activeElement===dialogRef.current)){event.preventDefault();first.focus();}
    };
    document.addEventListener('keydown',keydown);
    return()=>{document.removeEventListener('keydown',keydown);document.body.style.overflow=overflow;cancel();if(previousFocus instanceof HTMLElement&&previousFocus.isConnected)previousFocus.focus();};
  },[isOpen,cancel,close]);
  useEffect(()=>{
    if(!faceCheck||draft||stage||!canvasRef.current||!previewRef.current)return;
    const frame=canvasRef.current,preview=previewRef.current;preview.width=frame.width;preview.height=frame.height;
    const context=preview.getContext('2d');if(!context)return;context.drawImage(frame,0,0);context.fillStyle='#79e8ce';
    for(const face of faceCheck.inference.faces)for(const point of face){context.beginPath();context.arc(point.x*preview.width,point.y*preview.height,Math.max(.8,preview.width/480),0,Math.PI*2);context.fill();}
    document.getElementById('mina-face-check-title')?.focus({preventScroll:true});
  },[faceCheck,draft,stage]);
  useEffect(()=>{const body=dialogRef.current?.querySelector<HTMLElement>('.mina-checkup-body');if(body)body.scrollTop=0;},[draft]);
  const createDraft=async(marks:PhotoMark[],analysis:PhotoAnalysis,token:number)=>{
    const frame=canvasRef.current,addition=additionRef.current;if(!frame?.width||!frame.height||!addition)return;
    const width=frame.width,height=frame.height;
    const image=await new Promise<Blob>((resolve,reject)=>frame.toBlob(blob=>blob?resolve(blob):reject(new Error('Не удалось подготовить снимок. Попробуй другой файл.')),'image/jpeg',.9));
    if(token!==operation.current)return;
    if(image.size>MAX_PHOTO_BYTES)throw new Error('Подготовленный снимок слишком большой. Выбери другое фото.');
    setDraft({id:`photo-${crypto.randomUUID()}`,capturedAt:addition.capturedAt,width,height,image,marks,metadata:photoMetadata(addition,analysis)});
    setFaceCheck(null);frame.width=0;frame.height=0;
  };
  const runHighlights=async(token:number)=>{
    const frame=canvasRef.current;if(!frame)return;setStage('highlights');
    const {AcneScanner}=await import('../lib/acneScanner');if(token!==operation.current)return;
    const scanner=new AcneScanner();acneScanner.current=scanner;
    try{const marks=await scanner.analyze(frame);if(token===operation.current)await createDraft(marks,{status:'completed',modelId:ACNE_MODEL_ID,modelSha256:ACNE_MODEL_SHA},token);}
    finally{scanner.dispose();if(acneScanner.current===scanner)acneScanner.current=null;}
  };
  const checkFrame=async(source:FaceCheckReport['source'])=>{
    const frame=canvasRef.current;if(!frame)return;
    const token=++operation.current;stopCamera();releaseImage();setError(null);setStage('face');
    try{
      const {FaceScanner}=await import('../lib/faceScanner');if(token!==operation.current)return;
      faceScanner.current=new FaceScanner();
      const inference=await faceScanner.current.analyze(frame);if(token!==operation.current)return;
      const report=assessFace(inference,frame.width,frame.height,source);setFaceCheck({inference,report});
      faceScanner.current.dispose();faceScanner.current=null;
      if(report.ready)await runHighlights(token);
    }catch(cause){if(token===operation.current)setError(cause instanceof Error?cause.message:'Не удалось проверить фото. Попробуй ещё раз.');}
    finally{if(token===operation.current){faceScanner.current?.dispose();faceScanner.current=null;setStage(null);}}
  };
  const manualReview=async()=>{
    const token=++operation.current;setError(null);
    const analysis:PhotoAnalysis=faceCheck?.report.ready?{status:'unavailable',reason:'model-error'}:{status:'manual',reason:'capture-quality'};
    try{await createDraft([],analysis,token);}catch(cause){if(token===operation.current)setError(cause instanceof Error?cause.message:'Не удалось открыть фото.');}
  };
  const startCamera=async()=>{
    if(native){await chooseNative('camera');return;}
    setError(null);setCameraStarting(true);const request=++cameraRequest.current;
    try{
      if(!navigator.mediaDevices?.getUserMedia)throw new Error();
      const stream=await navigator.mediaDevices.getUserMedia({video:{width:{ideal:1280},height:{ideal:960},facingMode:'user'},audio:false});
      if(request!==cameraRequest.current||!videoRef.current){stream.getTracks().forEach(track=>track.stop());return;}
      streamRef.current=stream;videoRef.current.srcObject=stream;await videoRef.current.play();
      if(request===cameraRequest.current){setCameraActive(true);setCameraStarting(false);}
    }catch{if(request===cameraRequest.current){stopCamera();setError('Не удалось включить камеру. Проверь разрешение браузера или выбери готовое фото.');}}
  };
  const capture=()=>{
    const frame=canvasRef.current,video=videoRef.current;if(!frame||!video?.videoWidth||!video.videoHeight){setError('Камера ещё готовится. Попробуй через секунду.');return;}
    const scale=Math.min(1,960/Math.max(video.videoWidth,video.videoHeight));frame.width=Math.round(video.videoWidth*scale);frame.height=Math.round(video.videoHeight*scale);
    const context=frame.getContext('2d');if(!context){setError('Не удалось подготовить кадр. Попробуй загрузить фото.');return;}
    context.translate(frame.width,0);context.scale(-1,1);context.drawImage(video,0,0,frame.width,frame.height);context.setTransform(1,0,0,1,0,0);
    additionRef.current=photoAddition();void checkFrame('webcam');
  };
  const loadImage=(src:string,source:FaceCheckReport['source'],token:number,manualOnly=false)=>{
    const image=new Image();imageRef.current=image;
    image.onload=()=>{
      if(token!==operation.current)return;
      if(!image.width||!image.height||image.width*image.height>20_000_000){releaseImage();setError('Выбери фото до 20 мегапикселей.');return;}
      const frame=canvasRef.current;if(!frame)return;
      const scale=Math.min(1,960/Math.max(image.width,image.height));frame.width=Math.round(image.width*scale);frame.height=Math.round(image.height*scale);
      const context=frame.getContext('2d');if(!context){releaseImage();setError('Не удалось прочитать фото.');return;}
      context.drawImage(image,0,0,frame.width,frame.height);additionRef.current=photoAddition();
      if(manualOnly){releaseImage();void createDraft([],{status:'unavailable',reason:'simulator'},token).catch(()=>{if(token===operation.current)setError('Не удалось подготовить фото.');});}
      else void checkFrame(source);
    };
    image.onerror=()=>{if(token===operation.current){releaseImage();setError('Не удалось прочитать фото. Выбери другой файл.');}};
    image.src=src;
  };
  const chooseNative=async(source:'camera'|'photos')=>{
    cancel();setError(null);setNativePicking(true);const token=operation.current;
    try{const image=await nativePhoto(source);if(image&&token===operation.current)loadImage(image.dataUrl,source==='camera'?'webcam':'upload',token,image.manualOnly);}
    catch(cause){if(token===operation.current)setError(cause instanceof Error?cause.message:'Не удалось открыть фото.');}
    finally{if(token===operation.current)setNativePicking(false);}
  };
  const choosePhoto=()=>{if(native)void chooseNative('photos');else inputRef.current?.click();};
  const upload=(event:React.ChangeEvent<HTMLInputElement>)=>{
    const file=event.target.files?.[0];event.target.value='';if(!file)return;cancel();setError(null);
    if(!['image/jpeg','image/png','image/webp'].includes(file.type)){setError('Выбери JPG, PNG или WebP.');return;}
    if(file.size>5*1024*1024){setError('Выбери фото до 5 МБ.');return;}
    urlRef.current=URL.createObjectURL(file);loadImage(urlRef.current,'upload',operation.current);
  };
  const busy=Boolean(stage||nativePicking);
  if(!isOpen)return null;
  return <div className="mina-checkup-overlay" onClick={event=>{if(event.target===event.currentTarget)close();}}>
    <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="mina-checkup-title" aria-describedby="mina-checkup-description" tabIndex={-1} className="mina-checkup-dialog">
      <div className="mina-checkup-heading"><h2 id="mina-checkup-title">Фото кожи</h2><button type="button" aria-label="Закрыть фото" className="mina-checkup-close" onClick={close}><X aria-hidden="true" size={20}/></button></div>
      <div className="mina-checkup-body">
        <p id="mina-checkup-description" className="mina-checkup-intro">Проверим кадр и подсветим возможные участки. Затем ты проверишь разметку. Всё обрабатывается на устройстве.</p>
        {!draft&&<div className="mina-checkup-methods" role="group" aria-label="Источник фото">{(['upload','camera'] as const).map(value=><button type="button" key={value} disabled={busy} aria-pressed={tab===value} onClick={()=>{if(tab!==value){cancel();setError(null);setTab(value);}}}>{value==='upload'?'Выбрать фото':'Камера'}</button>)}</div>}
        {error&&<p role="alert" className="mina-checkup-error">{error}</p>}
        {busy&&<div className="mina-checkup-loading" role="status"><span className="animate-spin motion-reduce:animate-none" aria-hidden="true"/><p>{nativePicking?'Открываем системное окно фото…':stage==='face'?'Проверяем лицо и качество кадра…':'Ищем возможные участки…'}</p><p className="mina-checkup-section-note">{native?'Модели находятся в приложении.':'При первом запуске загружаем локальные модели.'} Фото остаётся на устройстве. Можно закрыть окно, чтобы отменить обработку.</p></div>}
        {!busy&&draft&&<PhotoReview key={draft.id} photo={draft} onConfirm={marks=>{onPhotoComplete({...draft,marks});close();}}/>}
        {!busy&&!draft&&faceCheck&&<section className="mina-face-check" aria-labelledby="mina-face-check-title">
          <h3 id="mina-face-check-title" tabIndex={-1}>{faceCheck.report.facesDetected===0?'Лицо не найдено':faceCheck.report.facesDetected>1?'Нужно одно лицо':faceCheck.report.ready?'Кадр проверен':'Уточним кадр'}</h3>
          <div className="mina-face-preview"><canvas ref={previewRef} aria-label="Проверенный кадр с опорными точками"/></div>
          <ul className="mina-capture-checks">{faceCheck.report.checks.map(check=><li key={check.id}>{check.pass?<Check aria-hidden="true" size={18}/>:<CircleAlert aria-hidden="true" size={18}/>}<span><strong>{check.label}</strong><span>{check.hint}</span></span></li>)}</ul>
          <div className="mina-face-actions">
            {faceCheck.report.ready&&<button type="button" className="mina-primary" onClick={()=>{const token=++operation.current;setError(null);void runHighlights(token).catch(cause=>{if(token===operation.current)setError(cause instanceof Error?cause.message:'Подсветка недоступна.');}).finally(()=>{if(token===operation.current)setStage(null);});}}>Повторить подсветку</button>}
            {faceCheck.report.facesDetected===1&&<button type="button" className="mina-face-retry" onClick={()=>void manualReview()}>Отметить вручную</button>}
            <button type="button" className="mina-face-retry" onClick={()=>{if(tab==='upload')choosePhoto();else cancel();}}>{tab==='upload'?'Выбрать другое фото':'Сделать новый снимок'}</button>
          </div>
          <p className="mina-checkup-section-note">Проверки помогают подготовить снимок. Они не оценивают здоровье кожи.</p>
        </section>}
        {!busy&&!draft&&!faceCheck&&tab==='upload'&&<section className="mina-photo-choice" aria-labelledby="mina-photo-title"><Upload aria-hidden="true" size={28} strokeWidth={1.5}/><h3 id="mina-photo-title">Одно лицо, ровный свет</h3><p>Анфас, без фильтров, при мягком свете перед лицом. Снимок должен быть чётким, а лицо — целиком в кадре.</p><button type="button" className="mina-primary" onClick={choosePhoto}>{native?'Выбрать из медиатеки':'Открыть фото'}</button><p className="mina-photo-limits">{native?'Откроется системный выбор одного снимка.':'JPG, PNG или WebP · до 5 МБ и 20 Мп'}</p></section>}
        {!busy&&!draft&&!faceCheck&&tab==='camera'&&<section className="mina-camera-choice" aria-label="Съёмка с камерой"><div className={`mina-camera-preview ${cameraActive?'is-active':''}`}><video ref={videoRef} playsInline muted aria-label="Предпросмотр камеры" className={cameraActive?'':'hidden'}/>{!cameraActive&&<div className="mina-camera-start"><Camera aria-hidden="true" size={28}/><h3>Подготовь мягкий свет</h3><p>Доступ к камере запросим после нажатия. Снимок никуда не отправляется.</p><button type="button" className="mina-primary" disabled={cameraStarting} onClick={()=>void startCamera()}>{cameraStarting?'Подключаем…':native?'Открыть камеру':'Включить камеру'}</button></div>}</div>{cameraActive&&<button type="button" className="mina-primary" onClick={capture}>Сделать снимок</button>}</section>}
        {!draft&&<details className="mina-checkup-explanation"><summary>Как работает подсветка<ChevronRight aria-hidden="true" size={16}/></summary><p>Сначала MediaPipe проверяет лицо и кадр, затем отдельная модель выделяет возможные участки. Она может ошибаться и пропускать изменения. Рамки нужно проверить самостоятельно; их отсутствие не определяет состояние кожи. Увлажнение, барьер и диагноз по этой подсветке не измеряем.</p></details>}
        <p className="mina-checkup-privacy"><ShieldCheck aria-hidden="true" size={16}/><span>Фото не отправляется на сервер. Сохранить его в Mina можно отдельным действием после проверки.</span></p>
      </div>
    </div>
    <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={upload} aria-label="Выбрать файл фото" className="hidden"/>
    <canvas ref={canvasRef} className="hidden" aria-hidden="true"/>
  </div>;
}
