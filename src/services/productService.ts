import type { Paginated } from '@/types/api';
import type { Product, ProductPayload, ProductQueryParams } from '@/types/product';
import { api } from './api';

export const productService = {
  async list(params: ProductQueryParams = {}): Promise<Paginated<Product>> {
    const { data } = await api.get<Paginated<Product>>('/products', { params });
    return data;
  },

  async get(id: number): Promise<Product> {
    const { data } = await api.get<Product>(`/products/${id}`);
    return data;
  },

  async create(payload: ProductPayload): Promise<Product> {
    const { data } = await api.post<Product>('/products', payload);
    return data;
  },

  async update(id: number, payload: Partial<ProductPayload>): Promise<Product> {
    const { data } = await api.patch<Product>(`/products/${id}`, payload);
    return data;
  },

  async setActive(id: number, active: boolean): Promise<Product> {
    const { data } = await api.patch<Product>(`/products/${id}/status`, { active });
    return data;
  },

  async remove(id: number): Promise<void> {
    await api.delete(`/products/${id}`);
  },
};
