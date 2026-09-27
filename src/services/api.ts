import axios from 'axios';
import { env } from '@/config/env';
import { tokenStorage } from './token-storage';

/**
 * Cliente HTTP único da aplicação. Todas as chamadas à API passam por aqui,
 * através dos serviços de src/services — nunca diretamente pelos componentes.
 */
export const api = axios.create({
  baseURL: env.apiUrl,
  headers: { 'Content-Type': 'application/json' },
  timeout: 20_000,
});

api.interceptors.request.use((config) => {
  const token = tokenStorage.get();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

type UnauthorizedHandler = () => void;
let unauthorizedHandler: UnauthorizedHandler | null = null;

/** Registra a ação executada quando a API responder 401 (sessão expirada ou inválida). */
export function setUnauthorizedHandler(handler: UnauthorizedHandler | null): void {
  unauthorizedHandler = handler;
}

/** Rotas cujo 401 faz parte do fluxo normal e não significa sessão expirada. */
const IGNORE_UNAUTHORIZED = ['/auth/login'];

api.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (
      axios.isAxiosError(error) &&
      error.response?.status === 401 &&
      !IGNORE_UNAUTHORIZED.some((url) => error.config?.url?.startsWith(url))
    ) {
      unauthorizedHandler?.();
    }
    return Promise.reject(error);
  },
);
