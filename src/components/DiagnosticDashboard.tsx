'use client';

import React, { useState } from 'react';
import {
  Droplets,
  Flame,
  Shield,
  Eye,
  Sparkles,
  Layers,
  MapPin,
  ChevronRight,
  Activity,
  HeartPulse,
} from 'lucide-react';
import { SkinMetrics, ZoneAnalysis } from '../types';

interface DiagnosticDashboardProps {
  metrics: SkinMetrics;
  onProceedToProtocol: () => void;
}

export const DiagnosticDashboard: React.FC<DiagnosticDashboardProps> = ({
  metrics,
  onProceedToProtocol,
}) => {
  const [selectedZone, setSelectedZone] = useState<ZoneAnalysis>(metrics.zones[0]);

  const biomarkerItems = [
    {
      label: 'Hydration Level',
      value: metrics.hydration,
      icon: Droplets,
      color: 'text-sky-600',
      barColor: 'bg-sky-500',
      description: metrics.hydration > 70 ? 'Deep cellular moisture' : 'Superficial dehydration detected',
    },
    {
      label: 'Sebum & Shine Control',
      value: metrics.sebumControl,
      icon: Flame,
      color: 'text-amber-600',
      barColor: 'bg-amber-500',
      description: metrics.sebumControl > 70 ? 'Balanced lipid mantle' : 'Excessive sebaceous excretion',
    },
    {
      label: 'Barrier Resilience',
      value: metrics.barrierHealth,
      icon: Shield,
      color: 'text-emerald-600',
      barColor: 'bg-emerald-500',
      description: metrics.barrierHealth > 75 ? 'Strong lipid matrix' : 'Vulnerable stratum corneum',
    },
    {
      label: 'Pore Clarity & Texture',
      value: metrics.poreClarity,
      icon: Layers,
      color: 'text-indigo-600',
      barColor: 'bg-indigo-500',
      description: metrics.poreClarity > 70 ? 'Refined follicular openings' : 'Enlarged pores / micro-congestion',
    },
    {
      label: 'Capillary Calmness',
      value: metrics.rednessSensitivity,
      icon: HeartPulse,
      color: 'text-rose-600',
      barColor: 'bg-rose-500',
      description: metrics.rednessSensitivity > 70 ? 'Calm vascular tone' : 'Reactivity & flushed erythema',
    },
    {
      label: 'Eye Contour Restfulness',
      value: metrics.eyeAreaFatigue,
      icon: Eye,
      color: 'text-purple-600',
      barColor: 'bg-purple-500',
      description: metrics.eyeAreaFatigue > 70 ? 'Vibrant micro-circulation' : 'Vascular shadows from fatigue',
    },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Top Overview Banner */}
      <div className="bg-white rounded-2xl border border-stone-200/90 shadow-md p-6 sm:p-8 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-6">
        {/* Left: Overall Health Ring & Score */}
        <div className="flex items-center gap-5">
          <div className="relative w-24 h-24 shrink-0 rounded-full bg-gradient-to-tr from-rose-100 to-amber-100 flex items-center justify-center p-2 shadow-inner border border-rose-200/60">
            <div className="w-full h-full rounded-full bg-white flex flex-col items-center justify-center shadow-xs">
              <span className="text-2xl font-serif font-black text-stone-900 leading-none">
                {metrics.overallHealthScore}
              </span>
              <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider mt-0.5">
                / 100 Score
              </span>
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-bold px-2 py-0.5 rounded-md bg-stone-100 text-stone-700 border border-stone-200">
                Skin Type: {metrics.skinType}
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200">
                {metrics.overallHealthScore >= 80 ? 'Optimal' : metrics.overallHealthScore >= 65 ? 'Moderate' : 'Needs Repair'}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-stone-900 tracking-tight">
              Facial Biometric Diagnostic
            </h2>
            <p className="text-xs text-stone-500 max-w-md">
              Primary Concern: <span className="font-semibold text-rose-700">{metrics.primaryConcern}</span>.
            </p>
          </div>
        </div>

        {/* Right CTA to Protocol */}
        <button
          type="button"
          onClick={onProceedToProtocol}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-stone-900 hover:bg-stone-950 active:bg-black text-white text-xs font-bold shadow-md transition-all self-start md:self-auto shrink-0"
        >
          <span>View Custom AM/PM Protocol</span>
          <ChevronRight className="w-4 h-4 text-stone-400" />
        </button>
      </div>

      {/* 6 Core Skin Biomarkers Grid */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-stone-900 tracking-tight">
          <Activity className="w-4 h-4 text-rose-600" />
          <span>Biometric Sensor Readings (0–100%)</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {biomarkerItems.map((item) => (
            <div
              key={item.label}
              className="bg-white rounded-xl border border-stone-200/80 shadow-2xs p-4 space-y-2.5"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <item.icon className={`w-4 h-4 ${item.color}`} />
                  <span className="text-xs font-bold text-stone-900">
                    {item.label}
                  </span>
                </div>
                <span className="text-xs font-mono font-bold text-stone-800">
                  {item.value}%
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full h-1.5 rounded-full bg-stone-100 overflow-hidden">
                <div
                  className={`h-full rounded-full ${item.barColor} transition-all duration-500`}
                  style={{ width: `${item.value}%` }}
                />
              </div>

              <p className="text-[11px] text-stone-500 line-clamp-1">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* 5-Zone Face Map Analysis */}
      <div className="bg-white rounded-2xl border border-stone-200/90 shadow-md p-6 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-stone-100">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-rose-600" />
            <h3 className="text-sm font-bold text-stone-900">
              Localized Face Zone Breakdown
            </h3>
          </div>
          <span className="text-[11px] text-stone-400">
            Select a zone to inspect micro-metrics
          </span>
        </div>

        {/* Zone Selector Pills */}
        <div className="flex flex-wrap gap-2">
          {metrics.zones.map((z) => (
            <button
              key={z.zone}
              type="button"
              onClick={() => setSelectedZone(z)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                selectedZone.zone === z.zone
                  ? 'bg-rose-50 text-rose-900 border border-rose-300 shadow-2xs font-bold'
                  : 'bg-stone-50 text-stone-600 hover:bg-stone-100 border border-stone-200'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  z.severity === 'Optimal'
                    ? 'bg-emerald-500'
                    : z.severity === 'Mild'
                    ? 'bg-amber-400'
                    : 'bg-rose-500'
                }`}
              />
              <span>{z.zone}</span>
            </button>
          ))}
        </div>

        {/* Selected Zone Card Detail */}
        {selectedZone && (
          <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-stone-900 font-serif">
                  {selectedZone.zone} Zone
                </span>
                <span className="text-[10px] text-stone-500 bg-white px-2 py-0.5 rounded border border-stone-200">
                  Target: {selectedZone.metric}
                </span>
              </div>
              <span
                className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                  selectedZone.severity === 'Optimal'
                    ? 'bg-emerald-100 text-emerald-800'
                    : selectedZone.severity === 'Mild'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-rose-100 text-rose-800'
                }`}
              >
                {selectedZone.severity}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-1">
              <div className="space-y-0.5">
                <span className="text-[11px] font-bold text-stone-700 block">
                  Kiosk Observation:
                </span>
                <p className="text-stone-600 leading-relaxed">
                  {selectedZone.observation}
                </p>
              </div>

              <div className="space-y-0.5">
                <span className="text-[11px] font-bold text-stone-700 block">
                  Targeted Recommendation:
                </span>
                <p className="text-rose-700 font-medium leading-relaxed">
                  {selectedZone.recommendation}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
