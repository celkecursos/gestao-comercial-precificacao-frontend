import { KeyRound, LogIn, Send } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { Link, useSearchParams } from 'react-router';
import { Alert } from '@/components/feedback/Alert';
import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/fields';
import { useAuth } from '@/hooks/useAuth';
import { useFormState } from '@/hooks/useFormState';
import { ROUTES } from '@/routes/paths';
import { authService } from '@/services/authService';
import { getErrorMessage, isBusinessRuleError } from '@/utils/errors';
import { PASSWORD_HINT, isStrongPassword, type FieldErrors } from '@/utils/validation';
import { authLinkClasses, authPrimaryLinkClasses } from './auth-classes';
import { AuthLayout } from './AuthLayout';

interface ResetFormValues {
  newPassword: string;
  confirmPassword: string;
}

const EMPTY: ResetFormValues = { newPassword: '', confirmPassword: '' };

const INVALID_LINK_MESSAGE =
  'Este link de redefinição é inválido ou expirou. Solicite um novo.';

function validate(values: ResetFormValues): FieldErrors<ResetFormValues> {
  return {
    newPassword: !values.newPassword
      ? 'Informe a nova senha.'
      : !isStrongPassword(values.newPassword)
        ? PASSWORD_HINT
        : undefined,
    confirmPassword:
      values.confirmPassword === values.newPassword
        ? undefined
        : 'A confirmação não confere com a nova senha.',
  };
}

type View = 'form' | 'invalid' | 'done';

/**
 * Definição da nova senha a partir do link do e-mail (`?token=`). Rota pública, acessível
 * mesmo com uma sessão aberta: quem está logado também pode receber o link. A API invalida
 * todas as sessões do usuário, então uma sessão local é encerrada ao concluir.
 */
export function ResetPasswordPage() {
  const [params] = useSearchParams();
  const token = params.get('token')?.trim() ?? '';
  const { status, logout } = useAuth();
  const form = useFormState(EMPTY, validate);
  const [view, setView] = useState<View>(token ? 'form' : 'invalid');
  const [invalidMessage, setInvalidMessage] = useState(INVALID_LINK_MESSAGE);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const ok = await form.submit(async (values) => {
      try {
        await authService.resetPassword({ token, newPassword: values.newPassword });
      } catch (error) {
        // Token inválido, expirado ou já usado: não adianta tentar de novo com este link.
        if (isBusinessRuleError(error)) {
          setInvalidMessage(getErrorMessage(error, INVALID_LINK_MESSAGE));
          setView('invalid');
        }
        throw error;
      }
    });
    if (!ok) return;

    if (status === 'authenticated') await logout();
    setView('done');
  };

  if (view === 'invalid') {
    return (
      <AuthLayout
        title="Link inválido"
        documentTitle="Redefinir senha"
        description="Não foi possível usar este link de redefinição de senha."
      >
        <Alert variant="error">{invalidMessage}</Alert>
        <div className="mt-6 flex flex-col items-center gap-4">
          <Link to={ROUTES.forgotPassword} className={authPrimaryLinkClasses}>
            <Send className="size-4" aria-hidden="true" />
            Solicitar um novo link
          </Link>
          <Link to={ROUTES.login} className={authLinkClasses}>
            Voltar para o login
          </Link>
        </div>
      </AuthLayout>
    );
  }

  if (view === 'done') {
    return (
      <AuthLayout
        title="Senha redefinida"
        documentTitle="Redefinir senha"
        description="Sua nova senha já está valendo."
      >
        <Alert variant="success">
          Senha alterada com sucesso. Por segurança, as sessões abertas em outros
          dispositivos foram encerradas. Entre com a nova senha.
        </Alert>
        <div className="mt-6">
          <Link to={ROUTES.login} className={authPrimaryLinkClasses}>
            <LogIn className="size-4" aria-hidden="true" />
            Ir para o login
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Crie uma nova senha"
      documentTitle="Redefinir senha"
      description="Escolha uma senha forte para voltar a acessar sua conta."
    >
      {form.submitError && (
        <Alert variant="error" className="mb-4">
          {form.submitError}
        </Alert>
      )}

      <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-4">
        <TextField
          label="Nova senha"
          type="password"
          name="newPassword"
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
          name="confirmPassword"
          autoComplete="new-password"
          value={form.values.confirmPassword}
          onChange={(event) => form.setField('confirmPassword', event.target.value)}
          error={form.errors.confirmPassword}
          required
        />

        <Button
          type="submit"
          size="lg"
          loading={form.submitting}
          icon={<KeyRound className="size-4" aria-hidden="true" />}
          className="mt-2 w-full"
        >
          {form.submitting ? 'Salvando...' : 'Redefinir senha'}
        </Button>
      </form>

      <div className="mt-6 text-center">
        <Link to={ROUTES.login} className={authLinkClasses}>
          Voltar para o login
        </Link>
      </div>
    </AuthLayout>
  );
}
