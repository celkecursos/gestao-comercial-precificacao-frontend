import type {
  AuthResponse,
  ChangePasswordPayload,
  LoginCredentials,
  UpdateProfilePayload,
} from '@/types/auth';
import type { User } from '@/types/user';
import { api } from './api';

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>('/auth/login', credentials);
    return data;
  },

  /** Invalida no servidor todos os tokens do usuário. */
  async logout(): Promise<void> {
    await api.post('/auth/logout');
  },

  async me(): Promise<User> {
    const { data } = await api.get<User>('/auth/me');
    return data;
  },

  async updateProfile(payload: UpdateProfilePayload): Promise<User> {
    const { data } = await api.patch<User>('/auth/profile', payload);
    return data;
  },

  /** Retorna um novo token: os tokens anteriores deixam de valer após a troca. */
  async changePassword(payload: ChangePasswordPayload): Promise<AuthResponse> {
    const { data } = await api.patch<AuthResponse>('/auth/password', payload);
    return data;
  },
};
