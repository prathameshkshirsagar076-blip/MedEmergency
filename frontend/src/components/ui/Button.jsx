import React from 'react';

export default function Button({
  children,
  variant = 'accent', // 'accent' | 'emergency' | 'secondary' | 'text' | 'success'
  size = 'md',        // 'sm' | 'md' | 'lg'
  fullWidth = false,
  loading = false,
  disabled = false,
  type = 'button',
  onClick,
  className = '',
  icon: Icon,
  ...props
}) {
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-200 ease-[cubic-bezier(0.28,0.11,0.32,1)] active:scale-[0.97] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100 select-none';

  const variantStyles = {
    accent: 'bg-[#0071E3] hover:bg-[#0077ED] active:bg-[#0062C4] text-white rounded-[18px] focus-visible:outline-[#0071E3]',
    emergency: 'bg-[#FF3B30] hover:bg-[#E03228] active:bg-[#C9251C] text-white rounded-[18px] focus-visible:outline-[#FF3B30]',
    secondary: 'bg-[#F5F5F7] dark:bg-[#1D1D1F] hover:bg-[#E8E8ED] dark:hover:bg-[#2C2C2E] text-[#1D1D1F] dark:text-[#F5F5F7] rounded-[18px] focus-visible:outline-[#0071E3]',
    success: 'bg-[#34C759] hover:bg-[#2EAF4E] active:bg-[#269742] text-white rounded-[18px] focus-visible:outline-[#34C759]',
    text: 'bg-transparent text-[#0071E3] dark:text-[#2997FF] hover:underline focus-visible:outline-[#0071E3] p-0 min-h-0',
  };

  const sizeStyles = {
    sm: 'px-4 py-2 text-sm min-h-[38px]',
    md: 'px-6 py-3 text-base min-h-[48px]',
    lg: 'px-8 py-3.5 text-lg font-semibold min-h-[56px]',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        ${baseStyles}
        ${variantStyles[variant] || variantStyles.accent}
        ${variant !== 'text' ? (sizeStyles[size] || sizeStyles.md) : ''}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      {...props}
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
          </svg>
          <span>Connecting...</span>
        </span>
      ) : (
        <span className="flex items-center justify-center gap-2">
          {Icon && <Icon className="w-4 h-4 flex-shrink-0" />}
          {children}
        </span>
      )}
    </button>
  );
}
