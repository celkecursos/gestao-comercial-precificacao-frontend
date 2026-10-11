import { X } from 'lucide-react';
import { Suspense, useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router';
import { LoadingState } from '@/components/feedback/states';
import { IconButton } from '@/components/ui/IconButton';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/routes/paths';
import { cn } from '@/utils/cn';
import { Header } from './Header';
import { Sidebar } from './Sidebar';

/** Estrutura do painel: menu lateral, cabeçalho e área de conteúdo. */
export function AdminLayout() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  // Fecha a gaveta do menu com Esc (celular/tablet).
  useEffect(() => {
    if (!menuOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [menuOpen]);

  const handleLogout = async () => {
    setMenuOpen(false);
    await logout();
    navigate(ROUTES.login, { replace: true });
  };

  return (
    <div className="bg-background min-h-screen">
      <a
        href="#conteudo"
        className="focus:bg-primary focus:text-primary-foreground sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-lg focus:px-4 focus:py-2"
      >
        Pular para o conteúdo
      </a>

      {/* Menu fixo (desktop) */}
      <aside className="border-border bg-sidebar fixed inset-y-0 left-0 z-30 hidden w-64 border-r lg:block">
        <Sidebar onLogout={handleLogout} />
      </aside>

      {/* Menu em gaveta (celular/tablet) */}
      <div
        className={cn('fixed inset-0 z-40 lg:hidden', !menuOpen && 'pointer-events-none')}
        aria-hidden={!menuOpen}
      >
        <div
          className={cn(
            'bg-navy-950/60 absolute inset-0 transition-opacity dark:bg-black/70',
            menuOpen ? 'opacity-100' : 'opacity-0',
          )}
          onClick={() => setMenuOpen(false)}
          aria-hidden="true"
        />
        <aside
          aria-label="Menu"
          inert={!menuOpen}
          className={cn(
            'border-border bg-sidebar absolute inset-y-0 left-0 w-72 max-w-[85vw] border-r shadow-xl transition-transform',
            menuOpen ? 'translate-x-0' : '-translate-x-full',
          )}
        >
          <IconButton
            label="Fechar menu"
            icon={<X className="size-5" />}
            onClick={() => setMenuOpen(false)}
            className="absolute top-3.5 right-3"
          />
          <Sidebar onNavigate={() => setMenuOpen(false)} onLogout={handleLogout} />
        </aside>
      </div>

      <div className="lg:pl-64">
        <Header onOpenMenu={() => setMenuOpen(true)} onLogout={handleLogout} />
        <main
          id="conteudo"
          className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8"
        >
          <Suspense fallback={<LoadingState />}>
            <Outlet />
          </Suspense>
        </main>
      </div>
    </div>
  );
}
