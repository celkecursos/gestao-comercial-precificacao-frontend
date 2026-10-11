import type { Paginated } from '@/types/api';
import type {
  CreateUserPayload,
  UpdateUserPayload,
  User,
  UserQueryParams,
} from '@/types/user';
import { api } from './api';

export const userService = {
  async list(params: UserQueryParams = {}): Promise<Paginated<User>> {
    const { data } = await api.get<Paginated<User>>('/users', { params });
    return data;
  },

  async get(id: number): Promise<User> {
    const { data } = await api.get<User>(`/users/${id}`);
    return data;
  },

  async create(payload: CreateUserPayload): Promise<User> {
    const { data } = await api.post<User>('/users', payload);
    return data;
  },

  async update(id: number, payload: UpdateUserPayload): Promise<User> {
    const { data } = await api.patch<User>(`/users/${id}`, payload);
    return data;
  },

  async setActive(id: number, active: boolean): Promise<User> {
    const { data } = await api.patch<User>(`/users/${id}/status`, { active });
    return data;
  },

  async remove(id: number): Promise<void> {
    await api.delete(`/users/${id}`);
  },
};
