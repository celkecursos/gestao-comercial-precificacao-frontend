import type { BaseEntity, PaginationParams } from './api';

/** Papéis de acesso. Deve acompanhar o enum Role do backend. */
export const Role = {
  Admin: 'ADMIN',
  User: 'USER',
} as const;
export type Role = (typeof Role)[keyof typeof Role];

export const ROLE_LABELS: Record<Role, string> = {
  ADMIN: 'Administrador',
  USER: 'Usuário',
};

export interface User extends BaseEntity {
  name: string;
  email: string;
  role: Role;
  active: boolean;
}

export interface CreateUserPayload {
  name: string;
  email: string;
  password: string;
  role: Role;
  active: boolean;
}

/** Na edição, `password` é opcional: quando informado, redefine a senha do usuário. */
export type UpdateUserPayload = Partial<CreateUserPayload>;

export interface UserQueryParams extends PaginationParams {
  search?: string;
  role?: Role;
  active?: boolean;
}
