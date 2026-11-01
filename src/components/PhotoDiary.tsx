'use client';
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { Camera, ScanFace } from 'lucide-react';
import { PhotoFrame, usePhotoUrl } from './PhotoFrame';
import { PhotoResult } from './PhotoResult';
import { PhotoStore } from '../lib/photoStorage';
import { photoDayLabel, photoLabel, type ReviewedPhoto } from '../lib/photoObservations';
import type { DailyJournal } from '../lib/dailyCare';

function Thumbnail({photo,onClick,selected}:{photo:ReviewedPhoto;onClick:()=>void;selected:boolean}){
  const url=usePhotoUrl(photo.image);
  return <button type="button" aria-label={`Открыть фото: ${photoLabel(photo)}`} aria-pressed={selected} onClick={onClick}>{url&&<img src={url} width={64} height={72} alt=""/>}<span>{photoDayLabel(photo)}</span></button>;
}
export function PhotoDiary({current,journal,today,onOpen,onClear,onOpenJournal,onOpenRoutine,emptyFollowUp}:{current:ReviewedPhoto|null;journal:DailyJournal;today:string;onOpen:()=>void;onClear:()=>void;onOpenJournal:(date:string)=>void;onOpenRoutine:(date:string)=>void;emptyFollowUp?:ReactNode}){
  const [store]=useState(()=>new PhotoStore());
  const [photos,setPhotos]=useState<ReviewedPhoto[]>([]);
  const [selected,setSelected]=useState<string|null>(null);
  const [issue,setIssue]=useState<string|null>(null);
  const [notice,setNotice]=useState<string|null>(null);
  const [busy,setBusy]=useState(false);
  const [loaded,setLoaded]=useState(false);
  const [confirmDelete,setConfirmDelete]=useState<ReviewedPhoto|null>(null);
  const [comparing,setComparing]=useState(false);
  const [leftId,setLeftId]=useState(''),[rightId,setRightId]=useState('');
  const alive=useRef(false),revision=useRef(0),channel=useRef<BroadcastChannel|null>(null);
  const refresh=useCallback(async()=>{
    const request=++revision.current;
    try{const value=await store.list();if(alive.current&&request===revision.current){setPhotos(value);setLoaded(true);}}
    catch(error){if(alive.current&&request===revision.current){setIssue(error instanceof Error?error.message:'Не удалось открыть фото.');setLoaded(true);}}
  },[store]);
  useEffect(()=>{
    alive.current=true;void refresh();
    if(typeof BroadcastChannel!=='undefined'){channel.current=new BroadcastChannel('mina-photos');channel.current.onmessage=()=>void refresh();}
    return()=>{alive.current=false;revision.current++;channel.current?.close();channel.current=null;};
  },[refresh]);
  useEffect(()=>{setSelected(null);setComparing(false);setConfirmDelete(null);setNotice(null);},[current?.id]);
  useEffect(()=>{if(photos.length<2)setComparing(false);},[photos.length]);
  useEffect(()=>{if(confirmDelete)document.getElementById('mina-photo-delete-title')?.focus();},[confirmDelete]);
  const active=photos.find(p=>p.id===selected)||current||photos[0];
  const saved=active&&photos.some(p=>p.id===active.id);
  const left=photos.find(p=>p.id===leftId)||photos[photos.length-1];
  const right=photos.find(p=>p.id===rightId&&p.id!==left?.id)||photos.find(p=>p.id!==left?.id);
  const save=async()=>{
    if(!active||busy)return;setBusy(true);setIssue(null);setNotice(null);
    try{await store.save(active);if(!alive.current)return;await refresh();channel.current?.postMessage('changed');setNotice('Фото сохранено на этом устройстве.');}
    catch(error){if(alive.current)setIssue(error instanceof Error?error.message:'Фото не сохранено.');}
    finally{if(alive.current)setBusy(false);}
  };
  const remove=async()=>{
    if(!confirmDelete||busy)return;const target=confirmDelete;setBusy(true);setIssue(null);
    try{await store.remove(target.id);if(!alive.current)return;if(current?.id===target.id)onClear();setSelected(null);setConfirmDelete(null);setComparing(false);await refresh();channel.current?.postMessage('changed');setNotice('Фото удалено с этого устройства.');}
    catch(error){if(alive.current)setIssue(error instanceof Error?error.message:'Фото не удалено.');}
    finally{if(alive.current)setBusy(false);}
  };
  return <><section className="mina-photo-diary" aria-labelledby="mina-photo-diary-title">
    <div className="mina-photo-heading"><h1 id="mina-photo-diary-title" tabIndex={-1}>{active?'Твоё наблюдение':'Фото твоей кожи'}</h1><span>На устройстве</span></div>
    {active?<div className="mina-photo-current">
      <p className="mina-photo-date">Добавлено {photoLabel(active)}</p>
      <PhotoResult photo={active} journal={journal} today={today} onOpenJournal={onOpenJournal} onOpenRoutine={onOpenRoutine}/>
      <div className="mina-photo-controls">
        {!saved?<button type="button" className="mina-photo-save" disabled={busy||!loaded} onClick={()=>void save()}>Сохранить фото на устройстве</button>:<span className="mina-photo-saved">Сохранено на устройстве</span>}
        <button type="button" disabled={busy} onClick={onOpen}>Добавить новое фото</button>
        {saved?<button type="button" disabled={busy} onClick={()=>{setConfirmDelete(active);setNotice(null);}}>Удалить это фото</button>:<button type="button" onClick={onClear}>Убрать фото из сессии</button>}
      </div>
      {!saved&&<p className="mina-photo-small">Сохранение добровольное: до 20 снимков с отметками на этом устройстве. Их можно увидеть при доступе к Mina. Без сохранения фото исчезнет после перезапуска.</p>}
    </div>:<div className="mina-photo-start">
      <div className="mina-photo-empty-frame" aria-hidden="true"><ScanFace size={58} strokeWidth={1}/></div>
      <h2>Начни со снимка</h2>
      <p>Сравнивай фото со своими ощущениями. Модель поможет заметить возможные участки, а ты проверишь отметки.</p>
      <button type="button" className="mina-primary" onClick={onOpen}><Camera aria-hidden="true" size={18}/>Добавить фото</button>
      <p className="mina-photo-small">Обработка на устройстве, без оплаты за анализ. Сохранение фото — по твоему решению.</p>
    </div>}
    {issue&&<div role="alert" className="mina-checkup-error">{issue}<button type="button" className="mina-face-retry" onClick={()=>{setIssue(null);void refresh();}}>Попробовать открыть фото снова</button></div>}
    {notice&&<p role="status" className="mina-photo-small">{notice}</p>}
    {confirmDelete&&<div className="mina-storage-confirm" role="group" aria-labelledby="mina-photo-delete-title"><h3 id="mina-photo-delete-title" tabIndex={-1}>Удалить фото от {photoLabel(confirmDelete)}?</h3><p>Снимок и его разметка будут удалены из Mina на этом устройстве. Записи ощущений останутся. Другие открытые окна могут держать копию в памяти.</p><div><button type="button" disabled={busy} onClick={()=>void remove()}>Да, удалить фото</button><button type="button" disabled={busy} onClick={()=>setConfirmDelete(null)}>Оставить фото</button></div></div>}
    {photos.length>0&&<div className="mina-photo-archive">
      <h2>Сохранённые снимки</h2><p>Фото хранятся отдельно от текстового дневника. Даты показывают время добавления в Mina, а не дату съёмки.</p>
      <div className="mina-photo-thumbnails">{photos.map(photo=><Thumbnail key={photo.id} photo={photo} selected={active?.id===photo.id} onClick={()=>{setSelected(photo.id);setNotice(null);setConfirmDelete(null);setComparing(false);}}/>)}</div>
      {photos.length>=2&&<button type="button" className="mina-face-retry" aria-expanded={comparing} onClick={()=>{setComparing(old=>!old);setLeftId(photos[photos.length-1].id);setRightId(photos[0].id);}}>Сравнить два снимка</button>}
      {comparing&&left&&right&&<div className="mina-photo-comparison" aria-label="Сравнение двух сохранённых фото">
        <p>Свет и ракурс меняют вид кожи. Сравнивай снимки при похожих условиях.</p>
        <div className="mina-photo-pair">{[{label:'Первое фото',photo:left,value:left.id,other:right.id,onChange:setLeftId},{label:'Второе фото',photo:right,value:right.id,other:left.id,onChange:setRightId}].map(item=><div key={item.label}><label>{item.label}<select aria-label={item.label} value={item.value} onChange={event=>item.onChange(event.target.value)}>{photos.map(photo=><option key={photo.id} value={photo.id} disabled={photo.id===item.other}>{photoLabel(photo)}</option>)}</select></label><PhotoFrame photo={item.photo}/></div>)}</div>
      </div>}
    </div>}
  </section>{!active&&emptyFollowUp}</>;
}
