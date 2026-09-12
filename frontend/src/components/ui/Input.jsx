import React, { useState } from 'react';

export default function Input({
  label,
  id,
  type = 'text',
  value,
  onChange,
  placeholder,
  error,
  required = false,
  disabled = false,
  className = '',
  ...props
}) {
  const [focused, setFocused] = useState(false);
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);
  const hasValue = value !== undefined && value !== '';

  return (
    <div className={`relative w-full pt-4 pb-1.5 ${className}`}>
      <input
        id={inputId}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={focused ? placeholder : ''}
        disabled={disabled}
        required={required}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className={`
          w-full bg-transparent text-[#1D1D1F] dark:text-[#F5F5F7] text-base py-1 px-0 border-0 border-b
          transition-colors duration-200 ease-[cubic-bezier(0.28,0.11,0.32,1)]
          focus:ring-0 focus:outline-none
          ${error
            ? 'border-[#FF3B30]'
            : (focused ? 'border-[#0071E3] dark:border-[#2997FF]' : 'border-[#D2D2D7] dark:border-[#333336]')}
          disabled:opacity-40 disabled:cursor-not-allowed
        `}
        {...props}
      />

      {label && (
        <label
          htmlFor={inputId}
          className={`
            absolute left-0 pointer-events-none transition-all duration-200 ease-[cubic-bezier(0.28,0.11,0.32,1)]
            ${(focused || hasValue)
              ? 'top-0 text-xs font-medium text-[#6E6E73] dark:text-[#86868B]'
              : 'top-4 text-base text-[#6E6E73] dark:text-[#86868B]'}
            ${error ? 'text-[#FF3B30]' : (focused ? 'text-[#0071E3] dark:text-[#2997FF]' : '')}
          `}
        >
          {label} {required && <span className="text-[#FF3B30]">*</span>}
        </label>
      )}

      {error && (
        <p className="mt-1 text-xs text-[#FF3B30] font-normal">
          {error}
        </p>
      )}
    </div>
  );
}
