import assert from 'node:assert/strict';
import {test} from 'node:test';
import {IDBFactory} from 'fake-indexeddb';
import {PhotoStore} from '../src/lib/photoStorage';
import {acneMarks,letterbox,manualMark,validMarks,photoLabel,photoDayLabel,MAX_PHOTO_BYTES,ACNE_MODEL_SHA,type PhotoAnalysis,type ReviewedPhoto} from '../src/lib/photoObservations';
import {updateJournal,emptyEntry,careForSymptoms} from '../src/lib/dailyCare';
import {encodeJournal,decodeJournal} from '../src/lib/journalStorage';
import {summarizeWeek} from '../src/lib/weeklyReview';
import {AcneScanner} from '../src/lib/acneScanner';
import {photoResultContext} from '../src/lib/photoResult';
import {photoAddition,photoMetadata,photoJournalDate,photoAnalysisInfo} from '../src/lib/photoMetadata';

function photo(id='photo-one'):ReviewedPhoto{return{id,capturedAt:'2026-11-01T10:00:00.000Z',width:640,height:480,image:new Blob([new Uint8Array([255,216,255,217])],{type:'image/jpeg'}),marks:[{id:'manual-one',x:.2,y:.3,width:.1,height:.1,source:'manual'}],metadata:{version:2,localDate:'2026-11-01',timeZone:'Europe/Budapest',analysis:{status:'manual',reason:'user-choice'}}};}
function storage(){const factory=new IDBFactory();return{factory,store:new PhotoStore(()=>factory as unknown as globalThis.IDBFactory)};}

