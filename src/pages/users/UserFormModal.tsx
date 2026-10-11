import { useEffect } from 'react';
import { SelectField, SwitchField, TextField } from '@/components/ui/fields';
import { FormModal } from '@/components/ui/FormModal';
import { useAuth } from '@/hooks/useAuth';
import { useFormState } from '@/hooks/useFormState';
import { useToast } from '@/hooks/useToast';
import { userService } from '@/services/userService';
import { ROLE_LABELS, Role, type User } from '@/types/user';
import {
  PASSWORD_HINT,
  isEmail,
  isStrongPassword,
  required,
  type FieldErrors,
} from '@/utils/validation';

interface UserFormValues {
  name: string;
  email: string;
  role: Role;
  active: boolean;
  password: string;
}

const ROLE_OPTIONS = Object.values(Role).map((value) => ({
  value,
  label: ROLE_LABELS[value],
}));

function toFormValues(user: User | null): UserFormValues {
  return {
    name: user?.name ?? '',
    email: user?.email ?? '',
    role: user?.role ?? Role.User,
    active: user?.active ?? true,
    password: '',
  };
}

function buildValidator(isEditing: boolean) {
  return (values: UserFormValues): FieldErrors<UserFormValues> => ({
    name:
      required(values.name, 'o nome') ??
      (values.name.trim().length < 2
        ? 'O nome deve ter ao menos 2 caracteres.'
        : undefined),
    email:
      required(values.email, 'o e-mail') ??
      (isEmail(values.email) ? undefined : 'Informe um e-mail válido.'),
    password:
      !values.password && isEditing
        ? undefined
        : !values.password
          ? 'Informe a senha inicial.'
          : isStrongPassword(values.password)
            ? undefined
            : PASSWORD_HINT,
  });
}

const validateCreate = buildValidator(false);
const validateEdit = buildValidator(true);

interface UserFormModalProps {
  open: boolean;
  user: User | null;
  onClose: () => void;
  onSaved: () => void;
}

export function UserFormModal({ open, user, onClose, onSaved }: UserFormModalProps) {
  const { user: currentUser, setUser: setCurrentUser } = useAuth();
  const { showToast } = useToast();
  const isEditing = user !== null;
  const isSelf = isEditing && user.id === currentUser?.id;
  const form = useFormState(
    toFormValues(user),
    isEditing ? validateEdit : validateCreate,
  );
  const { reset } = form;

  useEffect(() => {
    if (open) reset(toFormValues(user));
  }, [open, user, reset]);

  const handleSubmit = async () => {
    const saved = await form.submit(async (values) => {
      const base = {
        name: values.name.trim(),
        email: values.email.trim(),
        role: values.role,
        active: values.active,
      };
      if (!user) return userService.create({ ...base, password: values.password });

      const updated = await userService.update(user.id, {
        ...base,
        ...(values.password ? { password: values.password } : {}),
      });
      // Mantém o cabeçalho atualizado quando o administrador edita os próprios dados.
      if (isSelf) setCurrentUser(updated);
      return updated;
    });
    if (saved) {
      showToast(
        isEditing ? 'Usuário atualizado com sucesso.' : 'Usuário cadastrado com sucesso.',
      );
      onSaved();
    }
  };

  return (
    <FormModal
      open={open}
      title={isEditing ? 'Editar usuário' : 'Novo usuário'}
      submitting={form.submitting}
      error={form.submitError}
      onSubmit={handleSubmit}
      onClose={onClose}
    >
      <TextField
        label="Nome"
        autoComplete="off"
        value={form.values.name}
        onChange={(event) => form.setField('name', event.target.value)}
        error={form.errors.name}
        maxLength={120}
        required
      />
      <TextField
        label="E-mail"
        type="email"
        autoComplete="off"
        value={form.values.email}
        onChange={(event) => form.setField('email', event.target.value)}
        error={form.errors.email}
        maxLength={180}
        required
      />
      <SelectField
        label="Perfil"
        value={form.values.role}
        options={ROLE_OPTIONS}
        onChange={(event) => form.setField('role', event.target.value as Role)}
        disabled={isSelf}
        hint={isSelf ? 'Você não pode alterar o seu próprio perfil.' : undefined}
      />
      {isSelf ? (
        <p className="text-muted text-xs">
          Para alterar a sua própria senha, use a página Meu Perfil.
        </p>
      ) : (
        <TextField
          label={isEditing ? 'Nova senha' : 'Senha inicial'}
          type="password"
          autoComplete="new-password"
          value={form.values.password}
          onChange={(event) => form.setField('password', event.target.value)}
          error={form.errors.password}
          hint={
            isEditing
              ? `Deixe em branco para manter a senha atual. ${PASSWORD_HINT}`
              : PASSWORD_HINT
          }
          required={!isEditing}
        />
      )}
      <SwitchField
        label="Usuário ativo"
        description={
          isSelf
            ? 'Você não pode desativar a si mesmo.'
            : 'Usuários inativos não conseguem acessar o sistema.'
        }
        checked={form.values.active}
        onChange={(checked) => form.setField('active', checked)}
        disabled={isSelf}
      />
    </FormModal>
  );
}
