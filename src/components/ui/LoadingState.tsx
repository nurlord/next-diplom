import React from 'react';

interface LoadingStateProps {
  count?: number;
  height?: string;
  className?: string;
}

export function LoadingState({ count = 3, height = 'h-20', className = '' }: LoadingStateProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`${height} rounded-xl animate-pulse`}
          style={{ background: 'var(--bg-muted)' }}
        />
      ))}
    </div>
  );
}
