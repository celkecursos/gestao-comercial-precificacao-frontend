import { Link } from 'react-router';
import { LogoMark } from '@/components/layout/Logo';
import { ThemeToggle } from '@/components/layout/ThemeToggle';
import { ROUTES } from '@/routes/paths';

export function NotFoundPage() {
  return (
    <main className="bg-background relative flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
      <ThemeToggle className="absolute top-5 right-5" />
      <LogoMark className="size-12" />
      <p className="text-primary-text text-6xl font-bold tracking-tight">404</p>
      <h1 className="text-foreground text-xl font-semibold">Página não encontrada</h1>
      <p className="text-muted max-w-sm text-sm">
        O endereço acessado não existe ou foi alterado.
      </p>
      <Link
        to={ROUTES.dashboard}
        className="bg-primary text-primary-foreground hover:bg-primary-hover mt-2 rounded-lg px-4 py-2 text-sm font-medium"
      >
        Ir para o início
      </Link>
    </main>
  );
}
