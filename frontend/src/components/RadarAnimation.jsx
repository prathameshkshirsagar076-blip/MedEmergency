import React from 'react';
import { Radio, ShieldAlert } from 'lucide-react';

export default function RadarAnimation({ radiusKm = 5.0, count = 0, isEmergency = true }) {
  return (
    <div className="relative w-64 h-64 sm:w-80 sm:h-80 mx-auto flex items-center justify-center">
      {/* Outer Glow Ring */}
      <div className="absolute inset-0 rounded-full bg-rose-500/10 blur-xl animate-pulse"></div>

      {/* Radar Concentric Rings */}
      <div className="radar-ring w-full h-full border-rose-500/30"></div>
      <div className="radar-ring w-3/4 h-3/4 border-rose-500/40"></div>
      <div className="radar-ring w-1/2 h-1/2 border-rose-500/50"></div>
      <div className="radar-ring w-1/4 h-1/4 border-rose-500/70"></div>

      {/* Crosshairs */}
      <div className="absolute w-full h-[1px] bg-rose-500/20 top-1/2 left-0 -translate-y-1/2"></div>
      <div className="absolute h-full w-[1px] bg-rose-500/20 left-1/2 top-0 -translate-x-1/2"></div>

      {/* Radar Sweep Arc */}
      <div className="radar-sweep"></div>

      {/* Center Beacon */}
      <div className="relative z-10 w-14 h-14 rounded-full bg-gradient-to-tr from-rose-600 to-rose-500 flex items-center justify-center shadow-lg shadow-rose-600/50 animate-pulse">
        <Radio className="w-7 h-7 text-white animate-bounce" />
      </div>

      {/* Blip dots simulating stores */}
      <div className="absolute top-1/4 left-1/3 w-3 h-3 rounded-full bg-emerald-400 animate-ping"></div>
      <div className="absolute top-1/4 left-1/3 w-3 h-3 rounded-full bg-emerald-500"></div>

      <div className="absolute bottom-1/3 right-1/4 w-3 h-3 rounded-full bg-emerald-400 animate-ping" style={{ animationDelay: '0.8s' }}></div>
      <div className="absolute bottom-1/3 right-1/4 w-3 h-3 rounded-full bg-emerald-500"></div>

      <div className="absolute top-1/3 right-1/3 w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" style={{ animationDelay: '1.4s' }}></div>
      <div className="absolute top-1/3 right-1/3 w-2.5 h-2.5 rounded-full bg-amber-500"></div>

      {/* Live Badge */}
      <div className="absolute -bottom-8 px-4 py-1.5 bg-slate-800/90 border border-slate-700 rounded-full text-xs font-bold text-slate-200 flex items-center gap-2 shadow-lg">
        <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
        <span>Scanning {radiusKm} km radius ({count} stores pinged)</span>
      </div>
    </div>
  );
}
