/**
 * Configuração lida das variáveis de ambiente do Vite (embutidas no build).
 * Para apontar para outro backend, altere VITE_API_URL e gere um novo build.
 */
const DEFAULT_API_URL = 'http://localhost:3000';

export const env = {
  apiUrl: (import.meta.env.VITE_API_URL || DEFAULT_API_URL).replace(/\/+$/, ''),
} as const;
