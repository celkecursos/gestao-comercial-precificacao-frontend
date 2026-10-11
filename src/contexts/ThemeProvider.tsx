import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { THEME_STORAGE_KEY, ThemeContext, type Theme } from './theme-context';

function getInitialTheme(): Theme {
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    if (saved === 'light' || saved === 'dark') return saved;
  } catch {
    // localStorage indisponível
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

/**
 * Controla o tema claro/escuro: aplica a classe `.dark` no <html> (estratégia "dark" do
 * Tailwind) e persiste a escolha no navegador.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  useEffect(() => {
    const root = document.documentElement;
    // Desativa as transições durante a troca para o novo tema ser aplicado de uma vez.
    root.classList.add('theme-switching');
    root.classList.toggle('dark', theme === 'dark');
    root.style.colorScheme = theme;
    const frame = window.requestAnimationFrame(() =>
      window.requestAnimationFrame(() => root.classList.remove('theme-switching')),
    );
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // localStorage indisponível: o tema vale apenas para a sessão atual
    }
    return () => window.cancelAnimationFrame(frame);
  }, [theme]);

  const toggleTheme = useCallback(
    () => setTheme((current) => (current === 'dark' ? 'light' : 'dark')),
    [],
  );

  const value = useMemo(() => ({ theme, setTheme, toggleTheme }), [theme, toggleTheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
