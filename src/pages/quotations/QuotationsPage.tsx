import { FilterX, Plus } from 'lucide-react';
import { useState } from 'react';
import { DataTable, type Column } from '@/components/data/DataTable';
import { ListContent } from '@/components/data/ListContent';
import { ListToolbar } from '@/components/data/ListToolbar';
import { RowActions } from '@/components/data/RowActions';
import { PageHeader } from '@/components/layout/PageHeader';
import { Alert } from '@/components/feedback/Alert';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { SelectField, TextField } from '@/components/ui/fields';
import { useApiQuery } from '@/hooks/useApiQuery';
import { useAuth } from '@/hooks/useAuth';
import { useCrudActions } from '@/hooks/useCrudActions';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { quotationService } from '@/services/quotationService';
import {
  QUOTATION_SOURCE_LABELS,
  QuotationSource,
  type Quotation,
  type QuotationQueryParams,
} from '@/types/quotation';
import { formatDate, formatNumber } from '@/utils/format';
import { QuotationFormModal } from './QuotationFormModal';

interface Filters {
  commodity: string;
  startDate: string;
  endDate: string;
  source: QuotationSource | '';
}

const EMPTY_FILTERS: Filters = { commodity: '', startDate: '', endDate: '', source: '' };
const PAGE_SIZE = 10;

const SOURCE_FILTER_OPTIONS = [
  { value: '', label: 'Todas' },
  ...Object.values(QuotationSource).map((value) => ({
    value,
    label: QUOTATION_SOURCE_LABELS[value],
  })),
];

