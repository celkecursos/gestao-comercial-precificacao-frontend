import { cn } from '@/utils/cn';

interface SpinnerProps {
  className?: string;
  /** Texto para leitores de tela. Omitir quando o spinner for decorativo. */
  label?: string;
}

export function Spinner({ className, label }: SpinnerProps) {
  return (
    <span role={label ? 'status' : undefined} className="inline-flex items-center">
      <span
        aria-hidden="true"
        className={cn(
          'inline-block size-4 animate-spin rounded-full border-2 border-current border-r-transparent',
          className,
        )}
      />
      {label && <span className="sr-only">{label}</span>}
    </span>
  );
}
