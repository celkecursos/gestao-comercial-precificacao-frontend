import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { cn } from '@/utils/cn';

/** Alterna entre tema claro e escuro. A preferência é salva no navegador. */
export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';
  const label = isDark ? 'Ativar tema claro' : 'Ativar tema escuro';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={label}
      title={label}
      className={cn(
        'border-border bg-surface text-muted hover:text-foreground inline-flex size-9 cursor-pointer items-center justify-center rounded-lg border shadow-sm transition-colors',
        className,
      )}
    >
      {isDark ? (
        <Sun className="text-accent size-4" aria-hidden="true" />
      ) : (
        <Moon className="size-4" aria-hidden="true" />
      )}
    </button>
  );
}
