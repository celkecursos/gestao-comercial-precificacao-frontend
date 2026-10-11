import { APP_NAME, APP_SUBTITLE } from '@/config/app';
import { cn } from '@/utils/cn';

/** Marca do sistema: ícone de tendência de preço + nome. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      aria-hidden="true"
      className={cn('size-9 shrink-0', className)}
    >
      <rect
        width="32"
        height="32"
        rx="8"
        className="fill-navy-950 dark:fill-primary/15"
      />
      <path
        d="M8 22 L13 16 L17 19 L24 10"
        fill="none"
        stroke="#2563EB"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="dark:stroke-blue-400"
      />
      <circle cx="24" cy="10" r="2.5" fill="#06B6D4" />
    </svg>
  );
}

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <LogoMark />
      {!compact && (
        <div className="leading-tight">
          <p className="text-foreground text-sm font-bold">{APP_NAME}</p>
          <p className="text-muted text-xs">{APP_SUBTITLE}</p>
        </div>
      )}
    </div>
  );
}
