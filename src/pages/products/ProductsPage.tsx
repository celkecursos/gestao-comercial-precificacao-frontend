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
import { productService } from '@/services/productService';
import type { Product, ProductQueryParams } from '@/types/product';
import {
  STATUS_FILTER_OPTIONS,
  parseStatusFilter,
  type StatusFilter,
} from '@/utils/filters';
import { ProductFormModal } from './ProductFormModal';

export function ProductsPage() {
  const { isAdmin } = useAuth();
  const list = useListParams();
  const [status, setStatus] = useState<StatusFilter>('all');
  const [formState, setFormState] = useState<{ open: boolean; product: Product | null }>({
    open: false,
    product: null,
  });
  const [toDelete, setToDelete] = useState<Product | null>(null);

  const params: ProductQueryParams = {
    page: list.page,
    limit: list.limit,
    search: list.debouncedSearch || undefined,
    active: parseStatusFilter(status),
  };
  const query = useApiQuery(() => productService.list(params), JSON.stringify(params));
  const { run, pendingId } = useCrudActions(query.reload);

  const columns: Column<Product>[] = [
    {
      key: 'code',
      header: 'Código',
      render: (product) => (
        <span className="font-mono text-xs font-medium">{product.code}</span>
      ),
    },
    {
      key: 'name',
      header: 'Nome',
      render: (product) => <span className="font-medium">{product.name}</span>,
    },
    {
      key: 'description',
      header: 'Descrição',
      hideBelow: 'lg',
      render: (product) => (
        <span className="text-muted line-clamp-1 max-w-xs">
          {product.description || '—'}
        </span>
      ),
    },
    { key: 'unit', header: 'Unidade', render: (product) => product.unit },
    {
      key: 'status',
      header: 'Status',
      render: (product) => <StatusBadge active={product.active} />,
    },
    {
      key: 'actions',
      header: 'Ações',
      align: 'right',
      render: (product) => (
        <RowActions
          itemLabel={product.name}
          busy={pendingId === product.id}
          onEdit={() => setFormState({ open: true, product })}
          active={product.active}
          onToggleActive={() =>
            run(
              product.id,
              () => productService.setActive(product.id, !product.active),
              product.active ? 'Produto desativado.' : 'Produto ativado.',
            )
          }
          onDelete={isAdmin ? () => setToDelete(product) : undefined}
        />
      ),
    },
  ];

  const openCreate = () => setFormState({ open: true, product: null });

  return (
    <>
      <PageHeader
        title="Produtos"
        description="Cadastro dos produtos comercializados."
        actions={
          <Button
            icon={<Plus className="size-4" aria-hidden="true" />}
            onClick={openCreate}
          >
            Novo produto
          </Button>
        }
      />

      <Card>
        <ListToolbar>
          <SearchInput
            label="Buscar produtos por nome ou código"
            placeholder="Buscar por nome ou código"
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
          emptyTitle="Nenhum produto encontrado"
          emptyDescription={
            list.debouncedSearch || status !== 'all'
              ? 'Tente alterar os filtros da busca.'
              : 'Cadastre o primeiro produto.'
          }
          onPageChange={list.setPage}
        >
          {(rows, busy) => (
            <DataTable
              caption="Lista de produtos"
              columns={columns}
              rows={rows}
              rowKey={(product) => product.id}
              busy={busy}
            />
          )}
        </ListContent>
      </Card>

      <ProductFormModal
        open={formState.open}
        product={formState.product}
        onClose={() => setFormState({ open: false, product: null })}
        onSaved={() => {
          setFormState({ open: false, product: null });
          query.reload();
        }}
      />

      <ConfirmDialog
        open={toDelete !== null}
        title="Excluir produto"
        message={`Tem certeza que deseja excluir "${toDelete?.name}"? Esta ação não pode ser desfeita.`}
        confirmLabel="Excluir"
        loading={toDelete !== null && pendingId === toDelete.id}
        onCancel={() => setToDelete(null)}
        onConfirm={async () => {
          if (!toDelete) return;
          await run(
            toDelete.id,
            () => productService.remove(toDelete.id),
            'Produto excluído.',
          );
          setToDelete(null);
        }}
      />
    </>
  );
}
