import { useEffect } from 'react';
import { SelectField, TextField } from '@/components/ui/fields';
import { FormModal } from '@/components/ui/FormModal';
import { useFormState } from '@/hooks/useFormState';
import { useToast } from '@/hooks/useToast';
import { quotationService } from '@/services/quotationService';
import {
  QUOTATION_SOURCE_LABELS,
  QuotationSource,
  type Quotation,
} from '@/types/quotation';
import { todayIso } from '@/utils/format';
import { required, type FieldErrors } from '@/utils/validation';

interface QuotationFormValues {
  date: string;
  commodity: string;
  source: QuotationSource;
  value: string;
  currency: string;
  unit: string;
}

const SOURCE_OPTIONS = Object.values(QuotationSource).map((value) => ({
  value,
  label: QUOTATION_SOURCE_LABELS[value],
}));

function toFormValues(quotation: Quotation | null): QuotationFormValues {
  return {
    date: quotation?.date ?? todayIso(),
    commodity: quotation?.commodity ?? '',
    source: quotation?.source ?? QuotationSource.Manual,
    value: quotation ? String(quotation.value) : '',
    currency: quotation?.currency ?? 'USD',
    unit: quotation?.unit ?? 'T',
  };
}

function validate(values: QuotationFormValues): FieldErrors<QuotationFormValues> {
  const value = Number(values.value.replace(',', '.'));
  return {
    date: required(values.date, 'a data'),
    commodity: required(values.commodity, 'a commodity'),
    value: !values.value.trim()
      ? 'Informe o valor.'
      : !Number.isFinite(value) || value <= 0
        ? 'Informe um valor maior que zero.'
        : undefined,
    currency: /^[A-Z]{3}$/.test(values.currency.trim())
      ? undefined
      : 'Informe o código da moeda com 3 letras (ex.: USD).',
    unit: required(values.unit, 'a unidade'),
  };
}

interface QuotationFormModalProps {
  open: boolean;
  quotation: Quotation | null;
  onClose: () => void;
  onSaved: () => void;
}

export function QuotationFormModal({
  open,
  quotation,
  onClose,
  onSaved,
}: QuotationFormModalProps) {
  const { showToast } = useToast();
  const form = useFormState(toFormValues(quotation), validate);
  const { reset } = form;

  useEffect(() => {
    if (open) reset(toFormValues(quotation));
  }, [open, quotation, reset]);

  const handleSubmit = async () => {
    const saved = await form.submit((values) => {
      const payload = {
        date: values.date,
        commodity: values.commodity.trim(),
        source: values.source,
        value: Number(values.value.replace(',', '.')),
        currency: values.currency.trim(),
        unit: values.unit.trim(),
      };
      return quotation
        ? quotationService.update(quotation.id, payload)
        : quotationService.create(payload);
    });
    if (saved) {
      showToast(
        quotation ? 'Cotação atualizada com sucesso.' : 'Cotação cadastrada com sucesso.',
      );
      onSaved();
    }
  };

  return (
    <FormModal
      open={open}
      title={quotation ? 'Editar cotação' : 'Nova cotação'}
      submitting={form.submitting}
      error={form.submitError}
      onSubmit={handleSubmit}
      onClose={onClose}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          label="Data"
          type="date"
          value={form.values.date}
          onChange={(event) => form.setField('date', event.target.value)}
          error={form.errors.date}
          required
        />
        <SelectField
          label="Fonte"
          value={form.values.source}
          options={SOURCE_OPTIONS}
          onChange={(event) =>
            form.setField('source', event.target.value as QuotationSource)
          }
        />
      </div>
      <TextField
        label="Commodity"
        value={form.values.commodity}
        onChange={(event) => form.setField('commodity', event.target.value.toUpperCase())}
        error={form.errors.commodity}
        hint="Ex.: ALUMINIUM, COPPER, ZINC"
        maxLength={60}
        required
      />
      <div className="grid gap-4 sm:grid-cols-3">
        <TextField
          label="Valor"
          type="number"
          inputMode="decimal"
          step="0.0001"
          min="0"
          value={form.values.value}
          onChange={(event) => form.setField('value', event.target.value)}
          error={form.errors.value}
          required
        />
        <TextField
          label="Moeda"
          value={form.values.currency}
          onChange={(event) =>
            form.setField('currency', event.target.value.toUpperCase())
          }
          error={form.errors.currency}
          maxLength={3}
          required
        />
        <TextField
          label="Unidade"
          value={form.values.unit}
          onChange={(event) => form.setField('unit', event.target.value.toUpperCase())}
          error={form.errors.unit}
          maxLength={20}
          required
        />
      </div>
    </FormModal>
  );
}
