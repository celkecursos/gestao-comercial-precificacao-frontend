import { X } from 'lucide-react';
import { useEffect, useId, useRef, type ReactNode } from 'react';
import { cn } from '@/utils/cn';
import { IconButton } from './IconButton';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

const SIZES = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl' };

/**
 * Modal baseado no elemento nativo <dialog>: foco preso no conteúdo, fechamento com Esc
 * e semântica acessível sem dependências extras.
 */
export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md',
}: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      className={cn(
        'border-border bg-surface text-foreground backdrop:bg-navy-950/60 m-auto w-[calc(100%-2rem)] rounded-xl border p-0 shadow-2xl backdrop:backdrop-blur-sm dark:backdrop:bg-black/70',
        SIZES[size],
      )}
    >
      {open && (
        <div className="flex max-h-[85vh] flex-col">
          <header className="border-border flex items-start justify-between gap-4 border-b px-5 py-4">
            <div>
              <h2 id={titleId} className="text-lg font-semibold">
                {title}
              </h2>
              {description && (
                <p id={descriptionId} className="text-muted mt-0.5 text-sm">
                  {description}
                </p>
              )}
            </div>
            <IconButton
              label="Fechar"
              icon={<X className="size-4" />}
              onClick={onClose}
            />
          </header>
          <div className="overflow-y-auto px-5 py-4">{children}</div>
          {footer && (
            <footer className="border-border flex flex-col-reverse gap-2 border-t px-5 py-4 sm:flex-row sm:justify-end">
              {footer}
            </footer>
          )}
        </div>
      )}
    </dialog>
  );
}