export function QuotationsPage() {
  const { isAdmin } = useAuth();
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [page, setPage] = useState(1);
  const [formState, setFormState] = useState<{
    open: boolean;
    quotation: Quotation | null;
  }>({
    open: false,
    quotation: null,
  });
  const [toDelete, setToDelete] = useState<Quotation | null>(null);

  const commodity = useDebouncedValue(filters.commodity.trim().toUpperCase());
  const invalidPeriod =
    filters.startDate !== '' &&
    filters.endDate !== '' &&
    filters.startDate > filters.endDate;

  const params: QuotationQueryParams = {
    page,
    limit: PAGE_SIZE,
    commodity: commodity || undefined,
    startDate: filters.startDate || undefined,
    endDate: invalidPeriod ? undefined : filters.endDate || undefined,
    source: filters.source || undefined,
  };
  const query = useApiQuery(() => quotationService.list(params), JSON.stringify(params));
  const { run, pendingId } = useCrudActions(query.reload);

  const updateFilter = <K extends keyof Filters>(field: K, value: Filters[K]) => {
    setFilters((current) => ({ ...current, [field]: value }));
    setPage(1);
  };
  const hasFilters = Object.values(filters).some(Boolean);

  const columns: Column<Quotation>[] = [
    {
      key: 'date',
      header: 'Data',
      render: (quotation) => (
        <span className="whitespace-nowrap">{formatDate(quotation.date)}</span>
      ),
    },
    {
      key: 'commodity',
      header: 'Commodity',
      render: (quotation) => <span className="font-medium">{quotation.commodity}</span>,
    },
    {
      key: 'source',
      header: 'Fonte',
      hideBelow: 'sm',
      render: (quotation) => (
        <Badge tone={quotation.source === QuotationSource.Lme ? 'accent' : 'primary'}>
          {QUOTATION_SOURCE_LABELS[quotation.source]}
        </Badge>
      ),
    },
    {
      key: 'value',
      header: 'Valor',
      align: 'right',
      render: (quotation) => (
        <span className="font-semibold tabular-nums">
          {formatNumber(quotation.value)}
        </span>
      ),
    },
    { key: 'currency', header: 'Moeda', render: (quotation) => quotation.currency },
    {
      key: 'unit',
      header: 'Unidade',
      hideBelow: 'md',
      render: (quotation) => quotation.unit,
    },
    {
      key: 'actions',
      header: 'Ações',
      align: 'right',
      render: (quotation) => {
        const label = `cotação de ${quotation.commodity} em ${formatDate(quotation.date)}`;
        return (
          <RowActions
            itemLabel={label}
            busy={pendingId === quotation.id}
            onEdit={() => setFormState({ open: true, quotation })}
            onDelete={isAdmin ? () => setToDelete(quotation) : undefined}
          />
        );
      },
    },
  ];

  return (
    <>
      <PageHeader
        title="Cotações"
        description="Cotações diárias de commodities usadas na formação de preços."
        actions={
          <Button
            icon={<Plus className="size-4" aria-hidden="true" />}
            onClick={() => setFormState({ open: true, quotation: null })}
          >
            Nova cotação
          </Button>
        }
      />

      <Card>
        <ListToolbar>
          <TextField
            label="Commodity"
            placeholder="Ex.: ALUMINIUM"
            containerClassName="sm:w-48"
            value={filters.commodity}
            onChange={(event) => updateFilter('commodity', event.target.value)}
          />
          <TextField
            label="Data inicial"
            type="date"
            containerClassName="sm:w-44"
            value={filters.startDate}
            max={filters.endDate || undefined}
            onChange={(event) => updateFilter('startDate', event.target.value)}
          />
          <TextField
            label="Data final"
            type="date"
            containerClassName="sm:w-44"
            value={filters.endDate}
            min={filters.startDate || undefined}
            onChange={(event) => updateFilter('endDate', event.target.value)}
            error={invalidPeriod ? 'Deve ser posterior à data inicial.' : undefined}
          />
          <SelectField
            label="Fonte"
            containerClassName="sm:w-40"
            value={filters.source}
            options={SOURCE_FILTER_OPTIONS}
            onChange={(event) =>
              updateFilter('source', event.target.value as QuotationSource | '')
            }
          />
          {hasFilters && (
            <Button
              variant="ghost"
              icon={<FilterX className="size-4" aria-hidden="true" />}
              onClick={() => {
                setFilters(EMPTY_FILTERS);
                setPage(1);
              }}
            >
              Limpar filtros
            </Button>
          )}
        </ListToolbar>

        <div className="px-4 pt-4 empty:hidden">
          {filters.source === QuotationSource.Lme && (
            <Alert variant="info">
              A integração automática com a LME ainda não está disponível. Somente
              cotações cadastradas manualmente com a fonte LME são exibidas.
            </Alert>
          )}
        </div>

        <ListContent
          query={query}
          emptyTitle="Nenhuma cotação encontrada"
          emptyDescription={
            hasFilters ? 'Tente alterar os filtros.' : 'Cadastre a primeira cotação.'
          }
          onPageChange={setPage}
        >
          {(rows, busy) => (
            <DataTable
              caption="Lista de cotações"
              columns={columns}
              rows={rows}
              rowKey={(quotation) => quotation.id}
              busy={busy}
            />
          )}
        </ListContent>
      </Card>

      <QuotationFormModal
        open={formState.open}
        quotation={formState.quotation}
        onClose={() => setFormState({ open: false, quotation: null })}
        onSaved={() => {
          setFormState({ open: false, quotation: null });
          query.reload();
        }}
      />

      <ConfirmDialog
        open={toDelete !== null}
        title="Excluir cotação"
        message={
          toDelete
            ? `Tem certeza que deseja excluir a cotação de ${toDelete.commodity} de ${formatDate(toDelete.date)}?`
            : ''
        }
        confirmLabel="Excluir"
        loading={toDelete !== null && pendingId === toDelete.id}
        onCancel={() => setToDelete(null)}
        onConfirm={async () => {
          if (!toDelete) return;
          await run(
            toDelete.id,
            () => quotationService.remove(toDelete.id),
            'Cotação excluída.',
          );
          setToDelete(null);
        }}
      />
    </>
  );
}
