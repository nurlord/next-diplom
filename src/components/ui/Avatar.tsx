import React from 'react';
import { User } from 'lucide-react';

interface AvatarProps {
  text?: string | null;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Avatar({ text, size = 'md', className = '' }: AvatarProps) {
  const char = text?.[0]?.toUpperCase();

  const sizeClasses = {
    sm: 'w-8 h-8 text-[10px]',
    md: 'w-12 h-12 text-lg',
    lg: 'w-16 h-16 text-2xl',
  };

  const bgColors = [
    'from-blue-500 to-cyan-500',
    'from-indigo-500 to-purple-500',
    'from-orange-500 to-red-500',
    'from-emerald-500 to-teal-500',
    'from-pink-500 to-rose-500',
  ];

  // Deterministic color based on string length (or character codes for more variation)
  const score = text ? text.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) : 0;
  const colorIndex = score % bgColors.length;
  const gradientClass = bgColors[colorIndex];

  return (
    <div
      className={`rounded-full bg-gradient-to-br ${gradientClass} flex items-center justify-center font-bold text-white shadow-inner shrink-0 ${sizeClasses[size]} ${className}`}
    >
      {char || <User size={size === 'sm' ? 14 : size === 'md' ? 20 : 28} />}
    </div>
  );
}
