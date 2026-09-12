import React from 'react';

/**
 * iOS-style Toggle Switch
 */
export default function Toggle({
  checked,
  onChange,
  label,
  description,
  isEmergency = false,
  className = '',
}) {
  return (
    <div
      onClick={() => onChange(!checked)}
      className={`cursor-pointer flex items-center justify-between gap-4 py-3 select-none ${className}`}
    >
      <div>
        {label && (
          <span className="text-base font-medium text-[#1D1D1F] dark:text-[#F5F5F7] block">
            {label}
          </span>
        )}
        {description && (
          <p className="text-xs text-[#6E6E73] dark:text-[#86868B] mt-0.5 leading-relaxed max-w-lg">
            {description}
          </p>
        )}
      </div>

      <div
        className={`
          w-[51px] h-[31px] rounded-full p-[2px] transition-colors duration-300 ease-[cubic-bezier(0.28,0.11,0.32,1)] flex-shrink-0
          ${checked ? (isEmergency ? 'bg-[#FF3B30]' : 'bg-[#34C759]') : 'bg-[#E9E9EB] dark:bg-[#39393D]'}
        `}
      >
        <div
          className={`
            bg-white w-[27px] h-[27px] rounded-full shadow-[0_2px_4px_rgba(0,0,0,0.2)] transform transition-transform duration-300 ease-[cubic-bezier(0.28,0.11,0.32,1)]
            ${checked ? 'translate-x-[20px]' : 'translate-x-0'}
          `}
        />
      </div>
    </div>
  );
}
