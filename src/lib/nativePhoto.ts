import { Capacitor, registerPlugin } from '@capacitor/core';

export const isNativeApp = () => Capacitor.isNativePlatform();
const MinaPhoto = registerPlugin<{ getPhoto(options: { source: 'camera' | 'photos' }): Promise<{ dataUrl?: string; cancelled?: boolean; analysisMode?: 'automatic' | 'manual-simulator' }> }>('MinaPhoto');

export async function nativePhoto(source: 'camera' | 'photos'): Promise<{ dataUrl: string; manualOnly: boolean } | null> {
  try {
    const photo = await MinaPhoto.getPhoto({ source });
    if (photo.cancelled) return null;
    if (!photo.dataUrl?.startsWith('data:image/jpeg;base64,') || photo.dataUrl.length > 8 * 1024 * 1024) throw new Error('Не удалось подготовить фото. Выбери другой снимок.');
    return { dataUrl: photo.dataUrl, manualOnly: photo.analysisMode === 'manual-simulator' };
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'UNIMPLEMENTED') throw new Error('Системный модуль фото не загрузился. Перезапусти или обнови Mina.');
    const message = error instanceof Error ? error.message : '';
    if (/cancel/i.test(message)) return null;
    throw new Error('Не удалось открыть фото. Проверь доступ к камере или выбери снимок из медиатеки.');
  }
}
