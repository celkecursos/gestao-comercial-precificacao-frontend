import type { BaseEntity, PaginationParams } from './api';

export interface Product extends BaseEntity {
  name: string;
  code: string;
  description: string | null;
  unit: string;
  active: boolean;
}

export interface ProductPayload {
  name: string;
  code: string;
  description?: string;
  unit: string;
  active?: boolean;
}

export interface ProductQueryParams extends PaginationParams {
  search?: string;
  active?: boolean;
}
