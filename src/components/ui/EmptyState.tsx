import React from 'react';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title?: string;
  subtitle: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ icon: Icon, title, subtitle, action, className = '' }: EmptyStateProps) {
  return (
    <div className={`text-center bg-neutral-900 border border-neutral-800 p-8 rounded-[2rem] shadow-xl space-y-4 ${className}`}>
      <div className="w-16 h-16 bg-neutral-800 rounded-[1.5rem] flex items-center justify-center mx-auto text-neutral-500 border border-neutral-700 shadow-inner">
        <Icon size={32} />
      </div>
      <div>
        {title && <h3 className="font-bold text-white mb-1">{title}</h3>}
        <p className="text-sm text-neutral-400">{subtitle}</p>
      </div>
      {action && <div className="pt-2">{action}</div>}
    </div>
  );
}
