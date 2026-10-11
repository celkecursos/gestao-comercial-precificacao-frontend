import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { setUnauthorizedHandler } from '@/services/api';
import { authService } from '@/services/authService';
import { tokenStorage } from '@/services/token-storage';
import type { AuthResponse, LoginCredentials } from '@/types/auth';
import type { User } from '@/types/user';
import { AuthContext, type AuthStatus } from './auth-context';

/**
 * Estado central de autenticação: guarda o token, carrega o usuário ao abrir a aplicação
 * e encerra a sessão automaticamente quando a API responde 401.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<AuthStatus>(() =>
    tokenStorage.get() ? 'loading' : 'unauthenticated',
  );
  const [sessionExpired, setSessionExpired] = useState(false);

  const clearSession = useCallback(() => {
    tokenStorage.clear();
    setUser(null);
    setStatus('unauthenticated');
  }, []);

  const applySession = useCallback((session: AuthResponse) => {
    tokenStorage.set(session.accessToken);
    setUser(session.user);
    setStatus('authenticated');
    setSessionExpired(false);
  }, []);

  // Sessão expirada/inválida detectada por qualquer chamada à API.
  useEffect(() => {
    setUnauthorizedHandler(() => {
      if (!tokenStorage.get()) return;
      setSessionExpired(true);
      clearSession();
    });
    return () => setUnauthorizedHandler(null);
  }, [clearSession]);

  // Restaura a sessão salva ao abrir a aplicação.
  useEffect(() => {
    if (!tokenStorage.get()) return;
    let cancelled = false;
    authService
      .me()
      .then((currentUser) => {
        if (cancelled) return;
        setUser(currentUser);
        setStatus('authenticated');
      })
      .catch(() => {
        if (!cancelled) clearSession();
      });
    return () => {
      cancelled = true;
    };
  }, [clearSession]);

  const login = useCallback(
    async (credentials: LoginCredentials) => {
      applySession(await authService.login(credentials));
    },
    [applySession],
  );

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch {
      // Mesmo que a API falhe, a sessão local é encerrada.
    } finally {
      setSessionExpired(false);
      clearSession();
    }
  }, [clearSession]);

  const value = useMemo(
    () => ({ user, status, sessionExpired, login, logout, setUser, applySession }),
    [user, status, sessionExpired, login, logout, applySession],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