test('A saved photo keeps its original journal day and care after travelling to another timezone',async()=>{
  const previousTZ=process.env.TZ;
  try{
    process.env.TZ='Europe/Budapest';
    const value={...photo(),capturedAt:'2026-10-31T23:30:00.000Z',metadata:{version:2 as const,localDate:'2026-11-01',timeZone:'Europe/Budapest',analysis:{status:'completed' as const,modelId:'mina-acne-yolov8s' as const,modelSha256:ACNE_MODEL_SHA}}};
    const journal=updateJournal(updateJournal({},'2026-10-31',{type:'symptom',id:'comfort'}),'2026-11-01',{type:'symptom',id:'burning'});
    const beforeLabel=photoLabel(value),beforeDayLabel=photoDayLabel(value);
    const {store}=storage();await store.save(value);
    process.env.TZ='America/New_York';
    const restored=(await store.list())[0];
    assert.equal(photoResultContext(restored,journal).date,'2026-11-01');
    assert.equal(photoResultContext(restored,journal).plan.gentle,true);
    assert.equal(photoLabel(restored),beforeLabel);assert.equal(photoDayLabel(restored),beforeDayLabel);
  }finally{if(previousTZ===undefined)delete process.env.TZ;else process.env.TZ=previousTZ;}
});
test('A zero-box AI result retains its model and completed status after saving',async()=>{
  const {store}=storage();
  const value={...photo(),marks:[],metadata:{version:2 as const,localDate:'2026-11-01',timeZone:'Europe/Budapest',analysis:{status:'completed' as const,modelId:'mina-acne-yolov8s' as const,modelSha256:ACNE_MODEL_SHA}}};
  await store.save(value);const restored=(await store.list())[0];
  assert.deepEqual(restored.metadata,value.metadata);assert.deepEqual(restored.marks,[]);
});
test('An old photo without its original day stays readable without borrowing diary entries',async()=>{
  const {store}=storage(),oldPhoto=photo();delete oldPhoto.metadata;
  await store.save(oldPhoto);const restored=(await store.list())[0];
  const journal=updateJournal({},'2026-11-01',{type:'symptom',id:'redness'});
  const result=photoResultContext(restored,journal);
  assert.equal(result.date,null);assert.deepEqual(result.sensations,[]);assert.deepEqual(restored.marks,photo().marks);
  assert.equal(photoAnalysisInfo(restored).status,'unknown');assert.match(photoLabel(restored),/UTC$/);
});
test('Confirming after midnight records the photo day rather than the new current day',()=>{
  const addition=photoAddition(new Date('2026-11-01T22:59:59.000Z'),'Europe/Budapest');
  const value={...photo(),capturedAt:addition.capturedAt,metadata:photoMetadata(addition,{status:'manual',reason:'user-choice'})};
  const confirmation=photoAddition(new Date('2026-11-01T23:00:01.000Z'),'Europe/Budapest');
  assert.equal(confirmation.localDate,'2026-11-02');
  const day=photoJournalDate(value);assert.equal(day,'2026-11-01');
  const journal=updateJournal({},day!,{type:'photo-review'});
  assert.equal(journal['2026-11-01'].photoReviewed,true);assert.equal(journal[confirmation.localDate],undefined);
  assert.equal(photoResultContext(value,journal).date,day);
});
test('Manual choice and unavailable AI retain distinct reasons through storage',async()=>{
  const cases:PhotoAnalysis[]=[{status:'manual',reason:'capture-quality'},{status:'manual',reason:'user-choice'},{status:'unavailable',reason:'simulator'},{status:'unavailable',reason:'model-error'}];
  const {store}=storage();
  for(let index=0;index<cases.length;index++){
    const analysis=cases[index];
    const value=photo(`mode-${index}`);value.metadata!.analysis=analysis;await store.save(value);
    const restored=(await store.list()).find(item=>item.id===value.id)!;
    assert.deepEqual(restored.metadata?.analysis,analysis);assert.equal(photoAnalysisInfo(restored).status,analysis.status);
    assert.equal(restored.marks[0].source,'manual');
  }
});
test('Unknown stored metadata remains on disk while the photo opens without a guessed day',async()=>{
  const {factory,store}=storage();await store.save(photo());
  const db=await new Promise<IDBDatabase>((resolve,reject)=>{const request=factory.open('mina.photos.v1',1);request.onsuccess=()=>resolve(request.result as unknown as IDBDatabase);request.onerror=()=>reject(request.error);});
  const raw={...photo(),metadata:{version:99,localDate:'2026-11-01',futureField:'preserve'}};
  try{
    await new Promise<void>((resolve,reject)=>{const tx=db.transaction('photos','readwrite');tx.objectStore('photos').put(raw);tx.oncomplete=()=>resolve();tx.onabort=()=>reject(tx.error);});
    const restored=(await store.list())[0];assert.equal(restored.metadata,undefined);assert.equal(photoResultContext(restored,{}).date,null);
    assert.deepEqual(restored.marks,raw.marks);
    const stored=await new Promise<unknown>((resolve,reject)=>{const tx=db.transaction('photos','readonly');const request=tx.objectStore('photos').get(raw.id);tx.oncomplete=()=>resolve(request.result);tx.onabort=()=>reject(tx.error);});
    assert.deepEqual((stored as {metadata:unknown}).metadata,raw.metadata);
  }finally{db.close();}
});
test('Invalid metadata and contradictory AI provenance never overwrite a saved photo',async()=>{
  const {store}=storage();const valid=photo();await store.save(valid);
  const metadata=valid.metadata!;
  const invalid=[{...metadata,localDate:'2026-11-02'},{...metadata,timeZone:'unknown/zone'},{...metadata,version:99},{...metadata,analysis:{status:'completed',modelId:'test',modelSha256:'bad'}},{...metadata,analysis:{status:'unavailable',reason:'invented'}}];
  for(const value of invalid)await assert.rejects(store.save({...valid,metadata:value} as unknown as ReviewedPhoto));
  await assert.rejects(store.save({...valid,marks:[{...valid.marks[0],source:'model'}]}));
  assert.deepEqual((await store.list())[0].metadata,metadata);
});

