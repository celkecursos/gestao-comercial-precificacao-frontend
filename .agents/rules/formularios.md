---
description: Padrão de formulários — useFormState, campos de components/ui/fields.tsx, validação em utils/validation.ts, erro da API e feedback de sucesso.
paths:
  - 'src/pages/**'
  - 'src/hooks/useFormState.ts'
  - 'src/utils/validation.ts'
  - 'src/components/ui/fields.tsx'
---

# Formulários

Todo formulário segue o mesmo esqueleto. Modelos:

- em cartão, na própria página: `src/pages/profile/ChangePasswordCard.tsx`;
- em modal: `src/pages/products/ProductFormModal.tsx` (com `FormModal`).

> ⚠️ `src/pages/auth/LoginPage.tsx` controla o estado à mão (`useState`), por ser anterior
> ao `useFormState`. **Copie o layout dele, não o formulário.** Formulário novo usa sempre
> `useFormState`.

## Esqueleto

```tsx
// 1. Valores do formulário (strings) e valores iniciais.
interface XFormValues {
  email: string;
}
const EMPTY: XFormValues = { email: '' };

// 2. Validação pura, fora do componente.
function validate(values: XFormValues): FieldErrors<XFormValues> {
  return { email: !values.email.trim() ? 'Informe seu e-mail.' : undefined };
}

// 3. No componente: estado + envio.
const form = useFormState(EMPTY, validate);

const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
  event.preventDefault();
  const ok = await form.submit((values) => xService.do({ email: values.email.trim() }));
  if (ok) {
    // 4. Sucesso: toast, reset ou redirecionamento (ver "Sucesso" abaixo).
  }
};
```

```tsx
<form noValidate onSubmit={handleSubmit} className="flex flex-col gap-4">
  {form.submitError && <Alert variant="error">{form.submitError}</Alert>}
  <TextField
    label="E-mail"
    type="email"
    autoComplete="email"
    value={form.values.email}
    onChange={(event) => form.setField('email', event.target.value)}
    error={form.errors.email}
    required
  />
  <Button type="submit" loading={form.submitting}>
    Enviar
  </Button>
</form>
```

## Regras

- **Estado:** `useFormState(valoresIniciais, validar)`. Ele valida antes de enviar,
  limpa o erro do campo ao digitar, captura o erro da API em `submitError` (já passado por
  `getErrorMessage`) e controla `submitting`. Não duplique isso com `useState`.
- **Campos:** só `TextField`, `SelectField`, `TextAreaField`, `SwitchField`
  (`src/components/ui/fields.tsx`). Eles ligam `<label for>`, `aria-invalid`,
  `aria-describedby` e exibem `error`/`hint`. Nunca `<input>` cru numa página.
- **`<form noValidate>`**: a validação é nossa, não a do navegador.
- **Validação:** função pura `validate` no próprio arquivo, retornando `FieldErrors<T>`.
  Reaproveite `src/utils/validation.ts`: `required`, `isEmail`, `isStrongPassword`,
  `PASSWORD_HINT`, `hasErrors`. Regra nova reutilizável vai para lá. A validação do cliente
  **espelha** a da API — a API continua sendo a definitiva.
- **Mensagens de validação:** frases curtas no imperativo, com ponto final
  ("Informe seu e-mail.", "Informe um e-mail válido.").
- **Senha:** `type="password"`, `autoComplete="new-password"` para senha nova e
  `"current-password"` para a atual. Política: `isStrongPassword` + `PASSWORD_HINT` (mostre
  como `hint` do campo). Confirmação: campo próprio, erro "A confirmação não confere com a
  nova senha.".
- **Payload:** monte explicitamente a partir dos valores, com `.trim()` nos textos. Não
  envie o objeto do formulário direto (campos de confirmação não vão para a API).
- **Erro da API:** `Alert variant="error"` com `form.submitError`, no topo do formulário
  (em modal, o `FormModal` exibe pela prop `error`).
- **Sucesso:**
  - formulário que continua na tela: `showToast('<Ação> com sucesso.')` (`useToast`) e
    `form.reset(...)`;
  - formulário cujo resultado é uma tela de confirmação (ex.: "verifique seu e-mail"):
    troque o conteúdo por um `Alert variant="success"`, sem toast;
  - formulário que redireciona: `navigate(ROUTES.x, { replace: true, state: {...} })` e a
    tela de destino mostra o aviso.
- **Botão de envio:** `Button type="submit" loading={form.submitting}`; o texto pode mudar
  durante o envio ("Enviando...").
- **Botão de mostrar senha:** só se a tarefa pedir; siga o de `LoginPage.tsx`
  (`aria-label` "Mostrar senha"/"Ocultar senha" + `aria-pressed`).
