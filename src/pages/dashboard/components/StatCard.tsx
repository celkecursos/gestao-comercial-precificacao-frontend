import type { LucideIcon } from 'lucide-react';
import { Link } from 'react-router';
import { Card } from '@/components/ui/Card';
import { cn } from '@/utils/cn';

interface StatCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  /** Página relacionada; sem link quando omitido (ex.: usuário sem permissão). */
  to?: string;
  /** Destaque do ícone: primário (azul) ou acento (ciano). */
  tone?: 'primary' | 'accent';
}

export function StatCard({
  title,
  value,
  icon: Icon,
  to,
  tone = 'primary',
}: StatCardProps) {
  return (
    <Card className="group relative overflow-hidden p-5 transition-shadow hover:shadow-md">
      <div
        aria-hidden="true"
        className={cn(
          'absolute inset-x-0 top-0 h-1',
          tone === 'primary' ? 'bg-primary' : 'bg-accent',
        )}
      />
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-muted text-sm font-medium">{title}</p>
          <p className="text-foreground mt-2 text-3xl font-semibold tracking-tight tabular-nums">
            {value.toLocaleString('pt-BR')}
          </p>
        </div>
        <span
          className={cn(
            'flex size-11 items-center justify-center rounded-xl',
            tone === 'primary'
              ? 'bg-primary-soft text-primary-text'
              : 'bg-accent/10 text-accent-strong',
          )}
        >
          <Icon className="size-5" aria-hidden="true" />
        </span>
      </div>
      {to && (
        <Link
          to={to}
          className="text-primary-text mt-4 inline-flex text-sm font-medium after:absolute after:inset-0 hover:underline"
        >
          Ver {title.toLowerCase()}
        </Link>
      )}
    </Card>
  );
}
