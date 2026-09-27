import type { ReactNode } from 'react';
import { EmptyState, ErrorState, LoadingState } from '@/components/feedback/states';
import type { ApiQuery } from '@/hooks/useApiQuery';
import type { Paginated } from '@/types/api';
import { Pagination } from './Pagination';

interface ListContentProps<T> {
  query: ApiQuery<Paginated<T>>;
  emptyTitle: string;
  emptyDescription?: string;
  emptyAction?: ReactNode;
  onPageChange: (page: number) => void;
  /** Renderiza a tabela com as linhas carregadas. */
  children: (rows: T[], busy: boolean) => ReactNode;
}

/**
 * Estados padrão de uma listagem paginada: carregando, erro, vazio e dados + paginação.
 */
export function ListContent<T>({
  query,
  emptyTitle,
  emptyDescription,
  emptyAction,
  onPageChange,
  children,
}: ListContentProps<T>) {
  const { data, error, loading, reload } = query;

  if (loading && !data) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={reload} />;
  if (!data || data.data.length === 0) {
    return (
      <EmptyState
        title={emptyTitle}
        description={emptyDescription}
        action={emptyAction}
      />
    );
  }

  return (
    <>
      {children(data.data, loading)}
      <Pagination meta={data.meta} onPageChange={onPageChange} />
    </>
  );
}
