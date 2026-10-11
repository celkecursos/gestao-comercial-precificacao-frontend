import type { BaseEntity, PaginationParams } from './api';

/** Origem da cotação. Deve acompanhar o enum QuotationSource do backend. */
export const QuotationSource = {
  Manual: 'MANUAL',
  Lme: 'LME',
  Other: 'OTHER',
} as const;
export type QuotationSource = (typeof QuotationSource)[keyof typeof QuotationSource];

export const QUOTATION_SOURCE_LABELS: Record<QuotationSource, string> = {
  MANUAL: 'Manual',
  LME: 'LME',
  OTHER: 'Outra',
};

export interface Quotation extends BaseEntity {
  /** Data no formato YYYY-MM-DD. */
  date: string;
  source: QuotationSource;
  commodity: string;
  value: number;
  currency: string;
  unit: string;
}

export interface QuotationPayload {
  date: string;
  source?: QuotationSource;
  commodity: string;
  value: number;
  currency: string;
  unit: string;
}

export interface QuotationQueryParams extends PaginationParams {
  startDate?: string;
  endDate?: string;
  commodity?: string;
  source?: QuotationSource;
}
