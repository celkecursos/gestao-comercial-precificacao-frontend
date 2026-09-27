import { useCallback, useState } from 'react';
import { getErrorMessage } from '@/utils/errors';
import { useToast } from './useToast';

/**
 * Executa ações de escrita (ativar/desativar, excluir...) exibindo notificação de sucesso
 * ou erro e indicando qual registro está sendo processado.
 */
export function useCrudActions(onSuccess: () => void) {
  const { showToast } = useToast();
  const [pendingId, setPendingId] = useState<number | null>(null);

  const run = useCallback(
    async (id: number, action: () => Promise<unknown>, successMessage: string) => {
      setPendingId(id);
      try {
        await action();
        showToast(successMessage, 'success');
        onSuccess();
        return true;
      } catch (error) {
        showToast(getErrorMessage(error), 'error');
        return false;
      } finally {
        setPendingId(null);
      }
    },
    [onSuccess, showToast],
  );

  return { run, pendingId };
}
