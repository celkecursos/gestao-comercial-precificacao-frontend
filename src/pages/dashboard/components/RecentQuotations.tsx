import { EmptyState } from '@/components/feedback/states';
import type { Quotation } from '@/types/quotation';
import { formatDate, formatNumber } from '@/utils/format';

/** Lista compacta das cotações mais recentes. */
export function RecentQuotations({ quotations }: { quotations: Quotation[] }) {
  if (quotations.length === 0) {
    return <EmptyState title="Nenhuma cotação recente" />;
  }

  return (
    <ul className="divide-border divide-y">
      {quotations.map((quotation) => (
        <li
          key={quotation.id}
          className="flex items-center justify-between gap-3 px-5 py-3"
        >
          <div className="min-w-0">
            <p className="text-foreground truncate text-sm font-medium">
              {quotation.commodity}
            </p>
            <p className="text-muted text-xs">{formatDate(quotation.date)}</p>
          </div>
          <p className="text-foreground text-right text-sm font-semibold tabular-nums">
            {formatNumber(quotation.value)}
            <span className="text-muted ml-1 text-xs font-normal">
              {quotation.currency}/{quotation.unit}
            </span>
          </p>
        </li>
      ))}
    </ul>
  );
}
