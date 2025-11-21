/**
 * LoadingSpinner Component
 * Reusable loading animation using the actual logo with stepped rotation
 */

import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  text?: string;
}

export default function LoadingSpinner({ size = 'md', text }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-16 h-16',
    lg: 'w-24 h-24',
    xl: 'w-32 h-32',
  };

  const textSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
    xl: 'text-lg',
  };

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      {/* Bouncy pulsing logo animation */}
      <div className={`${sizeClasses[size]} relative`}>
        <img
          src="/new-logo.png"
          alt="Loading..."
          className="w-full h-full animate-bounce-pulse"
        />
      </div>

      {/* Optional loading text */}
      {text && (
        <p className={`text-lightscale-3 font-medium ${textSizes[size]} animate-pulse`}>
          {text}
        </p>
      )}
    </div>
  );
}
