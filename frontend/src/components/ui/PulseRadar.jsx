import React from 'react';
import { Radio } from 'lucide-react';

export default function PulseRadar({ radiusKm = 5, storeCount = 0, isEmergency = false }) {
  return (
    <div className="relative w-64 h-64 sm:w-72 sm:h-72 mx-auto flex items-center justify-center my-6">
      {/* Soft expanding rings in --color-primary (#146C6C) */}
      <div className="radar-ring-1 w-full h-full" />
      <div className="radar-ring-2 w-3/4 h-3/4" />
      <div className="radar-ring-3 w-1/2 h-1/2" />

      {/* Static concentric boundary ring */}
      <div className="absolute inset-4 rounded-full border border-[#146C6C]/20" />
      <div className="absolute inset-16 rounded-full border border-[#146C6C]/15" />

      {/* Center Beacon */}
      <div className="relative z-10 w-12 h-12 rounded-full bg-[#146C6C] text-white flex items-center justify-center shadow-md">
        <Radio className="w-6 h-6 animate-pulse" />
      </div>

      {/* Subtle Blip points representing nearby stores */}
      <div className="absolute top-1/4 left-1/3 w-2.5 h-2.5 rounded-full bg-[#2E8B57] shadow-sm animate-ping" />
      <div className="absolute top-1/4 left-1/3 w-2.5 h-2.5 rounded-full bg-[#2E8B57]" />

      <div className="absolute bottom-1/3 right-1/4 w-2 h-2 rounded-full bg-[#146C6C] animate-pulse" />
      <div className="absolute top-1/3 right-1/4 w-2 h-2 rounded-full bg-[#146C6C] animate-pulse" style={{ animationDelay: '0.6s' }} />
    </div>
  );
}
