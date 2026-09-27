import axios from 'axios';
import type { ApiErrorResponse } from '@/types/api';

const NETWORK_ERROR_MESSAGE =
  'Não foi possível conectar ao servidor. Verifique sua conexão ou se a API está disponível.';

/** Extrai uma mensagem legível de qualquer erro (resposta da API, rede ou exceção). */
export function getErrorMessage(
  error: unknown,
  fallback = 'Ocorreu um erro inesperado.',
): string {
  if (axios.isAxiosError<ApiErrorResponse>(error)) {
    if (!error.response) return NETWORK_ERROR_MESSAGE;
    const message = error.response.data?.message;
    if (Array.isArray(message)) return message.join(' ');
    if (message) return message;
    return fallback;
  }
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}

/** Status HTTP de um erro da API, se houver. */
export function getErrorStatus(error: unknown): number | undefined {
  return axios.isAxiosError(error) ? error.response?.status : undefined;
}
