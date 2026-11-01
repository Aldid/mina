'use client';
import { useEffect, useState } from 'react';
import { PhotoFrame } from './PhotoFrame';
import { PhotoAnalysisStatus } from './PhotoAnalysisStatus';
import { MAX_MARKS, manualMark, type PhotoMark, type ReviewedPhoto } from '../lib/photoObservations';

export function PhotoReview({photo,onConfirm}:{photo:ReviewedPhoto;onConfirm:(marks:PhotoMark[])=>void}){
  const [history,setHistory]=useState<PhotoMark[][]>([photo.marks]);
  const [adding,setAdding]=useState(false);
  const marks=history[history.length-1];
  const edit=(next:PhotoMark[])=>setHistory(old=>[...old.slice(-49),next]);
  useEffect(()=>{document.getElementById('mina-photo-review-title')?.focus({preventScroll:true});},[]);
  useEffect(()=>{if(adding)document.querySelector<HTMLElement>('.mina-photo-review .mina-photo-frame')?.focus({preventScroll:true});},[adding]);
  return <section className="mina-photo-review" aria-labelledby="mina-photo-review-title">
    <h3 id="mina-photo-review-title" tabIndex={-1}>Проверь отметки на фото</h3>
    <PhotoAnalysisStatus photo={photo}/>
    <p>{photo.metadata?.analysis.status==='completed'?(photo.marks.length?'Модель подсветила возможные участки. Убери лишнее и добавь то, что хочешь отслеживать.':'Модель не смогла уверенно выделить участки. Можно добавить свои отметки.'):'Можно отметить участки самостоятельно.'}</p>
    <PhotoFrame photo={photo} marks={marks} adding={adding} onRemove={id=>edit(marks.filter(mark=>mark.id!==id))} onAdd={(x,y)=>{if(marks.length<MAX_MARKS)edit([...marks,manualMark(x,y)]);}} alt="Фото для проверки отметок"/>
    <div className="mina-photo-editor-actions">
      <button type="button" aria-pressed={adding} disabled={marks.length>=MAX_MARKS} onClick={()=>setAdding(old=>!old)}>{adding?'Завершить добавление':'Добавить отметку'}</button>
      <button type="button" disabled={history.length<2} onClick={()=>setHistory(old=>old.slice(0,-1))}>Отменить изменение</button>
      <button type="button" disabled={!marks.length} onClick={()=>edit([])}>Убрать все</button>
    </div>
    {adding&&<p className="mina-checkup-section-note" role="status">Коснись нужного места на фото. С клавиатуры: перейди к фото, используй стрелки и Enter.</p>}
    <p className="mina-checkup-section-note">Нажми на рамку, чтобы убрать её. Сейчас отметок: {marks.length}. Их количество не определяет состояние кожи — модель может ошибаться и пропускать участки.</p>
    <div className="mina-photo-review-confirm">
      <button type="button" className="mina-primary w-full" onClick={()=>onConfirm(marks)}>Подтвердить отметки</button>
      <p className="mina-checkup-section-note">Фото останется в этой сессии. Сохранение на устройстве — отдельным действием.</p>
    </div>
  </section>;
}
