'use client';

import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { Header } from '../components/Header';
import { ScannerView } from '../components/ScannerView';
import { DiagnosticDashboard } from '../components/DiagnosticDashboard';
import { ProtocolView } from '../components/ProtocolView';
import { ScanResult } from '../types';
import { Heart, Sparkles, Shield, Cpu } from 'lucide-react';

export default function Home() {
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [activeStage, setActiveStage] = useState<'scan' | 'dashboard' | 'protocol'>('scan');

  const handleScanComplete = (result: ScanResult) => {
    setScanResult(result);
    setActiveStage('dashboard');

    try {
      confetti({
        particleCount: 35,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#F43F5E', '#FDA4AF', '#FDE047', '#E0E7FF'],
      });
    } catch {
      // Ignore if confetti is unavailable
    }
  };

  const handleReset = () => {
    setScanResult(null);
    setActiveStage('scan');
  };

  return (
    <div className="min-h-screen flex flex-col selection:bg-rose-100 selection:text-rose-900">
      <Header hasActiveScan={Boolean(scanResult)} onReset={handleReset} />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {activeStage === 'scan' && (
          <ScannerView onScanComplete={handleScanComplete} />
        )}

        {activeStage === 'dashboard' && scanResult && (
          <DiagnosticDashboard
            metrics={scanResult.metrics}
            onProceedToProtocol={() => setActiveStage('protocol')}
          />
        )}

        {activeStage === 'protocol' && scanResult && (
          <ProtocolView
            routine={scanResult.routine}
            metrics={scanResult.metrics}
            onBackToDashboard={() => setActiveStage('dashboard')}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-rose-100/60 bg-white/40 backdrop-blur-xs py-6 mt-8 text-stone-400 text-xs">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <span className="font-bold text-stone-800 text-sm">Mina</span>
            <span>•</span>
            <span>Бьюти-диагностика и бережный уход за кожей</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 text-[11px] text-stone-400">
            <span className="flex items-center gap-1">
              <Shield className="w-3.5 h-3.5 text-emerald-600" />
              Приватно • Обработка в RAM
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Cpu className="w-3.5 h-3.5 text-rose-400" />
              AMD AI Ecosystem
            </span>
            <span>•</span>
            <span>Minh Hà Beauty Concept</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