test('A photo result uses its local addition day, not another day or the UTC date',()=>{
  const previousTZ=process.env.TZ;process.env.TZ='Europe/Budapest';
  try{
    const value={...photo(),capturedAt:'2026-10-31T23:30:00.000Z'};
    const journal=updateJournal(updateJournal({},'2026-10-31',{type:'symptom',id:'comfort'}),'2026-11-01',{type:'symptom',id:'burning'});
    const result=photoResultContext(value,journal);
    assert.equal(result.date,'2026-11-01');assert.deepEqual(result.sensations.map(item=>item.id),['burning']);assert.equal(result.plan.gentle,true);
    assert.deepEqual(photoResultContext(value,{'2026-10-31':journal['2026-10-31']}).sensations,[]);
  }finally{if(previousTZ===undefined)delete process.env.TZ;else process.env.TZ=previousTZ;}
});
test('Result provenance counts only retained marks and cannot change care or invent comfort',()=>{
  const value=photo();value.marks.push({...value.marks[0],id:'model-retained',source:'model'});
  const journal=updateJournal({},'2026-11-01',{type:'symptom',id:'stress'});
  const result=photoResultContext(value,journal);
  assert.equal(result.modelMarks,1);assert.equal(result.manualMarks,1);assert.deepEqual(result.sensations,[]);assert.deepEqual(result.contexts.map(item=>item.id),['stress']);
  assert.deepEqual(photoResultContext({...value,marks:[]},journal).plan,result.plan);
  assert.deepEqual(photoResultContext(value,{}).plan,careForSymptoms([]));
  assert.equal(journal['2026-11-01'].photoReviewed,undefined);assert.deepEqual(journal['2026-11-01'].completed,{am:[],pm:[]});
});
test('Journal edits update the result without rewriting the photo; discomfort takes precedence',()=>{
  const value=photo(),before=structuredClone(value);
  const journal=updateJournal({},'2026-11-01',{type:'symptom',id:'comfort'});
  assert.deepEqual(photoResultContext(value,journal).sensations.map(item=>item.id),['comfort']);
  const edited=updateJournal(journal,'2026-11-01',{type:'symptom',id:'redness'});
  assert.equal(photoResultContext(value,edited).plan.gentle,true);
  const mixed={...edited,'2026-11-01':{...edited['2026-11-01'],symptoms:['comfort','redness'] as const}};
  assert.deepEqual(photoResultContext(value,{...mixed,'2026-11-01':{...mixed['2026-11-01'],symptoms:[...mixed['2026-11-01'].symptoms]}}).sensations.map(item=>item.id),['redness']);
  assert.deepEqual(value,before);assert.deepEqual(journal['2026-11-01'].symptoms,['comfort']);
});

