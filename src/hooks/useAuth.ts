import { useContext } from 'react';
import { AuthContext, type AuthContextValue } from '@/contexts/auth-context';
import { Role } from '@/types/user';

export function useAuth(): AuthContextValue & { isAdmin: boolean } {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth deve ser usado dentro de <AuthProvider>.');
  return { ...context, isAdmin: context.user?.role === Role.Admin };
}
