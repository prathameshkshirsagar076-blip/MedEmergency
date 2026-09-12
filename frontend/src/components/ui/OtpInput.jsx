import React, { useRef, useEffect } from 'react';

export default function OtpInput({ length = 6, value = '', onChange, disabled = false, error = false, autoFocus = true }) {
  const inputRefs = useRef([]);

  const digits = Array.from({ length }, (_, i) => value[i] || '');

  useEffect(() => {
    if (autoFocus && inputRefs.current[0] && !disabled) {
      inputRefs.current[0].focus();
    }
  }, [autoFocus, disabled]);

  const handleChange = (e, index) => {
    const val = e.target.value.replace(/\D/g, '');
    if (!val) {
      // Empty / Deleted
      const newDigits = [...digits];
      newDigits[index] = '';
      onChange(newDigits.join(''));
      return;
    }

    if (val.length === 1) {
      const newDigits = [...digits];
      newDigits[index] = val;
      const combined = newDigits.join('');
      onChange(combined);

      // Auto-advance to next input
      if (index < length - 1 && inputRefs.current[index + 1]) {
        inputRefs.current[index + 1].focus();
      }
    } else if (val.length > 1) {
      // Handle fast typing / paste in single box
      handlePasteString(val);
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace') {
      if (!digits[index] && index > 0 && inputRefs.current[index - 1]) {
        inputRefs.current[index - 1].focus();
        const newDigits = [...digits];
        newDigits[index - 1] = '';
        onChange(newDigits.join(''));
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    if (pastedData) {
      handlePasteString(pastedData);
    }
  };

  const handlePasteString = (str) => {
    const cleanStr = str.replace(/\D/g, '').slice(0, length);
    onChange(cleanStr);

    const nextFocusIndex = Math.min(cleanStr.length, length - 1);
    if (inputRefs.current[nextFocusIndex]) {
      inputRefs.current[nextFocusIndex].focus();
    }
  };

  return (
    <div className="flex items-center justify-between gap-2 sm:gap-3 my-2" onPaste={handlePaste}>
      {Array.from({ length }, (_, idx) => (
        <input
          key={idx}
          ref={(el) => (inputRefs.current[idx] = el)}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={1}
          disabled={disabled}
          value={digits[idx]}
          onChange={(e) => handleChange(e, idx)}
          onKeyDown={(e) => handleKeyDown(e, idx)}
          onFocus={(e) => e.target.select()}
          className={`
            w-11 h-14 sm:w-13 sm:h-15 text-center text-2xl font-bold font-mono rounded-[14px]
            bg-[#F5F5F7] dark:bg-[#2C2C2E] text-[#1D1D1F] dark:text-[#F5F5F7]
            border transition-all duration-150 ease-[cubic-bezier(0.28,0.11,0.32,1)]
            focus:outline-none focus:ring-2 focus:ring-[#0071E3] focus:bg-white dark:focus:bg-[#1D1D1F]
            disabled:opacity-40 disabled:cursor-not-allowed
            ${error
              ? 'border-[#FF3B30] text-[#FF3B30] focus:ring-[#FF3B30]'
              : digits[idx]
                ? 'border-[#0071E3] dark:border-[#2997FF] shadow-sm'
                : 'border-[#D2D2D7] dark:border-[#3E3E42]'
            }
          `}
        />
      ))}
    </div>
  );
}
