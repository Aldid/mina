# Mina — iPhone skin journal and everyday care

Mina is a Russian-language local wellness prototype built around a face photo, editable model suggestions and a daily journal. The primary target is a separate iPhone app, with a shared Next.js web preview. Photos are processed on-device. No paid analysis API or API key is required for the active flow. This is a local research prototype, not a diagnostic service or a release-ready licensed product.

## iPhone app

The Capacitor project is in `ios/App/App.xcodeproj`. Four bottom-navigation screens separate Today, Photos, Care and Journal; data controls are in Settings. Local assets and both models are bundled into the app, with no running Next.js server required. A custom Swift PHPicker bridge selects one image without requesting access to the entire photo library. See [iOS build and handoff](docs/ios/README.md) for commands, data flow and remaining release requirements.

```bash
npm run build:ios
npm run check:ios
npm run ios:open
```

## Current photo experience

1. “Добавить фото” opens a file picker or an explicitly started camera. JPG/PNG/WebP inputs are limited to 5 MB and 20 MP and reduced to a maximum side of 960 px.
2. A real MediaPipe Face Landmarker runs in a Worker. No face or multiple faces requires another frame. Separate rules check size, centering, eye-line tilt, extreme exposure and basic detail. These are capture heuristics, not skin measurements or a guarantee of useful skin detail.
3. When capture checks pass, a real one-class YOLOv8s ONNX model suggests possible visible acne regions. CPU/WASM inference runs in a separate Worker. A loading or inference error offers a retry or explicitly manual annotation, never a fictional successful analysis. A detected single face with imperfect capture checks can also be reviewed manually.
4. The user removes suggestions, adds marks, undoes edits or clears them. Keyboard users can move the manual cursor with arrows and add a mark with Enter/Space. Zero suggestions means the model did not confidently identify regions; it does not mean healthy skin.
5. “Подтвердить отметки” opens “Твоё наблюдение”: the prepared photo, saved analysis status, retained AI suggestions and manually added marks, that day's reported sensations/context, and an explained care focus. It keeps the prepared JPEG and confirmed geometry in the current session and records only `photoReviewed: true` for the frame's original addition day, including when confirmation crosses midnight. It does not complete care steps, invent sensations, infer severity or prescribe new ingredients. The next action opens the relevant sensation log or care plan.
6. A separate “Сохранить фото на устройстве” action stores that photo and its confirmed marks. Saved photos can be opened and compared side by side. Comparison has no automatic improvement score: lighting, angle and capture quality can change appearances. Displayed dates are addition times in Mina, not original capture dates.

The “Демо” and Perfect Corp tabs are removed from the active photo flow. Legacy components remain in the source tree and do not describe current product functionality.

### Result screen

“Твоё наблюдение” separates the source of each observation. Retained model suggestions use solid green frames; manual marks use dashed plum frames and a separate legend count. These are counts in the confirmed annotation, not the original model output or a severity metric. Empty annotation does not establish healthy skin.

New photos capture their local addition day and IANA timezone before asynchronous inference/review. That day and the displayed addition timestamp stay stable after travel; result, photo-review fact and care/log handoffs use the same day. The result reads the live diary, not an immutable historical care report. Sensations and context remain distinct, and missing entries are never recreated. The focus uses existing `careForSymptoms` rules; boxes cannot change care. Photos from an older or unsupported metadata format remain viewable with their marks, show UTC time and an unknown status, and are not automatically joined to diary entries. Reading them never rewrites their stored records. Their explicitly labelled follow-up actions open today's log/care instead.

The result and review show “ИИ выполнен”, “Ручная разметка” or “ИИ недоступен”. Completion is stored even when there are zero boxes or all suggestions were removed. Completed records retain the model ID and SHA-256; manual/unavailable records retain a bounded reason. Intel-simulator manual mode is labelled unavailable, not completed. No health score is introduced.

This screen adds no new model, Notino integration, external call or persistent field. It does not store an immutable historical clinical report: dated journal entries can be edited later, which updates the displayed summary. Original photo capture time is still unknown.

