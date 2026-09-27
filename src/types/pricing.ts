import type { BaseEntity, PaginationParams } from './api';

export interface PricingFormula extends BaseEntity {
  name: string;
  description: string | null;
  active: boolean;
}

export interface PricingFormulaPayload {
  name: string;
  description?: string;
  active?: boolean;
}

export interface PricingFormulaQueryParams extends PaginationParams {
  search?: string;
  active?: boolean;
}
