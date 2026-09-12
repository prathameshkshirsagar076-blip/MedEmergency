import React from 'react';
import Button from './Button';

export default function EmptyState({
  icon: Icon,
  headline,
  description,
  actionLabel,
  onAction,
  className = '',
}) {
  return (
    <div className={`py-20 text-center max-w-md mx-auto ${className}`}>
      {Icon && (
        <div className="w-12 h-12 text-[#6E6E73] dark:text-[#86868B] mx-auto mb-4 opacity-70">
          <Icon className="w-12 h-12 stroke-1" />
        </div>
      )}
      <h3 className="text-xl font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tight">
        {headline}
      </h3>
      {description && (
        <p className="text-sm text-[#6E6E73] dark:text-[#86868B] mt-2 leading-relaxed">
          {description}
        </p>
      )}
      {actionLabel && onAction && (
        <div className="mt-6">
          <Button variant="accent" size="sm" onClick={onAction}>
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
}
