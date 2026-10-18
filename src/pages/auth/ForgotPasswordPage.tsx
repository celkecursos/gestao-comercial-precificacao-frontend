import { ArrowLeft, Send } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { Link, useLocation } from 'react-router';
import { Alert } from '@/components/feedback/Alert';
import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/fields';
import { useFormState } from '@/hooks/useFormState';
import { ROUTES } from '@/routes/paths';
import { authService } from '@/services/authService';
import type { ForgotPasswordPayload } from '@/types/auth';
import { isEmail, type FieldErrors } from '@/utils/validation';
import { authLinkClasses } from './auth-classes';
import { AuthLayout } from './AuthLayout';

function validate({ email }: ForgotPasswordPayload): FieldErrors<ForgotPasswordPayload> {
  return {
    email: !email.trim()
      ? 'Informe seu e-mail.'
      : !isEmail(email)
        ? 'Informe um e-mail válido.'
        : undefined,
  };
}

function BackToLogin() {
  return (
    <Link
      to={ROUTES.login}
      className={`${authLinkClasses} inline-flex items-center gap-1.5`}
    >
      <ArrowLeft className="size-4" aria-hidden="true" />
      Voltar para o login
    </Link>
  );
}

/**
 * Pedido do link de redefinição de senha. Depois do envio, a mensagem é sempre a mesma,
 * exista ou não uma conta com o e-mail — como a API, a tela não revela quem é cadastrado.
 */
export function ForgotPasswordPage() {
  const location = useLocation();
  const initialEmail = (location.state as { email?: string } | null)?.email ?? '';
  const form = useFormState<ForgotPasswordPayload>({ email: initialEmail }, validate);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const ok = await form.submit((values) =>
      authService.forgotPassword({ email: values.email.trim() }),
    );
    if (ok) setSent(true);
  };

  if (sent) {
    return (
      <AuthLayout
        title="Verifique seu e-mail"
        description="Enviamos as instruções para redefinir sua senha."
      >
        <Alert variant="success">
          Se houver uma conta ativa com o e-mail informado, você receberá em instantes um
          link para criar uma nova senha. O link vale por 1 hora. Confira também a caixa
          de spam.
        </Alert>
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <BackToLogin />
          <Button variant="ghost" size="sm" onClick={() => setSent(false)}>
            Não recebeu? Enviar de novo
          </Button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Esqueceu sua senha?"
      documentTitle="Esqueci minha senha"
      description="Informe o e-mail da sua conta e enviaremos um link para criar uma nova senha."
    >
      {form.submitError && (
        <Alert variant="error" className="mb-4">
          {form.submitError}
        </Alert>
      )}

      <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-4">
        <TextField
          label="E-mail"
          type="email"
          name="email"
          autoComplete="username"
          placeholder="voce@empresa.com.br"
          value={form.values.email}
          onChange={(event) => form.setField('email', event.target.value)}
          error={form.errors.email}
          required
        />

        <Button
          type="submit"
          size="lg"
          loading={form.submitting}
          icon={<Send className="size-4" aria-hidden="true" />}
          className="mt-2 w-full"
        >
          {form.submitting ? 'Enviando...' : 'Enviar link'}
        </Button>
      </form>

      <div className="mt-6 text-center">
        <BackToLogin />
      </div>
    </AuthLayout>
  );
}
