import type { Paginated } from '@/types/api';
import type {
  PricingFormula,
  PricingFormulaPayload,
  PricingFormulaQueryParams,
} from '@/types/pricing';
import { api } from './api';

export const pricingService = {
  async list(params: PricingFormulaQueryParams = {}): Promise<Paginated<PricingFormula>> {
    const { data } = await api.get<Paginated<PricingFormula>>('/pricing-formulas', {
      params,
    });
    return data;
  },

  async get(id: number): Promise<PricingFormula> {
    const { data } = await api.get<PricingFormula>(`/pricing-formulas/${id}`);
    return data;
  },

  async create(payload: PricingFormulaPayload): Promise<PricingFormula> {
    const { data } = await api.post<PricingFormula>('/pricing-formulas', payload);
    return data;
  },

  async update(
    id: number,
    payload: Partial<PricingFormulaPayload>,
  ): Promise<PricingFormula> {
    const { data } = await api.patch<PricingFormula>(`/pricing-formulas/${id}`, payload);
    return data;
  },

  async setActive(id: number, active: boolean): Promise<PricingFormula> {
    const { data } = await api.patch<PricingFormula>(`/pricing-formulas/${id}/status`, {
      active,
    });
    return data;
  },

  async remove(id: number): Promise<void> {
    await api.delete(`/pricing-formulas/${id}`);
  },
};
