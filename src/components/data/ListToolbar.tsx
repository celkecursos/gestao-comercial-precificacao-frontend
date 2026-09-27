import type { ReactNode } from 'react';

/** Barra de filtros acima das tabelas. */
export function ListToolbar({ children }: { children: ReactNode }) {
  return (
    <div className="border-border flex flex-col gap-3 border-b p-4 sm:flex-row sm:flex-wrap sm:items-end">
      {children}
    </div>
  );
}
