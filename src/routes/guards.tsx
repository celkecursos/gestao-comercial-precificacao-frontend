import type { ReactNode } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router';
import { LoadingState } from '@/components/feedback/states';
import { useAuth } from '@/hooks/useAuth';
import { AccessDeniedPage } from '@/pages/errors/AccessDeniedPage';
import type { Role } from '@/types/user';
import { ROUTES } from './paths';

function FullScreenLoading() {
  return (
    <div className="bg-background flex min-h-screen items-center justify-center">
      <LoadingState message="Verificando sessão..." />
    </div>
  );
}

/** Rotas privadas: exige usuário autenticado; caso contrário, redireciona para o login. */
export function ProtectedRoute() {
  const { status } = useAuth();
  const location = useLocation();

  if (status === 'loading') return <FullScreenLoading />;
  if (status === 'unauthenticated') {
    return <Navigate to={ROUTES.login} replace state={{ from: location.pathname }} />;
  }
  return <Outlet />;
}

/**
 * Rotas públicas (login): usuário autenticado é enviado para a página que tentou acessar
 * antes do login, ou para o dashboard.
 */
export function PublicOnlyRoute() {
  const { status } = useAuth();
  const location = useLocation();

  if (status === 'loading') return <FullScreenLoading />;
  if (status === 'authenticated') {
    const from = (location.state as { from?: string } | null)?.from;
    return <Navigate to={from ?? ROUTES.dashboard} replace />;
  }
  return <Outlet />;
}

/** Restringe o conteúdo a determinados papéis. */
export function RoleGuard({ roles, children }: { roles: Role[]; children: ReactNode }) {
  const { user } = useAuth();
  if (!user || !roles.includes(user.role)) return <AccessDeniedPage />;
  return children;
}
