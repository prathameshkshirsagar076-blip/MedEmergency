import React from 'react';

export default function SegmentedControl({ options, value, onChange, className = '' }) {
  return (
    <div className={`inline-flex p-1 bg-[#F5F5F7] dark:bg-[#1D1D1F] rounded-[14px] ${className}`}>
      {options.map((opt) => {
        const isSelected = value === opt.value;
        const Icon = opt.icon;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`
              flex items-center justify-center gap-2 px-5 py-2 text-sm font-medium rounded-[10px] transition-all duration-200 ease-[cubic-bezier(0.28,0.11,0.32,1)]
              ${isSelected
                ? 'bg-white dark:bg-[#2C2C2E] text-[#1D1D1F] dark:text-[#F5F5F7] shadow-apple-subtle font-semibold'
                : 'text-[#6E6E73] dark:text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7]'}
            `}
          >
            {Icon && <Icon className="w-4 h-4 flex-shrink-0" />}
            <span>{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}
