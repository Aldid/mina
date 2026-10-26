'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Camera,
  Upload,
  Sparkles,
  X,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react';
import { SkinMetrics, ScanResult } from '../types';
import { MINA_PRESETS, analyzeImageHeuristics, generateSkincareProtocol } from '../lib/skinEngine';

interface ScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanComplete: (result: ScanResult) => void;
}

export const ScannerModal: React.FC<ScannerModalProps> = ({
  isOpen,
  onClose,
  onScanComplete,
}) => {
  const [activeTab, setActiveTab] = useState<'presets' | 'camera' | 'upload'>('presets');
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanStep, setScanStep] = useState<string>('');

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
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' },
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
    if (isOpen && activeTab === 'camera') {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen, activeTab, startCamera, stopCamera]);

  if (!isOpen) return null;

  const executeScan = (metrics: SkinMetrics, source: 'webcam' | 'upload' | 'preset') => {
    setIsScanning(true);
    setScanStep('Анализируем текстуру и светоотражение кожи...');

    setTimeout(() => {
      setScanStep('Определяем уровень влаги и баланс Т-зоны...');
    }, 700);

    setTimeout(() => {
      setScanStep('Анализируем чистоту пор и барьер...');
    }, 1450);

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
      onClose();
    }, 2200);
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
    executeScan(metrics, 'webcam');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const imgUrl = event.target?.result as string;
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
          executeScan(metrics, 'upload');
        }
      };
      img.src = imgUrl;
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-t-[32px] sm:rounded-[32px] max-w-lg w-full max-h-[90vh] overflow-y-auto p-5 sm:p-6 space-y-4 shadow-2xl border border-rose-100">
        {/* Header */}
        <div className="flex items-center justify-between pb-1 border-b border-rose-50">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-rose-50 text-[#ff5b79] flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </span>
            <div>
              <h3 className="text-sm font-bold text-stone-900">
                AI Бьюти-чекап Mina
              </h3>
              <p className="text-[11px] text-stone-400">
                Выбери способ обновления показателей кожи
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-500 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-3 gap-1 p-1 bg-stone-50 rounded-2xl border border-stone-100">
          <button
            type="button"
            onClick={() => setActiveTab('presets')}
            className={`py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'presets'
                ? 'bg-white text-[#ff5b79] shadow-xs'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            Готовые типажи
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('camera')}
            className={`py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'camera'
                ? 'bg-white text-[#ff5b79] shadow-xs'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            Камера
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            className={`py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'upload'
                ? 'bg-white text-[#ff5b79] shadow-xs'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            Загрузить фото
          </button>
        </div>

        {/* Loading overlay during scan */}
        {isScanning && (
          <div className="p-8 text-center space-y-3">
            <div className="w-12 h-12 mx-auto rounded-full border-4 border-rose-100 border-t-[#ff5b79] animate-spin" />
            <p className="text-xs font-bold text-[#ff5b79] animate-pulse">{scanStep}</p>
          </div>
        )}

        {/* 1. PRESETS TAB */}
        {!isScanning && activeTab === 'presets' && (
          <div className="space-y-2.5">
            {MINA_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => executeScan(preset.sampleMetrics, 'preset')}
                className="w-full text-left p-3.5 rounded-2xl bg-stone-50/70 hover:bg-rose-50/50 border border-stone-100 hover:border-rose-200 transition-all flex items-center justify-between group active:scale-[0.99]"
              >
                <div className="flex items-center gap-3">
                  <span className="w-9 h-9 rounded-xl bg-white flex items-center justify-center text-lg shadow-2xs border border-rose-100/60">
                    {preset.icon}
                  </span>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-xs font-bold text-stone-900 group-hover:text-[#ff5b79] transition-colors">
                        {preset.title}
                      </h4>
                      <span className="text-[10px] font-semibold px-2 py-0.2 rounded-full bg-rose-50 text-[#ff5b79]">
                        {preset.previewMetrics.score}% Glow
                      </span>
                    </div>
                    <p className="text-[11px] text-stone-500 line-clamp-1 mt-0.5">
                      {preset.subtitle}
                    </p>
                  </div>
                </div>

                <ArrowRight className="w-4 h-4 text-stone-400 group-hover:text-[#ff5b79] group-hover:translate-x-0.5 transition-all" />
              </button>
            ))}
          </div>
        )}

        {/* 2. CAMERA TAB */}
        {!isScanning && activeTab === 'camera' && (
          <div className="space-y-3">
            <div className="relative aspect-4/3 w-full rounded-2xl overflow-hidden bg-stone-900 flex items-center justify-center border border-rose-200">
              <video
                ref={videoRef}
                playsInline
                muted
                className={`w-full h-full object-cover transform scale-x-[-1] ${
                  isCameraActive ? 'block' : 'hidden'
                }`}
              />

              {!isCameraActive && (
                <div className="p-6 text-center space-y-2">
                  <Camera className="w-8 h-8 text-rose-300 mx-auto" />
                  <p className="text-xs text-white/80">
                    {cameraError || 'Камера готова к включению'}
                  </p>
                  <button
                    type="button"
                    onClick={startCamera}
                    className="px-4 py-2 rounded-full bg-[#ff5b79] text-white text-xs font-bold shadow-xs"
                  >
                    Включить камеру
                  </button>
                </div>
              )}

              {isCameraActive && (
                <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
                  <div className="w-44 h-56 border-2 border-dashed border-rose-300 rounded-[50%] animate-pulse" />
                </div>
              )}
            </div>

            {isCameraActive && (
              <button
                type="button"
                onClick={handleCaptureWebcam}
                className="w-full py-3 rounded-full bg-[#ff5b79] hover:bg-[#f43f68] text-white text-xs font-bold shadow-md active:scale-95 transition-all"
              >
                Сделать снимок и запустить диагностику
              </button>
            )}
          </div>
        )}

        {/* 3. UPLOAD TAB */}
        {!isScanning && activeTab === 'upload' && (
          <div className="p-6 border-2 border-dashed border-rose-200 rounded-2xl text-center space-y-3 bg-rose-50/30">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*"
              className="hidden"
            />
            <Upload className="w-8 h-8 text-[#ff5b79] mx-auto" />
            <div>
              <h4 className="text-xs font-bold text-stone-900">
                Загрузить фото лица
              </h4>
              <p className="text-[11px] text-stone-400 mt-0.5">
                PNG, JPG без макияжа при естественном освещении
              </p>
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 rounded-full bg-white hover:bg-stone-50 border border-rose-200 text-[#ff5b79] text-xs font-bold shadow-2xs"
            >
              Выбрать фото на устройстве
            </button>
          </div>
        )}

        <div className="flex items-center justify-center gap-1.5 text-[10px] text-stone-400 pt-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>100% Приватно • Фото обрабатывается в RAM браузера</span>
        </div>
      </div>
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};
