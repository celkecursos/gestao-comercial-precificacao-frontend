import { useCallback, useState } from 'react';
import { getErrorMessage } from '@/utils/errors';
import { hasErrors, type FieldErrors } from '@/utils/validation';

/**
 * Estado de um formulário: valores, erros por campo, erro da API e envio.
 *
 * @param initialValues valores iniciais
 * @param validate retorna os erros por campo (vazio quando válido)
 */
export function useFormState<T extends object>(
  initialValues: T,
  validate: (values: T) => FieldErrors<T>,
) {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<FieldErrors<T>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const setField = useCallback(<K extends keyof T>(field: K, value: T[K]) => {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) =>
      current[field] ? { ...current, [field]: undefined } : current,
    );
  }, []);

  const reset = useCallback((next: T) => {
    setValues(next);
    setErrors({});
    setSubmitError(null);
    setSubmitting(false);
  }, []);

  /** Valida e, se estiver tudo certo, executa `action`. Retorna true em caso de sucesso. */
  const submit = useCallback(
    async (action: (values: T) => Promise<unknown>): Promise<boolean> => {
      const validation = validate(values);
      setErrors(validation);
      setSubmitError(null);
      if (hasErrors(validation)) return false;

      setSubmitting(true);
      try {
        await action(values);
        return true;
      } catch (error) {
        setSubmitError(getErrorMessage(error));
        return false;
      } finally {
        setSubmitting(false);
      }
    },
    [validate, values],
  );

  return { values, errors, submitError, submitting, setField, reset, submit };
}
