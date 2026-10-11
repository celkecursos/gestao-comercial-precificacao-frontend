import { createContext } from 'react';
import type { AuthResponse, LoginCredentials } from '@/types/auth';
import type { User } from '@/types/user';

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

export interface AuthContextValue {
  user: User | null;
  status: AuthStatus;
  /** Verdadeiro quando a última sessão terminou por expiração/invalidação do token. */
  sessionExpired: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  /** Atualiza os dados do usuário em memória (ex.: após editar o perfil). */
  setUser: (user: User) => void;
  /** Substitui a sessão atual por uma nova (ex.: novo token após trocar a senha). */
  applySession: (session: AuthResponse) => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
