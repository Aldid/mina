# Local face-check assets

- Runtime: `@mediapipe/tasks-vision` **1.2.0**, Google MediaPipe, Apache-2.0. See `LICENSE.txt`.
- Model: official Face Landmarker bundle, float16, version **1**.
- Source: https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task
- Model SHA-256: `64184e229b263107bc2b804c6625db1341ff2bb731874b0bcc2fe6544e0bc9ff`.
- Overview/model cards: https://developers.google.com/edge/mediapipe/solutions/vision/face_landmarker

Run `npm run prepare:face` after installing dependencies to restore/verify the model and copy the matching SIMD/non-SIMD runtime files. Keep file names unchanged. These are application/model assets; user photos and landmarks are never written here.

The model localizes facial landmarks. It is not a dermatological classifier, identity recognizer, liveness check or diagnostic model. Mina disables expression and transformation-matrix outputs. Capture-quality thresholds are separate application heuristics and have not been validated across devices, lighting conditions or skin tones.
