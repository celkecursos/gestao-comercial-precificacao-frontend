import { AlertTriangle, CheckCircle2, Info, XCircle } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/utils/cn';

type AlertVariant = 'error' | 'success' | 'warning' | 'info';

const STYLES: Record<AlertVariant, { classes: string; icon: ReactNode }> = {
  error: {
    classes: 'border-danger/30 bg-danger-soft text-danger-text',
    icon: <XCircle className="size-5 shrink-0" aria-hidden="true" />,
  },
  success: {
    classes: 'border-success/30 bg-success-soft text-success-text',
    icon: <CheckCircle2 className="size-5 shrink-0" aria-hidden="true" />,
  },
  warning: {
    classes: 'border-warning/30 bg-warning-soft text-warning-text',
    icon: <AlertTriangle className="size-5 shrink-0" aria-hidden="true" />,
  },
  info: {
    classes: 'border-primary/30 bg-primary-soft text-primary-text',
    icon: <Info className="size-5 shrink-0" aria-hidden="true" />,
  },
};

export function Alert({
  variant = 'info',
  children,
  className,
}: {
  variant?: AlertVariant;
  children: ReactNode;
  className?: string;
}) {
  const { classes, icon } = STYLES[variant];
  return (
    <div
      role={variant === 'error' ? 'alert' : 'status'}
      className={cn(
        'flex items-start gap-2.5 rounded-lg border px-3.5 py-3 text-sm',
        classes,
        className,
      )}
    >
      {icon}
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
