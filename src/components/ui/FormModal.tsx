import { useId, type FormEvent, type ReactNode } from 'react';
import { Alert } from '@/components/feedback/Alert';
import { Button } from './Button';
import { Modal } from './Modal';

interface FormModalProps {
  open: boolean;
  title: string;
  description?: string;
  submitLabel?: string;
  submitting: boolean;
  error?: string | null;
  onSubmit: () => void;
  onClose: () => void;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

/** Modal com formulário, botões Cancelar/Salvar e exibição de erro da API. */
export function FormModal({
  open,
  title,
  description,
  submitLabel = 'Salvar',
  submitting,
  error,
  onSubmit,
  onClose,
  children,
  size,
}: FormModalProps) {
  const formId = useId();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit();
  };

  return (
    <Modal
      open={open}
      onClose={submitting ? () => undefined : onClose}
      title={title}
      description={description}
      size={size}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={submitting}>
            Cancelar
          </Button>
          <Button type="submit" form={formId} loading={submitting}>
            {submitLabel}
          </Button>
        </>
      }
    >
      {error && (
        <Alert variant="error" className="mb-4">
          {error}
        </Alert>
      )}
      <form
        id={formId}
        noValidate
        onSubmit={handleSubmit}
        className="flex flex-col gap-4"
      >
        {children}
      </form>
    </Modal>
  );
}
