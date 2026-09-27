import { AlertTriangle, Inbox, RotateCw } from 'lucide-react';
import type { ReactNode } from 'react';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { cn } from '@/utils/cn';

export function LoadingState({
  message = 'Carregando...',
  className,
}: {
  message?: string;
  className?: string;
}) {
  return (
    <div
      role="status"
      className={cn(
        'text-muted flex flex-col items-center justify-center gap-3 py-12',
        className,
      )}
    >
      <Spinner className="text-primary size-6" />
      <span className="text-sm">{message}</span>
    </div>
  );
}

export function ErrorState({
  message,
  onRetry,
  className,
}: {
  message: string;
  onRetry?: () => void;
  className?: string;
}) {
  return (
    <div
      role="alert"
      className={cn(
        'flex flex-col items-center justify-center gap-3 px-4 py-12 text-center',
        className,
      )}
    >
      <span className="bg-danger-soft text-danger-text flex size-12 items-center justify-center rounded-full">
        <AlertTriangle className="size-6" aria-hidden="true" />
      </span>
      <div>
        <p className="text-foreground font-medium">Não foi possível carregar os dados</p>
        <p className="text-muted mt-1 text-sm">{message}</p>
      </div>
      {onRetry && (
        <Button
          variant="secondary"
          size="sm"
          icon={<RotateCw className="size-4" aria-hidden="true" />}
          onClick={onRetry}
        >
          Tentar novamente
        </Button>
      )}
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
  className,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3 px-4 py-12 text-center',
        className,
      )}
    >
      <span className="bg-primary-soft text-primary-text flex size-12 items-center justify-center rounded-full">
        <Inbox className="size-6" aria-hidden="true" />
      </span>
      <div>
        <p className="text-foreground font-medium">{title}</p>
        {description && <p className="text-muted mt-1 text-sm">{description}</p>}
      </div>
      {action}
    </div>
  );
}
