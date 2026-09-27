import { LogOut } from 'lucide-react';
import { NavLink } from 'react-router';
import { Logo } from '@/components/layout/Logo';
import { useAuth } from '@/hooks/useAuth';
import { NAVIGATION } from '@/routes/navigation';
import { cn } from '@/utils/cn';

interface SidebarProps {
  onNavigate?: () => void;
  onLogout: () => void;
}

/** Conteúdo do menu lateral (usado fixo no desktop e como gaveta no celular). */
export function Sidebar({ onNavigate, onLogout }: SidebarProps) {
  const { user } = useAuth();
  const items = NAVIGATION.filter(
    (item) => !item.roles || (user && item.roles.includes(user.role)),
  );

  return (
    <div className="flex h-full flex-col">
      <div className="border-border flex h-16 items-center border-b px-5">
        <Logo />
      </div>

      <nav aria-label="Menu principal" className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="flex flex-col gap-1">
          {items.map(({ label, to, icon: Icon }) => (
            <li key={to}>
              <NavLink
                to={to}
                onClick={onNavigate}
                className={({ isActive }) =>
                  cn(
                    'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-primary/30 shadow-sm'
                      : 'text-muted hover:bg-surface-muted hover:text-foreground',
                  )
                }
              >
                <Icon className="size-5 shrink-0" aria-hidden="true" />
                {label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="border-border border-t p-3">
        <button
          type="button"
          onClick={onLogout}
          className="text-muted hover:bg-danger-soft hover:text-danger-text flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors"
        >
          <LogOut className="size-5 shrink-0" aria-hidden="true" />
          Sair
        </button>
      </div>
    </div>
  );
}
