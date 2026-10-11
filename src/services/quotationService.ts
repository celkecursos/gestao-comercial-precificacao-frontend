import type { Paginated } from '@/types/api';
import type {
  Quotation,
  QuotationPayload,
  QuotationQueryParams,
} from '@/types/quotation';
import { api } from './api';

export const quotationService = {
  async list(params: QuotationQueryParams = {}): Promise<Paginated<Quotation>> {
    const { data } = await api.get<Paginated<Quotation>>('/quotations', { params });
    return data;
  },

  async get(id: number): Promise<Quotation> {
    const { data } = await api.get<Quotation>(`/quotations/${id}`);
    return data;
  },

  async create(payload: QuotationPayload): Promise<Quotation> {
    const { data } = await api.post<Quotation>('/quotations', payload);
    return data;
  },

  async update(id: number, payload: Partial<QuotationPayload>): Promise<Quotation> {
    const { data } = await api.patch<Quotation>(`/quotations/${id}`, payload);
    return data;
  },

  async remove(id: number): Promise<void> {
    await api.delete(`/quotations/${id}`);
  },
};
