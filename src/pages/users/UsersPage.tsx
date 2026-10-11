import { Plus } from 'lucide-react';
import { useState } from 'react';
import { DataTable, type Column } from '@/components/data/DataTable';
import { ListContent } from '@/components/data/ListContent';
import { ListToolbar } from '@/components/data/ListToolbar';
import { RowActions } from '@/components/data/RowActions';
import { SearchInput } from '@/components/data/SearchInput';
import { PageHeader } from '@/components/layout/PageHeader';
import { Badge, StatusBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { SelectField } from '@/components/ui/fields';
import { useApiQuery } from '@/hooks/useApiQuery';
import { useAuth } from '@/hooks/useAuth';
import { useCrudActions } from '@/hooks/useCrudActions';
import { useListParams } from '@/hooks/useListParams';
import { userService } from '@/services/userService';
import { ROLE_LABELS, Role, type User, type UserQueryParams } from '@/types/user';
import {
  STATUS_FILTER_OPTIONS,
  parseStatusFilter,
  type StatusFilter,
} from '@/utils/filters';
import { formatDateTime } from '@/utils/format';
import { UserFormModal } from './UserFormModal';

const ROLE_FILTER_OPTIONS = [
  { value: '', label: 'Todos' },
  ...Object.values(Role).map((value) => ({ value, label: ROLE_LABELS[value] })),
];

export function UsersPage() {
  const { user: currentUser } = useAuth();
  const list = useListParams();
  const [role, setRole] = useState<Role | ''>('');
  const [status, setStatus] = useState<StatusFilter>('all');
  const [formState, setFormState] = useState<{ open: boolean; user: User | null }>({
    open: false,
    user: null,
  });
  const [toDelete, setToDelete] = useState<User | null>(null);

  const params: UserQueryParams = {
    page: list.page,
    limit: list.limit,
    search: list.debouncedSearch || undefined,
    role: role || undefined,
    active: parseStatusFilter(status),
  };
  const query = useApiQuery(() => userService.list(params), JSON.stringify(params));
  const { run, pendingId } = useCrudActions(query.reload);

  const columns: Column<User>[] = [
    {
      key: 'name',
      header: 'Nome',
      render: (user) => (
        <div className="min-w-0">
          <p className="font-medium">
            {user.name}
            {user.id === currentUser?.id && (
              <span className="text-muted ml-2 text-xs font-normal">(você)</span>
            )}
          </p>
          <p className="text-muted truncate text-xs md:hidden">{user.email}</p>
        </div>
      ),
    },
    {
      key: 'email',
      header: 'E-mail',
      hideBelow: 'md',
      render: (user) => <span className="text-muted">{user.email}</span>,
    },
    {
      key: 'role',
      header: 'Perfil',
      render: (user) => (
        <Badge tone={user.role === Role.Admin ? 'accent' : 'primary'}>
          {ROLE_LABELS[user.role]}
        </Badge>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (user) => <StatusBadge active={user.active} />,
    },
    {
      key: 'createdAt',
      header: 'Criado em',
      hideBelow: 'lg',
      render: (user) => (
        <span className="text-muted whitespace-nowrap">
          {formatDateTime(user.createdAt)}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Ações',
      align: 'right',
      render: (user) => {
        const isSelf = user.id === currentUser?.id;
        return (
          <RowActions
            itemLabel={user.name}
            busy={pendingId === user.id}
            onEdit={() => setFormState({ open: true, user })}
            active={user.active}
            onToggleActive={
              isSelf
                ? undefined
                : () =>
                    run(
                      user.id,
                      () => userService.setActive(user.id, !user.active),
                      user.active ? 'Usuário desativado.' : 'Usuário ativado.',
                    )
            }
            onDelete={isSelf ? undefined : () => setToDelete(user)}
          />
        );
      },
    },
  ];

  const hasFilters = Boolean(list.debouncedSearch || role || status !== 'all');

  return (
    <>
      <PageHeader
        title="Usuários"
        description="Gerencie quem acessa o sistema e seus perfis."
        actions={
          <Button
            icon={<Plus className="size-4" aria-hidden="true" />}
            onClick={() => setFormState({ open: true, user: null })}
          >
            Novo usuário
          </Button>
        }
      />

      <Card>
        <ListToolbar>
          <SearchInput
            label="Buscar usuários por nome ou e-mail"
            placeholder="Buscar por nome ou e-mail"
            value={list.search}
            onChange={list.setSearch}
          />
          <SelectField
            label="Perfil"
            containerClassName="sm:w-44"
            value={role}
            options={ROLE_FILTER_OPTIONS}
            onChange={(event) => {
              setRole(event.target.value as Role | '');
              list.setPage(1);
            }}
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
          emptyTitle="Nenhum usuário encontrado"
          emptyDescription={hasFilters ? 'Tente alterar os filtros da busca.' : undefined}
          onPageChange={list.setPage}
        >
          {(rows, busy) => (
            <DataTable
              caption="Lista de usuários"
              columns={columns}
              rows={rows}
              rowKey={(user) => user.id}
              busy={busy}
            />
          )}
        </ListContent>
      </Card>

      <UserFormModal
        open={formState.open}
        user={formState.user}
        onClose={() => setFormState({ open: false, user: null })}
        onSaved={() => {
          setFormState({ open: false, user: null });
          query.reload();
        }}
      />

      <ConfirmDialog
        open={toDelete !== null}
        title="Excluir usuário"
        message={`Tem certeza que deseja excluir "${toDelete?.name}"? O acesso será removido permanentemente.`}
        confirmLabel="Excluir"
        loading={toDelete !== null && pendingId === toDelete.id}
        onCancel={() => setToDelete(null)}
        onConfirm={async () => {
          if (!toDelete) return;
          await run(
            toDelete.id,
            () => userService.remove(toDelete.id),
            'Usuário excluído.',
          );
          setToDelete(null);
        }}
      />
    </>
  );
}
