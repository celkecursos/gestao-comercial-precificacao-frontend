import { Eye, EyeOff, LogIn } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { Link } from 'react-router';
import { Alert } from '@/components/feedback/Alert';
import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/fields';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/routes/paths';
import type { LoginCredentials } from '@/types/auth';
import { getErrorMessage } from '@/utils/errors';
import { hasErrors, isEmail, type FieldErrors } from '@/utils/validation';
import { authLinkClasses } from './auth-classes';
import { AuthLayout } from './AuthLayout';

function validate({ email, password }: LoginCredentials): FieldErrors<LoginCredentials> {
  return {
    email: !email.trim()
      ? 'Informe seu e-mail.'
      : !isEmail(email)
        ? 'Informe um e-mail válido.'
        : undefined,
    password: password ? undefined : 'Informe sua senha.',
  };
}

export function LoginPage() {
  const { login, sessionExpired } = useAuth();
  const [form, setForm] = useState<LoginCredentials>({ email: '', password: '' });
  const [errors, setErrors] = useState<FieldErrors<LoginCredentials>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const update = (field: keyof LoginCredentials, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    if (errors[field]) setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validation = validate(form);
    setErrors(validation);
    setSubmitError(null);
    if (hasErrors(validation)) return;

    setSubmitting(true);
    try {
      // Após o login, o PublicOnlyRoute redireciona para o painel.
      await login({ email: form.email.trim(), password: form.password });
    } catch (error) {
      setSubmitError(getErrorMessage(error, 'Não foi possível entrar. Tente novamente.'));
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Acesse sua conta"
      documentTitle="Entrar"
      description="Entre com seu e-mail e senha para continuar."
    >
      {sessionExpired && !submitError && (
        <Alert variant="warning" className="mb-4">
          Sua sessão expirou. Entre novamente para continuar.
        </Alert>
      )}
      {submitError && (
        <Alert variant="error" className="mb-4">
          {submitError}
        </Alert>
      )}

      <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-4">
        <TextField
          label="E-mail"
          type="email"
          name="email"
          autoComplete="username"
          placeholder="voce@empresa.com.br"
          value={form.email}
          onChange={(event) => update('email', event.target.value)}
          error={errors.email}
          required
        />

        <div className="flex flex-col gap-2">
          <div className="relative">
            <TextField
              label="Senha"
              type={showPassword ? 'text' : 'password'}
              name="password"
              autoComplete="current-password"
              placeholder="••••••••"
              value={form.password}
              onChange={(event) => update('password', event.target.value)}
              error={errors.password}
              required
              className="pr-11"
            />
            <button
              type="button"
              onClick={() => setShowPassword((current) => !current)}
              aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
              aria-pressed={showPassword}
              className="text-muted hover:text-foreground absolute top-[1.85rem] right-1.5 inline-flex size-8 cursor-pointer items-center justify-center rounded-md"
            >
              {showPassword ? (
                <EyeOff className="size-4" aria-hidden="true" />
              ) : (
                <Eye className="size-4" aria-hidden="true" />
              )}
            </button>
          </div>
          {/* Leva o e-mail já digitado para a tela de recuperação. */}
          <Link
            to={ROUTES.forgotPassword}
            state={{ email: form.email.trim() }}
            className={`${authLinkClasses} self-end`}
          >
            Esqueci minha senha
          </Link>
        </div>

        <Button
          type="submit"
          size="lg"
          loading={submitting}
          icon={<LogIn className="size-4" aria-hidden="true" />}
          className="mt-2 w-full"
        >
          {submitting ? 'Entrando...' : 'Entrar'}
        </Button>
      </form>
    </AuthLayout>
  );
}
