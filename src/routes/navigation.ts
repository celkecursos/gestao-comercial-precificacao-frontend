import {
  Calculator,
  LayoutDashboard,
  LineChart,
  Package,
  UserCircle,
  Users,
  type LucideIcon,
} from 'lucide-react';
import { Role } from '@/types/user';
import { ROUTES } from './paths';

export interface NavigationItem {
  label: string;
  to: string;
  icon: LucideIcon;
  /** Quando definido, o item só aparece para estes papéis. */
  roles?: Role[];
}

/** Itens do menu lateral. Para adicionar uma nova tela, inclua-a aqui e em router.tsx. */
export const NAVIGATION: NavigationItem[] = [
  { label: 'Dashboard', to: ROUTES.dashboard, icon: LayoutDashboard },
  { label: 'Usuários', to: ROUTES.users, icon: Users, roles: [Role.Admin] },
  { label: 'Produtos', to: ROUTES.products, icon: Package },
  { label: 'Cotações', to: ROUTES.quotations, icon: LineChart },
  { label: 'Fórmulas', to: ROUTES.pricingFormulas, icon: Calculator },
  { label: 'Meu Perfil', to: ROUTES.profile, icon: UserCircle },
];
