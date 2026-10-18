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

/**
 * 400 de **regra de negócio** (a API devolve `message` como texto), e não de validação
 * de campos (em que `message` é uma lista). Ex.: link de redefinição inválido ou expirado.
 */
export function isBusinessRuleError(error: unknown): boolean {
  return (
    axios.isAxiosError<ApiErrorResponse>(error) &&
    error.response?.status === 400 &&
    typeof error.response.data?.message === 'string'
  );
}

/** Status HTTP de um erro da API, se houver. */
export function getErrorStatus(error: unknown): number | undefined {
  return axios.isAxiosError(error) ? error.response?.status : undefined;
}
