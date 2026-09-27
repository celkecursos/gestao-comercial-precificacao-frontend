import { useEffect } from 'react';
import { SwitchField, TextAreaField, TextField } from '@/components/ui/fields';
import { FormModal } from '@/components/ui/FormModal';
import { useFormState } from '@/hooks/useFormState';
import { useToast } from '@/hooks/useToast';
import { productService } from '@/services/productService';
import type { Product } from '@/types/product';
import { required, type FieldErrors } from '@/utils/validation';

interface ProductFormValues {
  code: string;
  name: string;
  description: string;
  unit: string;
  active: boolean;
}

const EMPTY: ProductFormValues = {
  code: '',
  name: '',
  description: '',
  unit: '',
  active: true,
};
const CODE_PATTERN = /^[A-Za-z0-9._-]+$/;

function toFormValues(product: Product | null): ProductFormValues {
  if (!product) return EMPTY;
  return {
    code: product.code,
    name: product.name,
    description: product.description ?? '',
    unit: product.unit,
    active: product.active,
  };
}

function validate(values: ProductFormValues): FieldErrors<ProductFormValues> {
  return {
    code:
      required(values.code, 'o código') ??
      (CODE_PATTERN.test(values.code.trim())
        ? undefined
        : 'Use apenas letras, números, ".", "_" ou "-".'),
    name:
      required(values.name, 'o nome') ??
      (values.name.trim().length < 2
        ? 'O nome deve ter ao menos 2 caracteres.'
        : undefined),
    unit: required(values.unit, 'a unidade'),
  };
}

interface ProductFormModalProps {
  open: boolean;
  /** Produto em edição; `null` para cadastro. */
  product: Product | null;
  onClose: () => void;
  onSaved: () => void;
}

export function ProductFormModal({
  open,
  product,
  onClose,
  onSaved,
}: ProductFormModalProps) {
  const { showToast } = useToast();
  const form = useFormState(toFormValues(product), validate);
  const { reset } = form;

  useEffect(() => {
    if (open) reset(toFormValues(product));
  }, [open, product, reset]);

  const handleSubmit = async () => {
    const saved = await form.submit((values) => {
      const payload = {
        code: values.code.trim(),
        name: values.name.trim(),
        description: values.description.trim() || undefined,
        unit: values.unit.trim(),
        active: values.active,
      };
      return product
        ? productService.update(product.id, payload)
        : productService.create(payload);
    });
    if (saved) {
      showToast(
        product ? 'Produto atualizado com sucesso.' : 'Produto cadastrado com sucesso.',
      );
      onSaved();
    }
  };

  return (
    <FormModal
      open={open}
      title={product ? 'Editar produto' : 'Novo produto'}
      submitting={form.submitting}
      error={form.submitError}
      onSubmit={handleSubmit}
      onClose={onClose}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          label="Código"
          value={form.values.code}
          onChange={(event) => form.setField('code', event.target.value.toUpperCase())}
          error={form.errors.code}
          hint="Ex.: AL-VG-095"
          maxLength={50}
          required
        />
        <TextField
          label="Unidade"
          value={form.values.unit}
          onChange={(event) => form.setField('unit', event.target.value.toUpperCase())}
          error={form.errors.unit}
          hint="Ex.: KG, M, T"
          maxLength={20}
          required
        />
      </div>
      <TextField
        label="Nome"
        value={form.values.name}
        onChange={(event) => form.setField('name', event.target.value)}
        error={form.errors.name}
        maxLength={150}
        required
      />
      <TextAreaField
        label="Descrição"
        value={form.values.description}
        onChange={(event) => form.setField('description', event.target.value)}
        maxLength={1000}
      />
      <SwitchField
        label="Produto ativo"
        description="Produtos inativos não devem ser usados em novas precificações."
        checked={form.values.active}
        onChange={(checked) => form.setField('active', checked)}
      />
    </FormModal>
  );
}
