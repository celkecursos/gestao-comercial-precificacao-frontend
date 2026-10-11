import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/utils/cn';

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Obrigatório: descreve a ação para leitores de tela e é exibido como dica. */
  label: string;
  icon: ReactNode;
  tone?: 'default' | 'danger';
}

/** Botão somente com ícone, sempre com rótulo acessível. */
export function IconButton({
  label,
  icon,
  tone = 'default',
  className,
  type = 'button',
  ...props
}: IconButtonProps) {
  return (
    <button
      type={type}
      aria-label={label}
      title={label}
      className={cn(
        'inline-flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-lg transition-colors disabled:cursor-not-allowed disabled:opacity-50',
        tone === 'danger'
          ? 'text-danger-text hover:bg-danger-soft'
          : 'text-muted hover:bg-surface-muted hover:text-foreground',
        className,
      )}
      {...props}
    >
      <span aria-hidden="true" className="inline-flex">
        {icon}
      </span>
    </button>
  );
}
