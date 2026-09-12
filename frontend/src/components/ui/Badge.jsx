import React from 'react';

export default function Badge({
  children,
  variant = 'pending', // 'emergency' | 'matched' | 'pending' | 'resolved' | 'neutral' | 'confidence-high' | 'confidence-mid'
  size = 'md',
  className = '',
}) {
  const variantStyles = {
    emergency: 'bg-[#FBEBEA] text-[#D63B2F] border border-[#D63B2F]/30 font-bold',
    matched: 'bg-[#EDF7F1] text-[#2E8B57] border border-[#2E8B57]/30 font-bold',
    pending: 'bg-[#E6F0F0] text-[#146C6C] border border-[#146C6C]/30 font-semibold',
    resolved: 'bg-slate-100 text-[#5C6B73] border border-slate-200 font-semibold',
    neutral: 'bg-slate-100 text-[#5C6B73] border border-slate-200 font-medium',
    'confidence-high': 'bg-[#EDF7F1] text-[#2E8B57] border border-[#2E8B57]/20 font-medium',
    'confidence-mid': 'bg-amber-50 text-amber-800 border border-amber-200 font-medium',
  };

  const sizeStyles = {
    sm: 'px-2 py-0.5 text-[10px]',
    md: 'px-2.5 py-1 text-xs',
  };

  return (
    <span
      className={`
        inline-flex items-center gap-1.5 rounded-full uppercase tracking-wider
        ${variantStyles[variant] || variantStyles.neutral}
        ${sizeStyles[size] || sizeStyles.md}
        ${className}
      `}
    >
      {variant === 'confidence-high' && <span className="w-1.5 h-1.5 rounded-full bg-[#2E8B57]" />}
      {variant === 'confidence-mid' && <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />}
      {variant === 'emergency' && <span className="w-1.5 h-1.5 rounded-full bg-[#D63B2F]" />}
      {children}
    </span>
  );
}
