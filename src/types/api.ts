/** Metadados de paginação retornados pelas listagens da API. */
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/** Resposta paginada padrão: `{ data, meta }`. */
export interface Paginated<T> {
  data: T[];
  meta: PaginationMeta;
}

/** Parâmetros de paginação aceitos pelas listagens. */
export interface PaginationParams {
  page?: number;
  limit?: number;
}

/** Formato padrão de erro da API. */
export interface ApiErrorResponse {
  statusCode: number;
  error: string;
  message: string | string[];
  path: string;
  timestamp: string;
}

/** Campos comuns a todas as entidades. */
export interface BaseEntity {
  id: number;
  createdAt: string;
  updatedAt: string;
}
