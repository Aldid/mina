'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Camera,
  Upload,
  Sparkles,
  RefreshCw,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Smile,
  Droplets,
  Heart,
  Flower2,
} from 'lucide-react';
import { SkinMetrics, ScanResult } from '../types';
import { MINA_PRESETS, analyzeImageHeuristics, generateSkincareProtocol } from '../lib/skinEngine';

interface ScannerViewProps {
  onScanComplete: (result: ScanResult) => void;
}

export const ScannerView: React.FC<ScannerViewProps> = ({ onScanComplete }) => {
  const [activeTab, setActiveTab] = useState<'camera' | 'presets' | 'upload'>('presets');
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanStep, setScanStep] = useState<string>('');
  const [uploadedImagePreview, setUploadedImagePreview] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  }, []);

  const startCamera = useCallback(async () => {
    setCameraError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Камера не поддерживается вашим браузером.');
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user',
        },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setIsCameraActive(true);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Не удалось подключить камеру.';
      setCameraError(message);
      setIsCameraActive(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'camera') {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [activeTab, startCamera, stopCamera]);

  const executeScanSequence = (metrics: SkinMetrics, source: 'webcam' | 'upload' | 'preset') => {
    setIsScanning(true);
    setScanStep('Сканируем текстуру и светоотражение кожи...');

    setTimeout(() => {
      setScanStep('Определяем уровень увлажненности и баланс Т-зоны...');
    }, 700);

    setTimeout(() => {
      setScanStep('Анализируем чистоту пор и защитный барьер...');
    }, 1400);

    setTimeout(() => {
      setScanStep('Составляем утренний и вечерний ритуал ухода...');
    }, 2100);

    setTimeout(() => {
      const routine = generateSkincareProtocol(metrics);
      const result: ScanResult = {
        id: `scan-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        imageSource: source,
        metrics,
        routine,
      };
      setIsScanning(false);
      onScanComplete(result);
    }, 2800);
  };

  const handleCaptureWebcam = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const metrics = analyzeImageHeuristics(canvas);
    executeScanSequence(metrics, 'webcam');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const imgUrl = event.target?.result as string;
      setUploadedImagePreview(imgUrl);

      const img = new Image();
      img.onload = () => {
        if (!canvasRef.current) return;
        const canvas = canvasRef.current;
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          const metrics = analyzeImageHeuristics(canvas);
          executeScanSequence(metrics, 'upload');
        }
      };
      img.src = imgUrl;
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* Header Intro */}
      <div className="text-center space-y-2 pt-2">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200/80 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-rose-500" />
          <span>Умное бьюти-зеркало Mina</span>
        </div>

        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-stone-900">
          Узнай истинные потребности своей кожи
        </h1>

        <p className="text-xs sm:text-sm text-stone-500 max-w-md mx-auto leading-relaxed">
          Взгляни в камеру или выбери свой типаж — Mina бережно оценит уровень влаги, баланс Т-зоны и подберёт понятный пошаговый уход.
        </p>
      </div>

      {/* Modern Navigation Pills */}
      <div className="flex justify-center">
        <div className="inline-flex p-1 bg-white/90 rounded-full border border-rose-100 shadow-sm text-xs font-semibold text-stone-600 gap-1">
          <button
            type="button"
            onClick={() => setActiveTab('presets')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full transition-all ${
              activeTab === 'presets'
                ? 'bg-rose-500 text-white shadow-xs'
                : 'hover:text-stone-900 hover:bg-rose-50/50'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Готовые типажи</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('camera')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full transition-all ${
              activeTab === 'camera'
                ? 'bg-rose-500 text-white shadow-xs'
                : 'hover:text-stone-900 hover:bg-rose-50/50'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Камера-зеркало</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full transition-all ${
              activeTab === 'upload'
                ? 'bg-rose-500 text-white shadow-xs'
                : 'hover:text-stone-900 hover:bg-rose-50/50'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Загрузить фото</span>
          </button>
        </div>
      </div>

      {/* Scanning Overlay Modal */}
      {isScanning && (
        <div className="fixed inset-0 z-50 bg-stone-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center space-y-5 shadow-2xl border border-rose-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="relative w-20 h-20 mx-auto">
              <div className="w-full h-full rounded-full border-4 border-rose-100 border-t-rose-500 animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-rose-500 animate-pulse" />
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-bold text-stone-900">Бьюти-диагностика Mina</h3>
              <p className="text-xs text-rose-600 font-medium animate-pulse min-h-[32px] flex items-center justify-center">
                {scanStep}
              </p>
            </div>

            <div className="w-full bg-rose-50 h-1.5 rounded-full overflow-hidden">
              <div className="bg-rose-500 h-full rounded-full w-3/4 animate-pulse" />
            </div>
          </div>
        </div>
      )}

      {/* TAB 1: PRESETS (Primary for instant preview without requiring webcam) */}
      {activeTab === 'presets' && (
        <div className="space-y-4">
          <div className="text-center pb-1">
            <p className="text-xs text-stone-500">
              Нажми на подходящий типаж, чтобы сразу увидеть полный разбор и персональный уход:
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {MINA_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => executeScanSequence(preset.sampleMetrics, 'preset')}
                className="group text-left p-4 rounded-2xl bg-white/90 hover:bg-white border border-rose-100/80 hover:border-rose-300 shadow-xs hover:shadow-md transition-all active:scale-[0.99] flex flex-col justify-between"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="w-8 h-8 rounded-xl bg-rose-50 text-base flex items-center justify-center border border-rose-100/60 shadow-2xs">
                      {preset.icon}
                    </span>
                    <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200/60">
                      {preset.tag}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-stone-900 group-hover:text-rose-600 transition-colors">
                      {preset.title}
                    </h3>
                    <p className="text-xs text-stone-500 leading-snug mt-1">
                      {preset.subtitle}
                    </p>
                  </div>
                </div>

                <div className="pt-3 mt-3 border-t border-rose-50 flex items-center justify-between text-xs">
                  <span className="font-semibold text-rose-600 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    <span>{preset.previewMetrics.score} Glow Score</span>
                  </span>
                  <span className="text-stone-400 group-hover:text-rose-600 flex items-center gap-1 font-medium transition-colors">
                    <span>Смотреть уход</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: LIVE CAMERA MIRROR */}
      {activeTab === 'camera' && (
        <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-rose-100 p-5 shadow-sm space-y-4">
          <div className="relative aspect-4/3 w-full rounded-2xl overflow-hidden bg-stone-900 flex items-center justify-center border-4 border-rose-100/60 shadow-inner">
            <video
              ref={videoRef}
              playsInline
              muted
              className={`w-full h-full object-cover transform scale-x-[-1] ${
                isCameraActive ? 'block' : 'hidden'
              }`}
            />

            {/* Offline or Error state */}
            {!isCameraActive && (
              <div className="absolute inset-0 bg-gradient-to-b from-stone-50 to-rose-50/40 p-6 flex flex-col items-center justify-center text-center space-y-4">
                <div className="w-14 h-14 rounded-full bg-rose-100/80 flex items-center justify-center text-rose-500 shadow-inner">
                  <Camera className="w-7 h-7" />
                </div>
                <div className="space-y-1 max-w-xs">
                  <h4 className="text-sm font-bold text-stone-800">
                    {cameraError ? 'Доступ к камере заблокирован' : 'Зеркало ожидает включения'}
                  </h4>
                  <p className="text-xs text-stone-500 leading-relaxed">
                    {cameraError || 'Разреши доступ к веб-камере для мгновенного биометрического скана лица.'}
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    type="button"
                    onClick={startCamera}
                    className="px-4 py-2 rounded-full bg-rose-500 hover:bg-rose-600 text-white text-xs font-semibold shadow-xs transition-all"
                  >
                    Включить камеру
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('presets')}
                    className="px-4 py-2 rounded-full bg-white hover:bg-stone-50 text-stone-700 text-xs font-semibold border border-rose-200 transition-all"
                  >
                    Выбрать готовый типаж
                  </button>
                </div>
              </div>
            )}

            {/* Live Camera Face Target Guide */}
            {isCameraActive && (
              <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
                {/* Subtle Face Oval Outline */}
                <div className="w-48 h-64 sm:w-56 sm:h-72 border-2 border-dashed border-rose-300/80 rounded-[50%] shadow-[0_0_20px_rgba(244,63,94,0.3)] animate-pulse" />
                <span className="mt-3 px-3 py-1 rounded-full bg-black/60 backdrop-blur-xs text-white text-[11px] font-medium tracking-wide">
                  Расположи лицо по центру овала
                </span>
              </div>
            )}
          </div>

          {/* Action button */}
          {isCameraActive && (
            <div className="flex justify-center pt-1">
              <button
                type="button"
                onClick={handleCaptureWebcam}
                className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white text-xs font-bold shadow-md hover:shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>Начать бьюти-скан лица</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: UPLOAD SELFIE */}
      {activeTab === 'upload' && (
        <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-rose-100 p-6 shadow-sm space-y-4 text-center">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="image/*"
            className="hidden"
          />

          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-rose-200/80 hover:border-rose-400 rounded-2xl p-8 cursor-pointer transition-colors space-y-3 bg-rose-50/20 hover:bg-rose-50/40"
          >
            <div className="w-12 h-12 rounded-full bg-rose-100 mx-auto flex items-center justify-center text-rose-500">
              <Upload className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h4 className="text-sm font-bold text-stone-800">
                Загрузи свое фото или селфи
              </h4>
              <p className="text-xs text-stone-500 max-w-xs mx-auto">
                Нажми для выбора файла (PNG, JPG). Лучше всего подходит селфи при дневном свете без макияжа.
              </p>
            </div>

            <span className="inline-block text-[11px] text-rose-600 font-semibold underline">
              Выбрать изображение на устройстве
            </span>
          </div>

          <div className="flex items-center justify-center gap-2 text-[11px] text-stone-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>100% Приватно: фото анализируется в памяти браузера и никуда не отправляется</span>
          </div>
        </div>
      )}

      {/* Hidden processing canvas */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};
