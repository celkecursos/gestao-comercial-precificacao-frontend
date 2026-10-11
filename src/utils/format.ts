const LOCALE = 'pt-BR';

/** Formata uma data `YYYY-MM-DD` sem conversão de fuso (ex.: 2026-09-25 → 25/09/2026). */
export function formatDate(value: string): string {
  const [year, month, day] = value.slice(0, 10).split('-');
  return year && month && day ? `${day}/${month}/${year}` : value;
}

/** Formata uma data `YYYY-MM-DD` de forma curta para eixos de gráfico (ex.: 25/09). */
export function formatShortDate(value: string): string {
  const [, month, day] = value.slice(0, 10).split('-');
  return month && day ? `${day}/${month}` : value;
}

/** Formata data e hora ISO no fuso local do usuário. */
export function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat(LOCALE, {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(value));
}

export function formatNumber(value: number, maximumFractionDigits = 4): string {
  return new Intl.NumberFormat(LOCALE, {
    minimumFractionDigits: 2,
    maximumFractionDigits,
  }).format(value);
}

/** Formata um valor monetário no código ISO 4217 informado. */
export function formatCurrency(value: number, currency: string): string {
  try {
    return new Intl.NumberFormat(LOCALE, {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 4,
    }).format(value);
  } catch {
    return `${currency} ${formatNumber(value)}`;
  }
}

/** Data de hoje no formato `YYYY-MM-DD` (fuso local). */
export function todayIso(): string {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${now.getFullYear()}-${month}-${day}`;
}
