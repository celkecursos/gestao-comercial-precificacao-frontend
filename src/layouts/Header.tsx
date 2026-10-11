import { LogOut, Menu } from 'lucide-react';
import { Link } from 'react-router';
import { ThemeToggle } from '@/components/layout/ThemeToggle';
import { IconButton } from '@/components/ui/IconButton';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/routes/paths';
import { ROLE_LABELS } from '@/types/user';

interface HeaderProps {
  onOpenMenu: () => void;
  onLogout: () => void;
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  return (
    (parts[0]?.[0] ?? '') + (parts.length > 1 ? (parts.at(-1)?.[0] ?? '') : '')
  ).toUpperCase();
}

export function Header({ onOpenMenu, onLogout }: HeaderProps) {
  const { user } = useAuth();

  return (
    <header className="border-border bg-sidebar/90 sticky top-0 z-20 flex h-16 items-center gap-3 border-b px-4 backdrop-blur sm:px-6">
      <IconButton
        label="Abrir menu"
        icon={<Menu className="size-5" />}
        onClick={onOpenMenu}
        className="lg:hidden"
      />

      <div className="ml-auto flex items-center gap-2 sm:gap-3">
        <ThemeToggle />

        {user && (
          <Link
            to={ROUTES.profile}
            className="hover:bg-surface-muted flex items-center gap-2.5 rounded-lg px-1.5 py-1 transition-colors"
          >
            <span
              aria-hidden="true"
              className="bg-primary text-primary-foreground ring-accent/40 flex size-9 items-center justify-center rounded-full text-sm font-semibold ring-2"
            >
              {initials(user.name)}
            </span>
            <span className="hidden text-left leading-tight sm:block">
              <span className="text-foreground block text-sm font-medium">
                {user.name}
              </span>
              <span className="text-muted block text-xs">{ROLE_LABELS[user.role]}</span>
            </span>
            <span className="sr-only sm:hidden">Meu perfil: {user.name}</span>
          </Link>
        )}

        <IconButton
          label="Sair"
          icon={<LogOut className="size-5" />}
          onClick={onLogout}
        />
      </div>
    </header>
  );
}
