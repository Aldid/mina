import type { ReviewedPhoto } from '../lib/photoObservations';
import { photoAnalysisInfo } from '../lib/photoMetadata';

export function PhotoAnalysisStatus({ photo }: { photo: Pick<ReviewedPhoto, 'metadata'> }) {
  const info = photoAnalysisInfo(photo);
  return <section className="mina-photo-analysis" aria-label="Статус анализа">
    <p><strong>{info.title}</strong></p>
    <p>{info.description}</p>
  </section>;
}
