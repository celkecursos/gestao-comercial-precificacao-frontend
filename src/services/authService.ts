import type {
  AuthResponse,
  ChangePasswordPayload,
  ForgotPasswordPayload,
  LoginCredentials,
  ResetPasswordPayload,
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

  /**
   * Pede o link de redefinição por e-mail. A API responde 204 exista ou não a conta
   * (não revela quais e-mails estão cadastrados); 429 quando há pedidos demais.
   */
  async forgotPassword(payload: ForgotPasswordPayload): Promise<void> {
    await api.post('/auth/forgot-password', payload);
  },

  /** Define a nova senha com o token do e-mail. Invalida todos os tokens de sessão do usuário. */
  async resetPassword(payload: ResetPasswordPayload): Promise<void> {
    await api.post('/auth/reset-password', payload);
  },
};
