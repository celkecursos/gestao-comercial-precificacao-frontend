import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/utils/cn';

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'border-border bg-surface rounded-xl border shadow-sm dark:shadow-black/20',
        className,
      )}
      {...props}
    />
  );
}

interface CardHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  titleId?: string;
}

export function CardHeader({ title, description, actions, titleId }: CardHeaderProps) {
  return (
    <div className="border-border flex flex-wrap items-start justify-between gap-3 border-b px-5 py-4">
      <div>
        <h2 id={titleId} className="text-foreground text-base font-semibold">
          {title}
        </h2>
        {description && <p className="text-muted mt-0.5 text-sm">{description}</p>}
      </div>
      {actions}
    </div>
  );
}
