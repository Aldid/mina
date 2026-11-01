import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';
import { faceBounds, pixelStats } from './faceCheck';
import type { FaceInference } from './faceCheck';

let model: Promise<FaceLandmarker> | null = null;
function loadModel() {
  if (!model) model = (async () => {
    const base = new URL('/models/face/', self.location.origin).href;
    const files = await FilesetResolver.forVisionTasks(`${base}wasm`, false);
    return FaceLandmarker.createFromOptions(files, {
      baseOptions: { modelAssetPath: `${base}face_landmarker.task`, delegate: 'CPU' },
      runningMode: 'IMAGE', numFaces: 2,
      minFaceDetectionConfidence: .6, minFacePresenceConfidence: .6,
      outputFaceBlendshapes: false, outputFacialTransformationMatrixes: false,
    });
  })().catch(error => { model = null; throw error; });
  return model;
}

self.onmessage = async (event: MessageEvent<{ id: number; image: ImageBitmap }>) => {
  const { id, image } = event.data;
  try {
    const detector = await loadModel();
    const result = detector.detect(image);
    const inference: FaceInference = { faces: result.faceLandmarks, pixels: null };
    if (inference.faces.length === 1) {
      const bounds = faceBounds(inference.faces[0]);
      if (bounds) {
        const x = Math.max(0, Math.min(image.width - 1, bounds.left * image.width));
        const y = Math.max(0, Math.min(image.height - 1, bounds.top * image.height));
        const width = Math.min(image.width - x, (bounds.right - bounds.left) * image.width);
        const height = Math.min(image.height - y, (bounds.bottom - bounds.top) * image.height);
        if (width > 0 && height > 0) {
          const sample = new OffscreenCanvas(64, 64);
          const context = sample.getContext('2d', { willReadFrequently: true });
          if (context) {
            context.drawImage(image, x, y, width, height, 0, 0, 64, 64);
            inference.pixels = pixelStats(context.getImageData(0, 0, 64, 64).data, 64, 64);
          }
          sample.width = 0; sample.height = 0;
        }
      }
    }
    self.postMessage({ id, result: inference });
  } catch {
    self.postMessage({ id, error: 'Не удалось запустить модель в этом браузере. Проверь доступность приложения и попробуй ещё раз или открой современный Chrome / Safari.' });
  } finally { image.close(); }
};
