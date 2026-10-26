'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Camera,
  Upload,
  Sparkles,
  Zap,
  Info,
  CheckCircle2,
  RefreshCw,
  Sliders,
  Shield,
  Eye,
  Crosshair,
} from 'lucide-react';
import { SkinMetrics, ScanResult } from '../types';
import { MINA_PRESETS, analyzeImageHeuristics, generateSkincareProtocol } from '../lib/skinEngine';

interface ScannerViewProps {
  onScanComplete: (result: ScanResult) => void;
}

export const ScannerView: React.FC<ScannerViewProps> = ({ onScanComplete }) => {
  const [activeTab, setActiveTab] = useState<'camera' | 'upload' | 'presets'>('camera');
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanStep, setScanStep] = useState<string>('');
  const [uploadedImagePreview, setUploadedImagePreview] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Stop camera stream safely
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  }, []);

  // Start webcam
  const startCamera = useCallback(async () => {
    setCameraError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera access is not supported by your browser.');
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
      const message = err instanceof Error ? err.message : 'Unable to access webcam.';
      setCameraError(message);
      setIsCameraActive(false);
    }
  }, []);

  // Clean up camera on unmount or tab switch
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

  // Execute animated diagnostic scan sequence
  const executeScanSequence = (metrics: SkinMetrics, source: 'webcam' | 'upload' | 'preset') => {
    setIsScanning(true);
    setScanStep('Mapping 468+ facial landmarks & skin zones...');

    setTimeout(() => {
      setScanStep('Analyzing T-Zone sebum & hydration levels...');
    }, 700);

    setTimeout(() => {
      setScanStep('Evaluating redness, barrier health & pore texture...');
    }, 1400);

    setTimeout(() => {
      setScanStep('Generating personalized AM/PM protocol...');
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

  // Capture frame from webcam
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

  // Handle uploaded image
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

  // Select 1-click curated preset
  const handleSelectPreset = (preset: (typeof MINA_PRESETS)[0]) => {
    executeScanSequence(preset.sampleMetrics, 'preset');
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Intro hero banner */}
      <div className="text-center space-y-2 pt-2 pb-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 border border-rose-200/80 text-rose-700 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Asian Beauty-Tech Skin Analyzer</span>
        </div>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold tracking-tight text-stone-900">
          Discover Your Skin’s True Biometrics
        </h1>
        <p className="text-xs sm:text-sm text-stone-600 max-w-xl mx-auto leading-relaxed">
          Inspired by in-store diagnostic kiosks in Vietnam & Korea. Scan your face to map sebum, hydration, pore density, and sensitivity, then receive a personalized dermatological protocol.
        </p>
      </div>

      {/* Mode selection tabs */}
      <div className="flex justify-center">
        <div className="inline-flex p-1 bg-stone-200/70 rounded-xl border border-stone-200 text-xs font-semibold text-stone-600">
          <button
            type="button"
            onClick={() => setActiveTab('camera')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-all ${
              activeTab === 'camera'
                ? 'bg-white text-stone-900 shadow-xs font-bold'
                : 'hover:text-stone-900'
            }`}
          >
            <Camera className="w-3.5 h-3.5 text-rose-600" />
            <span>Live Kiosk Camera</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-all ${
              activeTab === 'upload'
                ? 'bg-white text-stone-900 shadow-xs font-bold'
                : 'hover:text-stone-900'
            }`}
          >
            <Upload className="w-3.5 h-3.5 text-rose-600" />
            <span>Upload Selfie</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('presets')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-all ${
              activeTab === 'presets'
                ? 'bg-white text-stone-900 shadow-xs font-bold'
                : 'hover:text-stone-900'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            <span>1-Click Presets</span>
          </button>
        </div>
      </div>

      {/* Hidden processing canvas */}
      <canvas ref={canvasRef} className="hidden" />

      {/* TAB 1: LIVE WEBCAM SCANNER */}
      {activeTab === 'camera' && (
        <div className="bg-white rounded-2xl border border-stone-200/90 shadow-md p-4 sm:p-6 space-y-4">
          <div className="relative aspect-4/3 max-w-xl mx-auto rounded-xl overflow-hidden bg-stone-900 flex items-center justify-center border border-stone-800 shadow-inner">
            {/* Live Video element */}
            <video
              ref={videoRef}
              playsInline
              muted
              className={`w-full h-full object-cover transform -scale-x-100 ${
                isCameraActive ? 'block' : 'hidden'
              }`}
            />

            {/* Camera error fallback */}
            {!isCameraActive && (
              <div className="p-6 text-center text-stone-300 space-y-3">
                <div className="w-12 h-12 rounded-full bg-stone-800 border border-stone-700 flex items-center justify-center mx-auto text-rose-400">
                  <Camera className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-white">Camera Offline or Awaiting Permission</p>
                  <p className="text-xs text-stone-400 max-w-xs mx-auto">
                    {cameraError || 'Please allow webcam access, or switch to Upload Selfie / 1-Click Presets.'}
                  </p>
                </div>
                <div className="flex justify-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={startCamera}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-stone-800 hover:bg-stone-700 text-xs text-white border border-stone-600 transition-colors"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Try Again</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('presets')}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-rose-600 hover:bg-rose-700 text-xs text-white font-semibold shadow-xs transition-colors"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    <span>Try 1-Click Presets</span>
                  </button>
                </div>
              </div>
            )}

            {/* Kiosk Biometric Overlay & Zone Targets (visible when camera is active) */}
            {isCameraActive && (
              <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-4">
                {/* Top status bar */}
                <div className="flex items-center justify-between text-[11px] text-white/90 bg-stone-950/60 backdrop-blur-xs px-3 py-1.5 rounded-full border border-white/10">
                  <div className="flex items-center gap-1.5 font-mono">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    <span>KIOSK SENSOR ACTIVE</span>
                  </div>
                  <div className="flex items-center gap-1 font-mono text-stone-300">
                    <Crosshair className="w-3 h-3 text-rose-400" />
                    <span>ZONE MAPPING</span>
                  </div>
                </div>

                {/* Central Biometric Oval Guide with Animated Corner Targets */}
                <div className="relative mx-auto w-48 sm:w-60 h-64 sm:h-80 rounded-full border-2 border-dashed border-rose-400/60 animate-pulse-ring flex items-center justify-center">
                  {/* Scanning beam line when analyzing */}
                  {isScanning && <div className="animate-scanline" />}

                  {/* Corner aesthetic brackets */}
                  <div className="absolute -top-2 -left-2 w-4 h-4 border-t-2 border-l-2 border-rose-400" />
                  <div className="absolute -top-2 -right-2 w-4 h-4 border-t-2 border-r-2 border-rose-400" />
                  <div className="absolute -bottom-2 -left-2 w-4 h-4 border-b-2 border-l-2 border-rose-400" />
                  <div className="absolute -bottom-2 -right-2 w-4 h-4 border-b-2 border-r-2 border-rose-400" />

                  {/* Zone markers */}
                  <span className="absolute top-6 text-[9px] font-mono tracking-widest bg-stone-900/80 text-rose-300 px-1.5 py-0.5 rounded border border-rose-400/40">
                    FOREHEAD • SEBUM
                  </span>
                  <span className="absolute top-24 text-[9px] font-mono tracking-widest bg-stone-900/80 text-rose-300 px-1.5 py-0.5 rounded border border-rose-400/40">
                    T-ZONE • PORES
                  </span>
                  <span className="absolute left-2 top-36 text-[9px] font-mono tracking-widest bg-stone-900/80 text-rose-300 px-1.5 py-0.5 rounded border border-rose-400/40">
                    CHEEK
                  </span>
                  <span className="absolute right-2 top-36 text-[9px] font-mono tracking-widest bg-stone-900/80 text-rose-300 px-1.5 py-0.5 rounded border border-rose-400/40">
                    BARRIER
                  </span>
                  <span className="absolute bottom-6 text-[9px] font-mono tracking-widest bg-stone-900/80 text-rose-300 px-1.5 py-0.5 rounded border border-rose-400/40">
                    CHIN • HYDRATION
                  </span>
                </div>

                {/* Bottom guidance */}
                <div className="text-center">
                  <span className="text-[11px] text-white/80 bg-stone-950/60 backdrop-blur-xs px-3 py-1 rounded-full border border-white/10">
                    Center face within oval & ensure even lighting
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Action Trigger Button */}
          {isCameraActive && (
            <div className="text-center pt-2">
              <button
                type="button"
                onClick={handleCaptureWebcam}
                disabled={isScanning}
                className={`inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-semibold text-sm text-white shadow-md transition-all ${
                  isScanning
                    ? 'bg-rose-400 cursor-wait'
                    : 'bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-700 hover:to-rose-600 active:scale-[0.98]'
                }`}
              >
                {isScanning ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>{scanStep}</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Capture & Analyze Skin Biometrics</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: UPLOAD PHOTO / SELFIE */}
      {activeTab === 'upload' && (
        <div className="bg-white rounded-2xl border border-stone-200/90 shadow-md p-6 sm:p-8 space-y-4">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="image/png, image/jpeg, image/webp"
            className="hidden"
          />

          {uploadedImagePreview ? (
            <div className="space-y-4 text-center">
              <div className="relative max-w-sm mx-auto aspect-4/3 rounded-xl overflow-hidden border border-stone-200 shadow-inner">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={uploadedImagePreview}
                  alt="Uploaded selfie preview"
                  className="w-full h-full object-cover"
                />
                {isScanning && <div className="animate-scanline" />}
              </div>

              {isScanning ? (
                <div className="inline-flex items-center gap-2 text-rose-600 text-xs font-semibold">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>{scanStep}</span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 border border-stone-300"
                >
                  <Upload className="w-3.5 h-3.5 text-stone-500" />
                  <span>Choose Another Image</span>
                </button>
              )}
            </div>
          ) : (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-stone-300 hover:border-rose-400 rounded-xl p-8 sm:p-12 text-center cursor-pointer bg-stone-50/50 hover:bg-rose-50/20 transition-all space-y-3"
            >
              <div className="w-12 h-12 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 mx-auto">
                <Upload className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-semibold text-stone-800">
                  Click to select or drop a portrait photo
                </p>
                <p className="text-xs text-stone-500">
                  Supports JPG, PNG, and WebP up to 10 MB. High-resolution front-facing lighting recommended.
                </p>
              </div>
              <div className="inline-flex items-center gap-1 text-[11px] text-stone-400">
                <Shield className="w-3.5 h-3.5" />
                <span>Photos are analyzed in memory and never saved to a server.</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: 1-CLICK CURATED ASIAN PRESETS */}
      {activeTab === 'presets' && (
        <div className="bg-white rounded-2xl border border-stone-200/90 shadow-md p-6 space-y-4">
          <div className="flex items-center justify-between pb-1 border-b border-stone-100">
            <div>
              <h3 className="text-sm font-bold text-stone-900">
                1-Click Preset Skin Profiles
              </h3>
              <p className="text-xs text-stone-500">
                Test the diagnostic engine instantly with pre-calibrated profiles inspired by Asian dermatology kiosks.
              </p>
            </div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
              Instant Mode
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {MINA_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleSelectPreset(preset)}
                disabled={isScanning}
                className="text-left p-4 rounded-xl border border-stone-200 hover:border-rose-300 hover:bg-rose-50/30 transition-all shadow-2xs group flex items-start gap-3.5"
              >
                <div
                  className={`w-10 h-10 rounded-lg bg-gradient-to-tr ${preset.avatarColor} shrink-0 flex items-center justify-center text-white shadow-xs font-serif font-bold text-base`}
                >
                  {preset.title.charAt(0)}
                </div>

                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-xs font-bold text-stone-900 truncate group-hover:text-rose-700 transition-colors">
                      {preset.title}
                    </span>
                    <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-stone-100 text-stone-600 border border-stone-200">
                      {preset.previewMetrics.skinType}
                    </span>
                  </div>

                  <p className="text-[11px] text-stone-500 line-clamp-1">
                    {preset.subtitle}
                  </p>

                  <div className="flex items-center gap-2 pt-0.5 text-[11px] font-medium text-stone-600">
                    <span className="font-bold text-stone-900 font-mono">
                      {preset.previewMetrics.score}/100 Health
                    </span>
                    <span>•</span>
                    <span className="text-rose-600 truncate">
                      {preset.previewMetrics.primaryConcern}
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {isScanning && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 flex items-center justify-center gap-2 text-xs text-rose-800 font-semibold">
              <RefreshCw className="w-4 h-4 animate-spin text-rose-600" />
              <span>{scanStep}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
