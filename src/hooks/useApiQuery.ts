import { useCallback, useEffect, useEffectEvent, useState } from 'react';
import { getErrorMessage } from '@/utils/errors';

interface QueryResult<T> {
  requestKey: string;
  data?: T;
  error?: string;
}

export interface ApiQuery<T> {
  /** Último dado carregado (mantido durante um novo carregamento, evitando "piscar" a tela). */
  data: T | undefined;
  error: string | undefined;
  loading: boolean;
  /** Refaz a consulta (ex.: após criar, editar ou excluir um registro). */
  reload: () => void;
}

/**
 * Executa uma consulta à API e controla loading/erro/recarga.
 *
 * @param fetcher função que chama um serviço de src/services
 * @param key identifica os parâmetros da consulta; quando muda, a consulta é refeita
 *
 * @example
 * const { data, loading, error, reload } = useApiQuery(
 *   () => productService.list(params),
 *   JSON.stringify(params),
 * );
 */
export function useApiQuery<T>(fetcher: () => Promise<T>, key: string): ApiQuery<T> {
  const [reloadCount, setReloadCount] = useState(0);
  const [result, setResult] = useState<QueryResult<T>>();
  const requestKey = `${key}#${reloadCount}`;

  const runFetcher = useEffectEvent(fetcher);

  useEffect(() => {
    let cancelled = false;
    runFetcher()
      .then((data) => {
        if (!cancelled) setResult({ requestKey, data });
      })
      .catch((error: unknown) => {
        if (!cancelled) setResult({ requestKey, error: getErrorMessage(error) });
      });
    return () => {
      cancelled = true;
    };
  }, [requestKey]);

  const reload = useCallback(() => setReloadCount((count) => count + 1), []);
  const loading = result?.requestKey !== requestKey;

  return {
    data: result?.data,
    error: loading ? undefined : result?.error,
    loading,
    reload,
  };
}
