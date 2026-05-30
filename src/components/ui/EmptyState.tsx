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
    <div
      className={`text-center p-8 rounded-xl border space-y-3 ${className}`}
      style={{ background: 'var(--bg-subtle)', borderColor: 'var(--border)' }}
    >
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto border"
        style={{ background: 'var(--bg-card)', borderColor: 'var(--border)', color: 'var(--text-muted)' }}
      >
        <Icon size={22} />
      </div>
      <div>
        {title && <h3 className="font-semibold text-sm mb-0.5" style={{ color: 'var(--text-primary)' }}>{title}</h3>}
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{subtitle}</p>
      </div>
      {action && <div className="pt-1">{action}</div>}
    </div>
  );
}
