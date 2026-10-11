import type { ReactNode } from 'react';
import { cn } from '@/utils/cn';

export interface Column<T> {
  /** Identificador único da coluna. */
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  /** Oculta a coluna abaixo do breakpoint informado (telas pequenas). */
  hideBelow?: 'sm' | 'md' | 'lg';
  align?: 'left' | 'right';
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string | number;
  /** Descrição da tabela para leitores de tela. */
  caption: string;
  /** Deixa a tabela esmaecida enquanto recarrega, mantendo os dados anteriores visíveis. */
  busy?: boolean;
}

const HIDE_BELOW = {
  sm: 'hidden sm:table-cell',
  md: 'hidden md:table-cell',
  lg: 'hidden lg:table-cell',
};

/** Tabela responsiva: rolagem horizontal e colunas secundárias ocultas no celular. */
export function DataTable<T>({
  columns,
  rows,
  rowKey,
  caption,
  busy,
}: DataTableProps<T>) {
  return (
    <div
      className={cn('overflow-x-auto transition-opacity', busy && 'opacity-60')}
      aria-busy={busy || undefined}
    >
      <table className="w-full min-w-[36rem] text-left text-sm sm:min-w-0">
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr className="border-border bg-surface-muted/60 border-b">
            {columns.map((column) => (
              <th
                key={column.key}
                scope="col"
                className={cn(
                  'text-muted px-4 py-3 text-xs font-semibold tracking-wide whitespace-nowrap uppercase',
                  column.align === 'right' && 'text-right',
                  column.hideBelow && HIDE_BELOW[column.hideBelow],
                )}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-border divide-y">
          {rows.map((row) => (
            <tr key={rowKey(row)} className="hover:bg-surface-muted/50 transition-colors">
              {columns.map((column) => (
                <td
                  key={column.key}
                  className={cn(
                    'text-foreground px-4 py-3 align-middle',
                    column.align === 'right' && 'text-right',
                    column.hideBelow && HIDE_BELOW[column.hideBelow],
                    column.className,
                  )}
                >
                  {column.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
