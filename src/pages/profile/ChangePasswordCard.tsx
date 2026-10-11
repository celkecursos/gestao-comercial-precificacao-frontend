import { KeyRound } from 'lucide-react';
import type { FormEvent } from 'react';
import { Alert } from '@/components/feedback/Alert';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader } from '@/components/ui/Card';
import { TextField } from '@/components/ui/fields';
import { useAuth } from '@/hooks/useAuth';
import { useFormState } from '@/hooks/useFormState';
import { useToast } from '@/hooks/useToast';
import { authService } from '@/services/authService';
import { PASSWORD_HINT, isStrongPassword, type FieldErrors } from '@/utils/validation';

interface PasswordFormValues {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const EMPTY: PasswordFormValues = {
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
};

function validate(values: PasswordFormValues): FieldErrors<PasswordFormValues> {
  return {
    currentPassword: values.currentPassword ? undefined : 'Informe a senha atual.',
    newPassword: !values.newPassword
      ? 'Informe a nova senha.'
      : !isStrongPassword(values.newPassword)
        ? PASSWORD_HINT
        : values.newPassword === values.currentPassword
          ? 'A nova senha deve ser diferente da atual.'
          : undefined,
    confirmPassword:
      values.confirmPassword === values.newPassword
        ? undefined
        : 'A confirmação não confere com a nova senha.',
  };
}

/**
 * Troca da própria senha. A API invalida os tokens anteriores e devolve um novo token,
 * que substitui a sessão atual para o usuário continuar conectado.
 */
export function ChangePasswordCard() {
  const { applySession } = useAuth();
  const { showToast } = useToast();
  const form = useFormState(EMPTY, validate);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const saved = await form.submit(async (values) => {
      const session = await authService.changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
      applySession(session);
    });
    if (saved) {
      form.reset(EMPTY);
      showToast('Senha alterada com sucesso.');
    }
  };

  return (
    <Card>
      <CardHeader
        title="Alterar senha"
        description="Por segurança, outras sessões abertas serão encerradas."
      />
      <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-4 p-5">
        {form.submitError && <Alert variant="error">{form.submitError}</Alert>}
        <TextField
          label="Senha atual"
          type="password"
          autoComplete="current-password"
          value={form.values.currentPassword}
          onChange={(event) => form.setField('currentPassword', event.target.value)}
          error={form.errors.currentPassword}
          required
        />
        <TextField
          label="Nova senha"
          type="password"
          autoComplete="new-password"
          value={form.values.newPassword}
          onChange={(event) => form.setField('newPassword', event.target.value)}
          error={form.errors.newPassword}
          hint={PASSWORD_HINT}
          required
        />
        <TextField
          label="Confirmar nova senha"
          type="password"
          autoComplete="new-password"
          value={form.values.confirmPassword}
          onChange={(event) => form.setField('confirmPassword', event.target.value)}
          error={form.errors.confirmPassword}
          required
        />
        <div className="flex justify-end">
          <Button
            type="submit"
            loading={form.submitting}
            icon={<KeyRound className="size-4" aria-hidden="true" />}
          >
            Alterar senha
          </Button>
        </div>
      </form>
    </Card>
  );
}
