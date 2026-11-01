'use client';
import { useEffect, useState } from 'react';
import type { PhotoMark, ReviewedPhoto } from '../lib/photoObservations';

export function usePhotoUrl(blob:Blob|null){
  const [value,setValue]=useState<{blob:Blob;url:string}|null>(null);
  useEffect(()=>{if(!blob){setValue(null);return;}const url=URL.createObjectURL(blob);setValue({blob,url});return()=>URL.revokeObjectURL(url);},[blob]);
  return value?.blob===blob?value.url:'';
}
export function PhotoFrame({photo,marks=photo.marks,onRemove,onAdd,adding=false,alt='Фото с твоими отметками'}:{
  photo:ReviewedPhoto;marks?:PhotoMark[];onRemove?:(id:string)=>void;onAdd?:(x:number,y:number)=>void;adding?:boolean;alt?:string;
}){
  const url=usePhotoUrl(photo.image);
  const [cursor,setCursor]=useState({x:.5,y:.5});
  return <div className={`mina-photo-frame ${adding?'is-adding':''}`} style={{aspectRatio:`${photo.width}/${photo.height}`,maxWidth:Math.round(360*photo.width/photo.height)}}
    role="group" aria-label={adding?'Место новой отметки. Стрелки перемещают курсор, Enter добавляет.':alt} tabIndex={adding?0:undefined}
    onClick={event=>{if(!adding||!onAdd||event.target instanceof Element&&event.target.closest('button'))return;const rect=event.currentTarget.getBoundingClientRect();onAdd((event.clientX-rect.left)/rect.width,(event.clientY-rect.top)/rect.height);}}
    onKeyDown={event=>{if(!adding||event.target!==event.currentTarget)return;const moves:Record<string,[number,number]>={ArrowLeft:[-.025,0],ArrowRight:[.025,0],ArrowUp:[0,-.025],ArrowDown:[0,.025]};if(moves[event.key]){event.preventDefault();const [x,y]=moves[event.key];setCursor(old=>({x:Math.max(.03,Math.min(.97,old.x+x)),y:Math.max(.03,Math.min(.97,old.y+y))}));}else if(event.key==='Enter'||event.key===' '){event.preventDefault();onAdd?.(cursor.x,cursor.y);}}}>
    {url&&<img src={url} width={photo.width} height={photo.height} alt={alt} draggable={false}/>}
    {marks.map((mark,index)=>onRemove?<button key={mark.id} type="button" className={`mina-photo-mark${mark.source==='manual'?' is-manual':''}`} aria-label={`Убрать отметку ${index+1}`} style={{left:`${mark.x*100}%`,top:`${mark.y*100}%`,width:`${mark.width*100}%`,height:`${mark.height*100}%`}} onClick={event=>{event.stopPropagation();onRemove(mark.id);}}><span aria-hidden="true">{index+1}</span></button>
      :<span key={mark.id} className={`mina-photo-mark is-static${mark.source==='manual'?' is-manual':''}`} aria-hidden="true" style={{left:`${mark.x*100}%`,top:`${mark.y*100}%`,width:`${mark.width*100}%`,height:`${mark.height*100}%`}}><span>{index+1}</span></span>)}
    {adding&&<span className="mina-photo-cursor" aria-hidden="true" style={{left:`${cursor.x*100}%`,top:`${cursor.y*100}%`}}>+</span>}
  </div>;
}
