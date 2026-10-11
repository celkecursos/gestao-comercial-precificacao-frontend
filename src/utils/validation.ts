/**
 * Validações de formulário no cliente. Espelham as regras da API para dar retorno
 * imediato ao usuário — a API continua sendo a validação definitiva.
 */

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,72}$/;

export const PASSWORD_HINT =
  'Mínimo de 8 caracteres, com letras maiúsculas, minúsculas, números e caracteres especiais.';

/** Mapa de erros por campo. Campos sem erro não aparecem. */
export type FieldErrors<T> = Partial<Record<keyof T, string>>;

export function isEmail(value: string): boolean {
  return EMAIL_PATTERN.test(value.trim());
}

export function isStrongPassword(value: string): boolean {
  return PASSWORD_PATTERN.test(value);
}

export function hasErrors<T>(errors: FieldErrors<T>): boolean {
  return Object.values(errors).some(Boolean);
}

export function required(value: string, label: string): string | undefined {
  return value.trim() ? undefined : `Informe ${label}.`;
}
