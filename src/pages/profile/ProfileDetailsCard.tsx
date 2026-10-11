import { Save } from 'lucide-react';
import type { FormEvent } from 'react';
import { Alert } from '@/components/feedback/Alert';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader } from '@/components/ui/Card';
import { TextField } from '@/components/ui/fields';
import { useAuth } from '@/hooks/useAuth';
import { useFormState } from '@/hooks/useFormState';
import { useToast } from '@/hooks/useToast';
import { authService } from '@/services/authService';
import type { User } from '@/types/user';
import { isEmail, required, type FieldErrors } from '@/utils/validation';

interface ProfileFormValues {
  name: string;
  email: string;
}

function validate(values: ProfileFormValues): FieldErrors<ProfileFormValues> {
  return {
    name:
      required(values.name, 'o nome') ??
      (values.name.trim().length < 2
        ? 'O nome deve ter ao menos 2 caracteres.'
        : undefined),
    email:
      required(values.email, 'o e-mail') ??
      (isEmail(values.email) ? undefined : 'Informe um e-mail válido.'),
  };
}

/**
 * Edição de nome e e-mail do usuário autenticado.
 * O componente pai o remonta (via `key`) quando os dados do usuário mudam.
 */
export function ProfileDetailsCard({ user }: { user: User }) {
  const { setUser } = useAuth();
  const { showToast } = useToast();
  const form = useFormState<ProfileFormValues>(
    { name: user.name, email: user.email },
    validate,
  );
  const unchanged =
    form.values.name.trim() === user.name && form.values.email.trim() === user.email;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const saved = await form.submit(async (values) => {
      const updated = await authService.updateProfile({
        name: values.name.trim(),
        email: values.email.trim(),
      });
      setUser(updated);
    });
    if (saved) showToast('Perfil atualizado com sucesso.');
  };

  return (
    <Card>
      <CardHeader
        title="Dados pessoais"
        description="Atualize seu nome e e-mail de acesso."
      />
      <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-4 p-5">
        {form.submitError && <Alert variant="error">{form.submitError}</Alert>}
        <TextField
          label="Nome"
          autoComplete="name"
          value={form.values.name}
          onChange={(event) => form.setField('name', event.target.value)}
          error={form.errors.name}
          maxLength={120}
          required
        />
        <TextField
          label="E-mail"
          type="email"
          autoComplete="email"
          value={form.values.email}
          onChange={(event) => form.setField('email', event.target.value)}
          error={form.errors.email}
          maxLength={180}
          required
        />
        <div className="flex justify-end">
          <Button
            type="submit"
            loading={form.submitting}
            disabled={unchanged}
            icon={<Save className="size-4" aria-hidden="true" />}
          >
            Salvar alterações
          </Button>
        </div>
      </form>
    </Card>
  );
}
