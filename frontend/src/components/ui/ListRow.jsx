import React from 'react';

/**
 * Hairline-divided Row (Apple Mail / Settings list style)
 * Replaces heavy boxed cards
 */
export default function ListRow({
  children,
  onClick,
  isEmergency = false,
  className = '',
  ...props
}) {
  return (
    <div
      onClick={onClick}
      className={`
        py-4.5 px-3 -mx-3 rounded-[12px] hairline-b border-[#D2D2D7] dark:border-[#333336]
        transition-colors duration-150 ease-[cubic-bezier(0.28,0.11,0.32,1)]
        ${onClick ? 'hover:bg-[#F5F5F7] dark:hover:bg-[#1D1D1F] cursor-pointer' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
}
