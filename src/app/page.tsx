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

    // Subtle celebration confetti on diagnostic completion
    try {
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#F43F68', '#FB718D', '#B09B7A', '#F9F6F0'],
      });
    } catch {
      // Ignore if canvas-confetti is not available
    }
  };

  const handleReset = () => {
    setScanResult(null);
    setActiveStage('scan');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5]">
      <Header hasActiveScan={Boolean(scanResult)} onReset={handleReset} />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-10">
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
      <footer className="border-t border-stone-200/80 bg-white/50 backdrop-blur-xs py-8 mt-12 text-stone-500 text-xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-serif font-bold text-stone-800 text-sm">Mina</span>
            <span>•</span>
            <span>Asian Beauty-Tech Skin Intelligence</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-[11px] text-stone-400">
            <span className="flex items-center gap-1">
              <Shield className="w-3.5 h-3.5 text-emerald-600" />
              100% In-Memory Vision
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Cpu className="w-3.5 h-3.5 text-stone-500" />
              AMD AI Ecosystem Ready
            </span>
            <span>•</span>
            <span>Inspired by Minh Hà Vietnam & Asian Cosmetic Kiosks</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
