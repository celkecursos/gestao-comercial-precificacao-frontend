/** Junta classes CSS condicionais: cn('a', condicao && 'b') → "a b". */
export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ');
}
