import { Pencil, Power, PowerOff, Trash2 } from 'lucide-react';
import { IconButton } from '@/components/ui/IconButton';
import { Spinner } from '@/components/ui/Spinner';

interface RowActionsProps {
  /** Nome do registro, usado nos rótulos acessíveis (ex.: "Editar Produto X"). */
  itemLabel: string;
  busy?: boolean;
  onEdit?: () => void;
  /** Quando informado, exibe o botão ativar/desativar conforme o status atual. */
  active?: boolean;
  onToggleActive?: () => void;
  onDelete?: () => void;
}

/** Ações padrão de uma linha de tabela: editar, ativar/desativar e excluir. */
export function RowActions({
  itemLabel,
  busy,
  onEdit,
  active,
  onToggleActive,
  onDelete,
}: RowActionsProps) {
  if (busy) {
    return (
      <div className="flex h-9 items-center justify-end pr-2">
        <Spinner className="text-primary" label={`Processando ${itemLabel}`} />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-end gap-1">
      {onEdit && (
        <IconButton
          label={`Editar ${itemLabel}`}
          icon={<Pencil className="size-4" />}
          onClick={onEdit}
        />
      )}
      {onToggleActive && active !== undefined && (
        <IconButton
          label={`${active ? 'Desativar' : 'Ativar'} ${itemLabel}`}
          icon={active ? <PowerOff className="size-4" /> : <Power className="size-4" />}
          onClick={onToggleActive}
        />
      )}
      {onDelete && (
        <IconButton
          label={`Excluir ${itemLabel}`}
          icon={<Trash2 className="size-4" />}
          tone="danger"
          onClick={onDelete}
        />
      )}
    </div>
  );
}