## Models, assets and release limitation

- Face model: MediaPipe Face Landmarker float16 v1; `@mediapipe/tasks-vision` pinned to 1.2.0. Assets and notices live in `public/models/face`.
- Experimental skin detector: `mufasabrownie/glowlytics-skin-models/acne_detector.onnx`, pinned revision `a1bbdb624b6045bdb1503050c56045728f2efaf0`, 44,745,921 bytes. SHA-256: `de7b25f3d1e2af69ee18f2b55cb6d93edf3c8dd29662a1c64cf8d903c3fa8526`.
- Detector runtime: `onnxruntime-web` 1.31.1, CPU/WASM, one thread. Matching ESM/WASM assets and the official runtime licence are served from `public/models/acne`.
- Input is RGB 640×640 with letterboxing; output is `[1,5,8400]`. Postprocessing uses a 0.25 score threshold and 0.45 NMS IoU, maps boxes to the prepared image and discards invalid/padding-only boxes. Scores are not probabilities of a correct diagnosis and are not displayed as health percentages.
- Models/runtime are loaded from Mina's own origin; no face photo, filename, landmarks or journal is sent with these downloads. The detector's hash is checked before session creation. Worker cancellation, timeouts and image/canvas cleanup protect against stale results after closing or replacing a photo. The face Worker is released before loading the skin detector.

**Unresolved licence discrepancy:** the detector's uploader card says MIT, while embedded ONNX metadata says AGPL-3.0/Ultralytics. The current use is a local personal prototype. Do not claim an unconditional MIT licence, change Mina's licence, publicly deploy or redistribute this model as part of a release until the discrepancy and applicable obligations are resolved. See `public/models/acne/NOTICE.md`. The setup script downloads the pinned model and verifies its hash; downloaded model assets must not be treated as cleared for release.

The model has one class, `acne`. It does not measure hydration, barrier health, skin age, pigmentation, causes or clinical severity. A small prior trial on six unique public inputs plus repeats produced some plausible boxes and many misses; all retained scores were below 0.50. This is neither clinical validation nor a measured accuracy/recall result. Full browser evaluation across skin tones, mobile hardware, lighting and different browsers remains outstanding.

## Privacy and independent storage choices

**Session photo:** the active application processes frames in browser memory. Selecting, analysing or confirming a photo does not automatically persist it. Reloading loses an unsaved photo. Closing the modal stops camera tracks, cancels Workers, clears canvases and releases object URLs. Prepared photos are re-encoded without the original filename or EXIF metadata.

**Optional photo archive:** only the explicit per-photo save action writes a prepared JPEG Blob, dimensions, addition time, ID, confirmed mark geometry/source and version-2 metadata (original local day/timezone, analysis status and model ID/hash or bounded reason) to IndexedDB (`mina.photos.v1`). The database is not reset or silently migrated. Up to 20 photos, at most 2 MiB each, are allowed. Raw model scores/errors, landmarks, original filename/EXIF and journal history are excluded. Invalid new metadata is rejected; unsupported stored metadata is left untouched and displayed without a guessed day/status. Success is reported only after the transaction commits. Each saved photo has a separate deletion confirmation. Deleting it retains textual diary entries; another open tab can still hold a copy in memory.

**Text diary:** starts in session mode. “Сохранять на этом устройстве” separately enables versioned localStorage (`mina.journal.v1`) for dates, reported sensations/context, independent AM/PM step IDs, evening comfort and the boolean photo-review fact. It never stores images, bounding boxes or inferred metrics. Disabling/resetting diary saving does not delete the separate photo archive. Unreadable saved entries are not silently overwritten; storage errors are reported.

The archive and diary are specific to this origin and browser profile. There is no account or server backup. People with access to the profile may view saved data; clearing site data can remove it. Different ports/hostnames have different archives. These application-level controls do not guarantee physical secure erasure or that the browser/OS never writes memory to disk. Asset/font requests can still use the network; this is local photo processing, not a completely offline application.

## Daily journal

