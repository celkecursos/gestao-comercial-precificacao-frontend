/** Filtro de status usado nas listagens (todos, somente ativos, somente inativos). */
export type StatusFilter = 'all' | 'active' | 'inactive';

export const STATUS_FILTER_OPTIONS: ReadonlyArray<{
  value: StatusFilter;
  label: string;
}> = [
  { value: 'all', label: 'Todos' },
  { value: 'active', label: 'Ativos' },
  { value: 'inactive', label: 'Inativos' },
];

/** Converte o filtro de status no parâmetro `active` da API. */
export function parseStatusFilter(filter: StatusFilter): boolean | undefined {
  if (filter === 'active') return true;
  if (filter === 'inactive') return false;
  return undefined;
}
