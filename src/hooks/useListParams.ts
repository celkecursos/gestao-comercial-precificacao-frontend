import { useCallback, useState } from 'react';
import { useDebouncedValue } from './useDebouncedValue';

/**
 * Estado padrão das telas de listagem: texto de busca (com debounce) e página atual.
 * Alterar a busca volta automaticamente para a primeira página.
 */
export function useListParams(initialLimit = 10) {
  const [search, setSearchValue] = useState('');
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebouncedValue(search.trim());

  const setSearch = useCallback((value: string) => {
    setSearchValue(value);
    setPage(1);
  }, []);

  return {
    search,
    setSearch,
    debouncedSearch,
    page,
    setPage,
    limit: initialLimit,
  };
}