- Browse local calendar dates and earlier weeks; return to today.
- Record sensations and context. Discomfort takes priority over a comfortable-skin selection when explaining the care focus; context is not asserted to be a cause.
- Three basic morning steps and two evening steps, independently completed, with expandable instructions. Nothing is pre-completed or prescribed from the photo.
- Evening comfort and weekly summaries reflect actual entries, including a human-confirmed photo-review fact. Missing entries are not interpreted as comfort, and missed days do not reset a streak.
- Educational notes link to American Academy of Dermatology sources. Software rule tests do not clinically validate cosmetic advice.

## Run locally

```bash
npm install
npm run prepare:face
npm run prepare:acne
npm run dev
```

The preparation scripts download/verify pinned assets if missing. Expect roughly 57 MB for the skin detector and its runtime, plus the separate face assets. First-use loading can take longer than inference. Open the local URL printed by Next.js, usually [http://localhost:3000](http://localhost:3000). No API key is needed.

```bash
npm test
npm run build
```

`prebuild` prepares both asset groups. Tests cover the actual postprocessor, malformed output rejection, manual mark bounds, atomic archive limits, restore/delete/error paths, journal whitelisting and asynchronous Worker cancellation, plus existing daily-care, face-check and legacy adapter rules. Browser checks are needed for real inference, modal interactions, responsive layouts and persistence. Real camera hardware has not been tested in this change.

## Legacy paid integration

The old Perfect Corp adapter and tests remain available in source, but its UI is not mounted. The route is disabled by default even if an old `PERFECT_CORP_API_KEY` exists: it additionally requires `PERFECT_CORP_ENABLED=true`. The current product does not offer or trigger that paid path. Do not enable it as a silent fallback. This change made no provider calls or purchases. Its earlier integration details and limitations remain in `HANDOFF_CODEX_2026-10-28.md`.

## Project map

- `src/app/page.tsx`: photo entry, daily journal and handoff to sensations.
- `src/components/ScannerModal.tsx`: file/camera capture, checks, model progress and cancellation.
- `src/components/PhotoReview.tsx`, `PhotoFrame.tsx`: editable normalized marks and image lifecycle.
- `src/components/PhotoDiary.tsx`: explicit saving, gallery, comparison and per-photo deletion.
- `src/components/PhotoResult.tsx`, `src/lib/photoResult.ts`: result presentation, source separation, local-day journal association and care handoff.
- `src/lib/photoMetadata.ts`, `src/components/PhotoAnalysisStatus.tsx`: immutable addition-day context, versioned analysis provenance, safe legacy handling and user-visible status.
- `src/lib/acne.worker.ts`, `acneScanner.ts`: actual ONNX inference and Worker lifecycle.
- `src/lib/photoObservations.ts`: detector postprocessing and annotation validation.
- `src/lib/photoStorage.ts`: validated, transactional IndexedDB archive.
- `src/lib/face.worker.ts`, `faceScanner.ts`, `faceCheck.ts`: landmarks and capture heuristics.
- `src/lib/dailyCare.ts`, `journalStorage.ts`, `useJournal.ts`, `weeklyReview.ts`: daily rules and separate text persistence.
- `tests/testPhotoFlow.ts`: new annotation, archive, journal and cancellation checks.
- `scripts/prepare-acne-assets.mjs`: pinned model/runtime preparation and hash verification.

## AMD AI League

This browser implementation does not demonstrate an AMD-specific workload, ROCm optimisation, NPU acceleration or compliance with a particular Match. Verify the selected Match's current full brief before submission: [official challenge page](https://lablab.ai/ai-hackathons/amd-lablab-ai-academy-challenge). No AMD benchmark or award eligibility is claimed.

## Educational sources

- [AAD: Face washing 101](https://www.aad.org/public/everyday-care/skin-care-basics/care/face-washing-101)
- [AAD: How to test skin care products](https://www.aad.org/public/everyday-care/skin-care-secrets/prevent-skin-problems/test-skin-care-products)
- [AAD: How to apply sunscreen](https://www.aad.org/public/everyday-care/sun-protection/shade-clothing-sunscreen/how-to-apply-sunscreen)
