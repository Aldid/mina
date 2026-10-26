'use client';

import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { Header } from '../components/Header';
import { FloSkinCircle } from '../components/FloSkinCircle';
import { FloSymptomLogger } from '../components/FloSymptomLogger';
import { FloDailyPlan } from '../components/FloDailyPlan';
import { FloInsights } from '../components/FloInsights';
import { ScannerModal } from '../components/ScannerModal';
import { SkinMetrics, SkincareRoutine, ScanResult } from '../types';
import { MINA_PRESETS, generateSkincareProtocol } from '../lib/skinEngine';
import { Heart, Sparkles, Shield, Cpu } from 'lucide-react';

export default function Home() {
  // Default to Combination Skin Preset so the Flo feed is instantly alive and vibrant
  const [metrics, setMetrics] = useState<SkinMetrics>(MINA_PRESETS[0].sampleMetrics);
  const [routine, setRoutine] = useState<SkincareRoutine>(() =>
    generateSkincareProtocol(MINA_PRESETS[0].sampleMetrics)
  );
  const [isScannerOpen, setIsScannerOpen] = useState<boolean>(false);

  const handleScanComplete = (result: ScanResult) => {
    setMetrics(result.metrics);
    setRoutine(result.routine);

    try {
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.5 },
        colors: ['#ff5b79', '#ff758f', '#fde047', '#fed7aa'],
      });
    } catch {
      // ignore
    }
  };

  const scrollToRoutine = () => {
    const el = document.getElementById('daily-plan');
    el?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col selection:bg-rose-100 selection:text-rose-900 pb-12">
      {/* Flo Header with 7-Day Skin Tracker */}
      <Header
        onOpenScanner={() => setIsScannerOpen(true)}
        activeScore={metrics.overallHealthScore}
      />

      <main className="flex-1 max-w-md w-full mx-auto px-4 py-4 space-y-5">
        {/* 1. Flo Central Glowing Skin Circle */}
        <FloSkinCircle
          metrics={metrics}
          onOpenRoutine={scrollToRoutine}
          onOpenScanner={() => setIsScannerOpen(true)}
        />

        {/* 2. Flo 1-Tap Symptom Logger ("Как твоя кожа чувствует себя сегодня?") */}
        <FloSymptomLogger />

        {/* 3. Flo Daily AM / PM Skincare Plan with Checkable Steps */}
        <div id="daily-plan">
          <FloDailyPlan routine={routine} metrics={metrics} />
        </div>

        {/* 4. Flo Daily Insights & Stories */}
        <FloInsights />
      </main>

      {/* Floating Scanner / Preset Modal */}
      <ScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScanComplete={handleScanComplete}
      />

      {/* Soft Flo Footer */}
      <footer className="max-w-md mx-auto w-full px-4 text-center space-y-2 pt-6 text-[11px] text-stone-400">
        <div className="flex items-center justify-center gap-2 font-medium">
          <span className="font-bold text-stone-700">Mina</span>
          <span>•</span>
          <span>Flo for Face & Skin Health</span>
        </div>
        <div className="flex items-center justify-center gap-3 text-stone-400">
          <span className="flex items-center gap-1">
            <Shield className="w-3 h-3 text-emerald-500" />
            100% Приватно в RAM
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Cpu className="w-3 h-3 text-[#ff5b79]" />
            AMD AI Ecosystem
          </span>
        </div>
      </footer>
    </div>
  );
}