test('Pinned YOLO layout restores letterboxed coordinates and removes duplicate suggestions',()=>{
  const data=new Float32Array(42000),n=8400;
  for(const [i,score] of [[0,.8],[1,.6],[2,.1]]){data[i]=120;data[n+i]=220;data[2*n+i]=80;data[3*n+i]=40;data[4*n+i]=score;}
  const marks=acneMarks(data,[1,5,n],800,400);
  assert.equal(marks.length,1);assert.equal(marks[0].x,.125);assert.equal(marks[0].y,.125);assert.equal(marks[0].width,.125);assert.equal(marks[0].height,.125);
  assert.equal(letterbox(800,400).top,160);
});
test('Malformed outputs and padding-only detections cannot become accepted marks',()=>{
  assert.throws(()=>acneMarks(new Float32Array(1),[1,1,1],640,480));
  const data=new Float32Array(42000);data[0]=20;data[8400]=20;data[16800]=20;data[25200]=20;data[33600]=.9;
  assert.deepEqual(acneMarks(data,[1,5,8400],800,400),[]);
  data[0]=NaN;assert.deepEqual(acneMarks(data,[1,5,8400],800,400),[]);
});
test('Manual marks stay inside the image; duplicate or invalid geometry is rejected',()=>{
  const mark=manualMark(-5,10);assert(validMarks([mark]));assert.equal(mark.x,0);assert.equal(mark.y,.94);
  assert(!validMarks([mark,mark]));assert(!validMarks([{...mark,width:2}]));
});
test('Photo storage is server-safe and remains empty until explicit save',async()=>{
  let accessed=0;
  const store=new PhotoStore(()=>{accessed++;return new IDBFactory() as unknown as globalThis.IDBFactory;});
  assert.equal(accessed,0);assert.deepEqual(await store.list(),[]);assert.equal(accessed,1);
});
test('Explicit save survives a fresh store and stores only approved fields',async()=>{
  const {factory,store}=storage();
  const value={...photo(),filename:'private-name',landmarks:[1,2,3],rawHealthScore:99,marks:[{...photo().marks[0],score:.95}],metadata:{...photo().metadata,filename:'private-name',analysis:{...photo().metadata!.analysis,rawScores:[.95],rawError:'private-detail'}}} as unknown as ReviewedPhoto;
  await store.save(value);
  const reopened=new PhotoStore(()=>factory as unknown as globalThis.IDBFactory);
  const saved=(await reopened.list())[0];assert.equal(saved.id,value.id);assert(saved.image instanceof Blob);assert.equal(saved.image.size,4);
  assert.deepEqual(saved.marks,photo().marks);
  assert(!('filename'in saved));assert(!('landmarks'in saved));assert(!('rawHealthScore'in saved));
  assert.deepEqual(saved.metadata,photo().metadata);
});
test('Concurrent saves respect the 20-photo limit atomically; overwriting the same ID is idempotent',async()=>{
  const {store}=storage();
  const outcomes=await Promise.allSettled(Array.from({length:22},(_,i)=>store.save(photo(`photo-${i}`))));
  assert.equal(outcomes.filter(r=>r.status==='fulfilled').length,20);
  assert.equal((await store.list()).length,20);
  await store.save(photo('photo-0'));assert.equal((await store.list()).length,20);
});
test('Wrong size, MIME, dimensions or markup never writes a photo',async()=>{
  const {store}=storage();
  for(const value of [
    {...photo(),image:new Blob([new Uint8Array(MAX_PHOTO_BYTES+1)],{type:'image/jpeg'})},
    {...photo(),image:new Blob(['x'],{type:'text/plain'})},
    {...photo(),width:2000},
    {...photo(),marks:[{...photo().marks[0],x:2}]},
  ])await assert.rejects(store.save(value));
  assert.equal((await store.list()).length,0);
});
test('Deleting one stored photo commits without changing the other photo or diary',async()=>{
  const {store}=storage();await store.save(photo('photo-one'));await store.save(photo('photo-two'));
  await store.remove('photo-one');assert.deepEqual((await store.list()).map(p=>p.id),['photo-two']);
});
test('Blocked storage reports failure instead of claiming saved',async()=>{
  const store=new PhotoStore(()=>{throw new Error('blocked');});
  await assert.rejects(store.save(photo()),/недоступно/);await assert.rejects(store.list(),/недоступно/);
});
test('Photo review records only the human-confirmed day and leaves symptoms and routine unchanged',()=>{
  const previous={'2026-10-31':emptyEntry()};const journal=updateJournal(previous,'2026-11-01',{type:'photo-review'});
  assert.equal(journal['2026-11-01'].photoReviewed,true);assert.deepEqual(journal['2026-11-01'].symptoms,[]);
  assert.deepEqual(careForSymptoms(journal['2026-11-01'].symptoms),careForSymptoms([]));
  assert.equal(previous['2026-10-31'].photoReviewed,undefined);
  const encoded=encodeJournal(journal),restored=decodeJournal(encoded);assert.equal(restored['2026-11-01'].photoReviewed,true);
  const week=summarizeWeek(restored,'2026-11-01');assert.equal(week.records.length,1);assert.equal(week.sensationDays,0);assert.equal(week.amComplete,0);assert.equal(week.records[0].photoReviewed,true);
});
test('Cancelling during asynchronous bitmap creation releases the bitmap and sends no photo to a Worker',async()=>{
  const previousWorker=globalThis.Worker,previousBitmap=globalThis.createImageBitmap;
  let sent=0,closed=0,finish!:(value:ImageBitmap)=>void;
  class FakeWorker{onmessage=null;onerror=null;postMessage(){sent++;}terminate(){}}
  globalThis.Worker=FakeWorker as unknown as typeof Worker;
  globalThis.createImageBitmap=(()=>new Promise<ImageBitmap>(resolve=>{finish=resolve;})) as typeof createImageBitmap;
  try{
    const scanner=new AcneScanner();const pending=scanner.analyze({} as HTMLCanvasElement);const rejection=assert.rejects(pending,/отменена/);
    scanner.dispose();finish({close(){closed++;}} as ImageBitmap);await rejection;assert.equal(sent,0);assert.equal(closed,1);
  }finally{globalThis.Worker=previousWorker;globalThis.createImageBitmap=previousBitmap;}
});
