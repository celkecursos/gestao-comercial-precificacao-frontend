import { useEffect } from 'react';
import { SwitchField, TextAreaField, TextField } from '@/components/ui/fields';
import { FormModal } from '@/components/ui/FormModal';
import { useFormState } from '@/hooks/useFormState';
import { useToast } from '@/hooks/useToast';
import { pricingService } from '@/services/pricingService';
import type { PricingFormula } from '@/types/pricing';
import { required, type FieldErrors } from '@/utils/validation';

interface FormulaFormValues {
  name: string;
  description: string;
  active: boolean;
}

function toFormValues(formula: PricingFormula | null): FormulaFormValues {
  return {
    name: formula?.name ?? '',
    description: formula?.description ?? '',
    active: formula?.active ?? true,
  };
}

function validate(values: FormulaFormValues): FieldErrors<FormulaFormValues> {
  return {
    name:
      required(values.name, 'o nome') ??
      (values.name.trim().length < 2
        ? 'O nome deve ter ao menos 2 caracteres.'
        : undefined),
  };
}

interface PricingFormulaFormModalProps {
  open: boolean;
  formula: PricingFormula | null;
  onClose: () => void;
  onSaved: () => void;
}

export function PricingFormulaFormModal({
  open,
  formula,
  onClose,
  onSaved,
}: PricingFormulaFormModalProps) {
  const { showToast } = useToast();
  const form = useFormState(toFormValues(formula), validate);
  const { reset } = form;

  useEffect(() => {
    if (open) reset(toFormValues(formula));
  }, [open, formula, reset]);

  const handleSubmit = async () => {
    const saved = await form.submit((values) => {
      const payload = {
        name: values.name.trim(),
        description: values.description.trim() || undefined,
        active: values.active,
      };
      return formula
        ? pricingService.update(formula.id, payload)
        : pricingService.create(payload);
    });
    if (saved) {
      showToast(
        formula ? 'Fórmula atualizada com sucesso.' : 'Fórmula cadastrada com sucesso.',
      );
      onSaved();
    }
  };

  return (
    <FormModal
      open={open}
      title={formula ? 'Editar fórmula' : 'Nova fórmula'}
      description="Os componentes de cálculo da fórmula serão configurados em uma versão futura."
      submitting={form.submitting}
      error={form.submitError}
      onSubmit={handleSubmit}
      onClose={onClose}
    >
      <TextField
        label="Nome"
        value={form.values.name}
        onChange={(event) => form.setField('name', event.target.value)}
        error={form.errors.name}
        maxLength={120}
        required
      />
      <TextAreaField
        label="Descrição"
        value={form.values.description}
        onChange={(event) => form.setField('description', event.target.value)}
        hint="Ex.: Cotação LME + custo de transformação + despesas + margem."
        maxLength={2000}
      />
      <SwitchField
        label="Fórmula ativa"
        checked={form.values.active}
        onChange={(checked) => form.setField('active', checked)}
      />
    </FormModal>
  );
}
