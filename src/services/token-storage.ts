const TOKEN_KEY = 'gcp:token';

/** Persistência do token JWT no navegador. */
export const tokenStorage = {
  get(): string | null {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },
  set(token: string): void {
    try {
      localStorage.setItem(TOKEN_KEY, token);
    } catch {
      // Armazenamento indisponível (ex.: modo privado): a sessão não sobrevive ao recarregamento.
    }
  },
  clear(): void {
    try {
      localStorage.removeItem(TOKEN_KEY);
    } catch {
      // ignorado
    }
  },
};
