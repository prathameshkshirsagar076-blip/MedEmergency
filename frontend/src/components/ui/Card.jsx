import React from 'react';

export default function Card({
  children,
  accent = 'none', // 'none' | 'primary' | 'emergency' | 'success'
  className = '',
  onClick,
  hoverable = false,
  ...props
}) {
  const accentClasses = {
    none: '',
    primary: 'border-l-4 border-l-[#146C6C]',
    emergency: 'border-l-4 border-l-[#D63B2F]',
    success: 'border-l-4 border-l-[#2E8B57]',
  };

  return (
    <div
      onClick={onClick}
      className={`
        bg-white rounded-xl border border-[#E1E7EA] p-5 shadow-subtle
        ${accentClasses[accent] || ''}
        ${hoverable ? 'hover:shadow-card-hover hover:border-slate-300 transition-all duration-150 ease-out cursor-pointer' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
}
