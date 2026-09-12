import React from 'react';

export default function StatCounter({ label, value, unit, icon: Icon, color = 'default', className = '' }) {
  const colorStyles = {
    default: 'text-[#0F1B2D]',
    primary: 'text-[#146C6C]',
    emergency: 'text-[#D63B2F]',
    success: 'text-[#2E8B57]',
  };

  return (
    <div className={`bg-white rounded-lg border border-[#E1E7EA] p-3.5 shadow-subtle ${className}`}>
      <span className="text-[11px] font-semibold uppercase tracking-wider text-[#5C6B73] block flex items-center gap-1">
        {Icon && <Icon className="w-3.5 h-3.5 text-[#5C6B73]" />}
        {label}
      </span>
      <div className="mt-1 flex items-baseline gap-1">
        <span className={`font-mono text-xl font-bold tracking-tight ${colorStyles[color] || colorStyles.default}`}>
          {value}
        </span>
        {unit && <span className="font-mono text-xs text-[#5C6B73]">{unit}</span>}
      </div>
    </div>
  );
}
