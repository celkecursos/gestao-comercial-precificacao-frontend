import { Eye, EyeOff, LogIn } from 'lucide-react';
import { useEffect, useState, type FormEvent } from 'react';
import { Alert } from '@/components/feedback/Alert';
import { Logo } from '@/components/layout/Logo';
import { ThemeToggle } from '@/components/layout/ThemeToggle';
import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/fields';
import { APP_FULL_NAME } from '@/config/app';
import { useAuth } from '@/hooks/useAuth';
import type { LoginCredentials } from '@/types/auth';
import { getErrorMessage } from '@/utils/errors';
import { hasErrors, isEmail, type FieldErrors } from '@/utils/validation';
import { LoginHero } from './LoginHero';

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

  useEffect(() => {
    document.title = `Entrar · ${APP_FULL_NAME}`;
  }, []);

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
    <div className="bg-background relative min-h-screen overflow-hidden">
      {/* Fundo decorativo */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="bg-primary/10 dark:bg-primary/20 absolute -top-40 -left-40 size-[32rem] rounded-full blur-3xl" />
        <div className="bg-accent/10 dark:bg-accent/10 absolute -right-32 -bottom-48 size-[28rem] rounded-full blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--color-border)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-border)_1px,transparent_1px)] [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_70%)] bg-[size:48px_48px] opacity-40" />
      </div>

      <header className="relative z-10 flex items-center justify-between px-5 py-5 sm:px-8">
        <Logo />
        <ThemeToggle />
      </header>

      <main className="relative z-10 mx-auto grid w-full max-w-6xl gap-12 px-5 pt-4 pb-12 sm:px-8 lg:min-h-[calc(100vh-5.5rem)] lg:grid-cols-2 lg:items-center lg:pt-0">
        <LoginHero />

        <section
          aria-labelledby="login-title"
          className="border-border bg-surface shadow-navy-950/5 mx-auto w-full max-w-md rounded-2xl border p-6 shadow-xl sm:p-8 dark:shadow-black/40"
        >
          <div className="mb-6">
            <div className="from-primary to-accent mb-4 h-1 w-12 rounded-full bg-gradient-to-r" />
            <h1 id="login-title" className="text-2xl font-semibold tracking-tight">
              Acesse sua conta
            </h1>
            <p className="text-muted mt-1 text-sm">
              Entre com seu e-mail e senha para continuar.
            </p>
          </div>

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
        </section>
      </main>
    </div>
  );
}
