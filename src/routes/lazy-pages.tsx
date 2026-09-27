import { lazy } from 'react';

// Páginas do painel carregadas sob demanda (code splitting por rota).
export const DashboardPage = lazy(() =>
  import('@/pages/dashboard/DashboardPage').then((m) => ({ default: m.DashboardPage })),
);
export const UsersPage = lazy(() =>
  import('@/pages/users/UsersPage').then((m) => ({ default: m.UsersPage })),
);
export const ProductsPage = lazy(() =>
  import('@/pages/products/ProductsPage').then((m) => ({ default: m.ProductsPage })),
);
export const QuotationsPage = lazy(() =>
  import('@/pages/quotations/QuotationsPage').then((m) => ({
    default: m.QuotationsPage,
  })),
);
export const PricingFormulasPage = lazy(() =>
  import('@/pages/pricing/PricingFormulasPage').then((m) => ({
    default: m.PricingFormulasPage,
  })),
);
export const ProfilePage = lazy(() =>
  import('@/pages/profile/ProfilePage').then((m) => ({ default: m.ProfilePage })),
);
