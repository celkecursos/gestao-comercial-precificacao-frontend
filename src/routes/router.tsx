import { Navigate, createBrowserRouter } from 'react-router';
import { AdminLayout } from '@/layouts/AdminLayout';
import { ForgotPasswordPage } from '@/pages/auth/ForgotPasswordPage';
import { LoginPage } from '@/pages/auth/LoginPage';
import { ResetPasswordPage } from '@/pages/auth/ResetPasswordPage';
import { NotFoundPage } from '@/pages/errors/NotFoundPage';
import { Role } from '@/types/user';
import { ProtectedRoute, PublicOnlyRoute, RoleGuard } from './guards';
import {
  DashboardPage,
  PricingFormulasPage,
  ProductsPage,
  ProfilePage,
  QuotationsPage,
  UsersPage,
} from './lazy-pages';
import { ROUTES } from './paths';

/**
 * Rotas da aplicação.
 * - Só para quem não está logado: /login e /esqueci-senha (usuário autenticado é
 *   redirecionado ao painel).
 * - Públicas para todos: /redefinir-senha — o link do e-mail precisa funcionar mesmo
 *   com uma sessão aberta no navegador.
 * - Privadas: dentro de ProtectedRoute + AdminLayout.
 */
export const router = createBrowserRouter([
  {
    element: <PublicOnlyRoute />,
    children: [
      { path: ROUTES.login, element: <LoginPage /> },
      { path: ROUTES.forgotPassword, element: <ForgotPasswordPage /> },
    ],
  },
  { path: ROUTES.resetPassword, element: <ResetPasswordPage /> },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          { index: true, element: <Navigate to={ROUTES.dashboard} replace /> },
          { path: ROUTES.dashboard, element: <DashboardPage /> },
          {
            path: ROUTES.users,
            element: (
              <RoleGuard roles={[Role.Admin]}>
                <UsersPage />
              </RoleGuard>
            ),
          },
          { path: ROUTES.products, element: <ProductsPage /> },
          { path: ROUTES.quotations, element: <QuotationsPage /> },
          { path: ROUTES.pricingFormulas, element: <PricingFormulasPage /> },
          { path: ROUTES.profile, element: <ProfilePage /> },
        ],
      },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
]);
