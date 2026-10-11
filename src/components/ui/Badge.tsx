import type { ReactNode } from 'react';
import { cn } from '@/utils/cn';

type BadgeTone = 'success' | 'neutral' | 'primary' | 'accent' | 'warning';

const TONES: Record<BadgeTone, string> = {
  success: 'bg-success-soft text-success-text ring-success/25',
  neutral: 'bg-surface-muted text-muted ring-border',
  primary: 'bg-primary-soft text-primary-text ring-primary/25',
  accent: 'bg-accent/10 text-accent-strong ring-accent/30',
  warning: 'bg-warning-soft text-warning-text ring-warning/25',
};

export function Badge({
  tone = 'neutral',
  children,
}: {
  tone?: BadgeTone;
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap ring-1 ring-inset',
        TONES[tone],
      )}
    >
      {children}
    </span>
  );
}

/** Status Ativo/Inativo padronizado. */
export function StatusBadge({ active }: { active: boolean }) {
  return (
    <Badge tone={active ? 'success' : 'neutral'}>{active ? 'Ativo' : 'Inativo'}</Badge>
  );
}
