import { Navigate, createBrowserRouter } from 'react-router';
import { AdminLayout } from '@/layouts/AdminLayout';
import { LoginPage } from '@/pages/auth/LoginPage';
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
 * - Públicas: somente /login (usuário autenticado é redirecionado ao painel).
 * - Privadas: dentro de ProtectedRoute + AdminLayout.
 */
export const router = createBrowserRouter([
  {
    element: <PublicOnlyRoute />,
    children: [{ path: ROUTES.login, element: <LoginPage /> }],
  },
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
