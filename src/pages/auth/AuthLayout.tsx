import { useEffect, useId, type ReactNode } from 'react';
import { Logo } from '@/components/layout/Logo';
import { ThemeToggle } from '@/components/layout/ThemeToggle';
import { APP_FULL_NAME } from '@/config/app';
import { LoginHero } from './LoginHero';

interface AuthLayoutProps {
  /** Título do cartão (h1) — também compõe o título da aba. */
  title: string;
  /** Prefixo do título da aba, quando diferente do `title` (ex.: "Entrar"). */
  documentTitle?: string;
  description: ReactNode;
  children: ReactNode;
}

/**
 * Moldura das telas públicas de conta (login, esqueci a senha, redefinir senha):
 * fundo decorativo, cabeçalho com logo e tema, painel institucional e o cartão central.
 */
export function AuthLayout({
  title,
  documentTitle,
  description,
  children,
}: AuthLayoutProps) {
  const titleId = useId();

  useEffect(() => {
    document.title = `${documentTitle ?? title} · ${APP_FULL_NAME}`;
  }, [documentTitle, title]);

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
          aria-labelledby={titleId}
          className="border-border bg-surface shadow-navy-950/5 mx-auto w-full max-w-md rounded-2xl border p-6 shadow-xl sm:p-8 dark:shadow-black/40"
        >
          <div className="mb-6">
            <div className="from-primary to-accent mb-4 h-1 w-12 rounded-full bg-gradient-to-r" />
            <h1 id={titleId} className="text-2xl font-semibold tracking-tight">
              {title}
            </h1>
            <p className="text-muted mt-1 text-sm">{description}</p>
          </div>

          {children}
        </section>
      </main>
    </div>
  );
}
