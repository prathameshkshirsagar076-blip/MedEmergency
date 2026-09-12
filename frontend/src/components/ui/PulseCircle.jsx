import React from 'react';

/**
 * Signature Apple-style concentric pulse ring
 */
export default function PulseCircle({ isEmergency = false }) {
  const accentColor = isEmergency ? 'border-[#FF3B30]' : 'border-[#0071E3]';
  const centerColor = isEmergency ? 'bg-[#FF3B30]' : 'bg-[#0071E3]';

  return (
    <div className="relative w-64 h-64 sm:w-80 sm:h-80 mx-auto flex items-center justify-center my-12">
      {/* Concentric Smooth Expanding Rings */}
      <div className={`apple-pulse-ring-1 w-full h-full ${accentColor}`} />
      <div className={`apple-pulse-ring-2 w-3/4 h-3/4 ${accentColor}`} />
      <div className={`apple-pulse-ring-3 w-1/2 h-1/2 ${accentColor}`} />

      {/* Center Beacon */}
      <div className={`relative z-10 w-4 h-4 rounded-full ${centerColor} shadow-[0_0_20px_rgba(0,113,227,0.5)]`} />
    </div>
  );
}
