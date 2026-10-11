import { useMemo, useState } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { EmptyState } from '@/components/feedback/states';
import { useChartTheme } from '@/hooks/useChartTheme';
import type { Quotation } from '@/types/quotation';
import { cn } from '@/utils/cn';
import { formatDate, formatNumber, formatShortDate } from '@/utils/format';

interface QuotationChartProps {
  quotations: Quotation[];
}

/** Evolução do valor das cotações por commodity (uma commodity por vez). */
export function QuotationChart({ quotations }: QuotationChartProps) {
  const colors = useChartTheme();

  const commodities = useMemo(
    () => [...new Set(quotations.map((quotation) => quotation.commodity))].sort(),
    [quotations],
  );
  const [selected, setSelected] = useState<string | null>(null);
  const commodity =
    selected && commodities.includes(selected) ? selected : commodities[0];

  const series = useMemo(
    () =>
      quotations
        .filter((quotation) => quotation.commodity === commodity)
        .sort((a, b) => a.date.localeCompare(b.date))
        .map((quotation) => ({
          date: quotation.date,
          value: quotation.value,
          unit: `${quotation.currency}/${quotation.unit}`,
        })),
    [quotations, commodity],
  );

  if (!commodity) {
    return (
      <EmptyState
        title="Nenhuma cotação cadastrada"
        description="Cadastre cotações para acompanhar a evolução dos preços."
      />
    );
  }

  const unit = series[0]?.unit ?? '';

  return (
    <div className="p-5">
      <div
        role="group"
        aria-label="Commodity exibida no gráfico"
        className="mb-4 flex flex-wrap gap-2"
      >
        {commodities.map((item) => (
          <button
            key={item}
            type="button"
            aria-pressed={item === commodity}
            onClick={() => setSelected(item)}
            className={cn(
              'cursor-pointer rounded-full border px-3 py-1 text-xs font-medium transition-colors',
              item === commodity
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border text-muted hover:text-foreground',
            )}
          >
            {item}
          </button>
        ))}
      </div>

      <figure>
        <figcaption className="sr-only">
          Evolução da cotação de {commodity} em {unit}, de {formatDate(series[0].date)} a{' '}
          {formatDate(series[series.length - 1].date)}.
        </figcaption>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={series} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="quotation-fill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={colors.fill} stopOpacity={0.35} />
                  <stop offset="100%" stopColor={colors.fill} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                stroke={colors.grid}
                strokeDasharray="4 4"
                vertical={false}
              />
              <XAxis
                dataKey="date"
                tickFormatter={formatShortDate}
                tick={{ fill: colors.axis, fontSize: 12 }}
                axisLine={{ stroke: colors.grid }}
                tickLine={false}
              />
              <YAxis
                width={72}
                domain={['auto', 'auto']}
                tickFormatter={(value: number) => value.toLocaleString('pt-BR')}
                tick={{ fill: colors.axis, fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                cursor={{ stroke: colors.highlight, strokeDasharray: '4 4' }}
                contentStyle={{
                  background: colors.tooltipBackground,
                  border: `1px solid ${colors.tooltipBorder}`,
                  borderRadius: 8,
                  color: colors.tooltipText,
                  fontSize: 13,
                }}
                labelStyle={{ color: colors.tooltipText, fontWeight: 600 }}
                itemStyle={{ color: colors.tooltipText }}
                labelFormatter={(label) => formatDate(String(label))}
                formatter={(value) => [
                  `${formatNumber(Number(value))} ${unit}`,
                  commodity,
                ]}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke={colors.line}
                strokeWidth={2.5}
                fill="url(#quotation-fill)"
                activeDot={{
                  r: 5,
                  fill: colors.highlight,
                  stroke: colors.tooltipBackground,
                }}
                dot={{ r: 3, fill: colors.line, strokeWidth: 0 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </figure>
    </div>
  );
}
