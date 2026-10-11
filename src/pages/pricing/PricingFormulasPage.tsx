import { Plus } from 'lucide-react';
import { useState } from 'react';
import { DataTable, type Column } from '@/components/data/DataTable';
import { ListContent } from '@/components/data/ListContent';
import { ListToolbar } from '@/components/data/ListToolbar';
import { RowActions } from '@/components/data/RowActions';
import { SearchInput } from '@/components/data/SearchInput';
import { PageHeader } from '@/components/layout/PageHeader';
import { StatusBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { SelectField } from '@/components/ui/fields';
import { useApiQuery } from '@/hooks/useApiQuery';
import { useAuth } from '@/hooks/useAuth';
import { useCrudActions } from '@/hooks/useCrudActions';
import { useListParams } from '@/hooks/useListParams';
import { pricingService } from '@/services/pricingService';
import type { PricingFormula, PricingFormulaQueryParams } from '@/types/pricing';
import {
  STATUS_FILTER_OPTIONS,
  parseStatusFilter,
  type StatusFilter,
} from '@/utils/filters';
import { formatDateTime } from '@/utils/format';
import { PricingFormulaFormModal } from './PricingFormulaFormModal';

export function PricingFormulasPage() {
  const { isAdmin } = useAuth();
  const list = useListParams();
  const [status, setStatus] = useState<StatusFilter>('all');
  const [formState, setFormState] = useState<{
    open: boolean;
    formula: PricingFormula | null;
  }>({ open: false, formula: null });
  const [toDelete, setToDelete] = useState<PricingFormula | null>(null);

  const params: PricingFormulaQueryParams = {
    page: list.page,
    limit: list.limit,
    search: list.debouncedSearch || undefined,
    active: parseStatusFilter(status),
  };
  const query = useApiQuery(() => pricingService.list(params), JSON.stringify(params));
  const { run, pendingId } = useCrudActions(query.reload);

  const columns: Column<PricingFormula>[] = [
    {
      key: 'name',
      header: 'Nome',
      render: (formula) => <span className="font-medium">{formula.name}</span>,
    },
    {
      key: 'description',
      header: 'Descrição',
      hideBelow: 'md',
      render: (formula) => (
        <span className="text-muted line-clamp-2 max-w-md">
          {formula.description || '—'}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (formula) => <StatusBadge active={formula.active} />,
    },
    {
      key: 'createdAt',
      header: 'Criada em',
      hideBelow: 'sm',
      render: (formula) => (
        <span className="text-muted whitespace-nowrap">
          {formatDateTime(formula.createdAt)}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Ações',
      align: 'right',
      render: (formula) => (
        <RowActions
          itemLabel={formula.name}
          busy={pendingId === formula.id}
          onEdit={() => setFormState({ open: true, formula })}
          active={formula.active}
          onToggleActive={() =>
            run(
              formula.id,
              () => pricingService.setActive(formula.id, !formula.active),
              formula.active ? 'Fórmula desativada.' : 'Fórmula ativada.',
            )
          }
          onDelete={isAdmin ? () => setToDelete(formula) : undefined}
        />
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Fórmulas de Precificação"
        description="Fórmulas usadas na formação dos preços comerciais."
        actions={
          <Button
            icon={<Plus className="size-4" aria-hidden="true" />}
            onClick={() => setFormState({ open: true, formula: null })}
          >
            Nova fórmula
          </Button>
        }
      />

      <Card>
        <ListToolbar>
          <SearchInput
            label="Buscar fórmulas por nome"
            placeholder="Buscar por nome"
            value={list.search}
            onChange={list.setSearch}
          />
          <SelectField
            label="Status"
            containerClassName="sm:w-44"
            value={status}
            options={STATUS_FILTER_OPTIONS}
            onChange={(event) => {
              setStatus(event.target.value as StatusFilter);
              list.setPage(1);
            }}
          />
        </ListToolbar>

        <ListContent
          query={query}
          emptyTitle="Nenhuma fórmula encontrada"
          emptyDescription={
            list.debouncedSearch || status !== 'all'
              ? 'Tente alterar os filtros da busca.'
              : 'Cadastre a primeira fórmula de precificação.'
          }
          onPageChange={list.setPage}
        >
          {(rows, busy) => (
            <DataTable
              caption="Lista de fórmulas de precificação"
              columns={columns}
              rows={rows}
              rowKey={(formula) => formula.id}
              busy={busy}
            />
          )}
        </ListContent>
      </Card>

      <PricingFormulaFormModal
        open={formState.open}
        formula={formState.formula}
        onClose={() => setFormState({ open: false, formula: null })}
        onSaved={() => {
          setFormState({ open: false, formula: null });
          query.reload();
        }}
      />

      <ConfirmDialog
        open={toDelete !== null}
        title="Excluir fórmula"
        message={`Tem certeza que deseja excluir "${toDelete?.name}"? Esta ação não pode ser desfeita.`}
        confirmLabel="Excluir"
        loading={toDelete !== null && pendingId === toDelete.id}
        onCancel={() => setToDelete(null)}
        onConfirm={async () => {
          if (!toDelete) return;
          await run(
            toDelete.id,
            () => pricingService.remove(toDelete.id),
            'Fórmula excluída.',
          );
          setToDelete(null);
        }}
      />
    </>
  );
}
