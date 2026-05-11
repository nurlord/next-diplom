import React from 'react';

interface LoadingStateProps {
  count?: number;
  height?: string;
  className?: string;
}

export function LoadingState({ count = 3, height = 'h-20', className = '' }: LoadingStateProps) {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`${height} bg-neutral-800/40 rounded-2xl animate-pulse`}
        />
      ))}
    </div>
  );
}
