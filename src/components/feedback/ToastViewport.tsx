import { CheckCircle2, Info, X, XCircle } from 'lucide-react';
import type { Toast } from '@/contexts/toast-context';
import { cn } from '@/utils/cn';

const ICONS = {
  success: <CheckCircle2 className="text-success size-5 shrink-0" aria-hidden="true" />,
  error: <XCircle className="text-danger size-5 shrink-0" aria-hidden="true" />,
  info: <Info className="text-primary size-5 shrink-0" aria-hidden="true" />,
};

interface ToastViewportProps {
  toasts: Toast[];
  onDismiss: (id: number) => void;
}

/** Área fixa onde as notificações são exibidas (anunciadas por leitores de tela). */
export function ToastViewport({ toasts, onDismiss }: ToastViewportProps) {
  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-x-4 bottom-4 z-50 flex flex-col items-end gap-2 sm:inset-x-auto sm:right-6 sm:bottom-6"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          role={toast.variant === 'error' ? 'alert' : 'status'}
          className={cn(
            'border-border bg-surface text-foreground pointer-events-auto flex w-full items-start gap-3 rounded-lg border px-4 py-3 text-sm shadow-lg sm:w-96 dark:shadow-black/40',
          )}
        >
          {ICONS[toast.variant]}
          <p className="flex-1">{toast.message}</p>
          <button
            type="button"
            onClick={() => onDismiss(toast.id)}
            aria-label="Fechar notificação"
            className="text-muted hover:text-foreground cursor-pointer rounded"
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        </div>
      ))}
    </div>
  );
}
