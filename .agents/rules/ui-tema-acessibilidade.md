---
description: Visual, temas claro/escuro, tokens de cor, componentes de UI obrigatórios, estados de tela, responsividade e acessibilidade.
paths:
  - 'src/**/*.tsx'
  - 'src/index.css'
---

# UI, temas e acessibilidade

## Cores: só tokens semânticos

Os tokens ficam em `src/index.css`, definidos para o tema claro e redefinidos no escuro.
Usando só eles, a tela funciona nos dois temas sem nenhum `dark:`.

| Uso             | Tokens                                                                                        |
| --------------- | --------------------------------------------------------------------------------------------- |
| Fundos          | `bg-background` (página), `bg-surface` (cartões), `bg-surface-muted` (hover/realce)           |
| Texto           | `text-foreground`, `text-muted`                                                               |
| Bordas e campos | `border-border`, `border-input`                                                               |
| Ação principal  | `bg-primary`, `hover:bg-primary-hover`, `text-primary-foreground`, `text-primary-text` (link) |
| Realce          | `text-accent`, `bg-accent`                                                                    |
| Estados         | `{success,danger,warning}` + `-soft` (fundo) e `-text` (texto)                                |

- **Proibido:** paleta fixa do Tailwind (`bg-white`, `text-gray-500`, `bg-blue-600`,
  `border-slate-200`...) e hex/rgb soltos em componentes.
- Precisa de uma cor nova? Crie o token **nos dois temas** em `src/index.css`.
- Gráficos: cores via `useChartTheme()`.
- `npm run check:padroes` acusa paleta fixa e hex; exceção justificada entra na lista
  `EXCECOES` de `scripts/check-padroes.mjs`, com o motivo.

## Componentes obrigatórios

| Precisa de…                | Use                                                                          |
| -------------------------- | ---------------------------------------------------------------------------- |
| Botão com texto            | `Button` (`variant`: primary, secondary, ghost, danger; `loading`; `icon`)   |
| Botão só com ícone         | `IconButton` — `label` é obrigatório (vira `aria-label` e dica)              |
| Campo de formulário        | `TextField`, `SelectField`, `TextAreaField`, `SwitchField`                   |
| Modal                      | `Modal` / `FormModal` (baseados em `<dialog>`); confirmação: `ConfirmDialog` |
| Mensagem na tela           | `Alert` (`error` tem `role="alert"`, os outros `role="status"`)              |
| Notificação de ação        | `useToast().showToast(msg, variant?)`                                        |
| Carregando / erro / vazio  | `LoadingState`, `ErrorState` (com `onRetry`), `EmptyState`                   |
| Título da página do painel | `PageHeader` (também define o título da aba)                                 |
| Agrupar conteúdo           | `Card` + `CardHeader`                                                        |
| Ícones                     | `lucide-react`, sempre com `aria-hidden="true"` e `className="size-4"`       |

`<button>` nativo numa página só quando nenhum dos acima serve, e sempre com nome
acessível (texto ou `aria-label`) e `type`.

## Estados de toda tela que busca dados

Carregando, erro (com "Tentar novamente"), vazio e sucesso. Listagens já ganham isso com
`ListContent`; outras telas usam os componentes de `src/components/feedback/states.tsx`.
Botão de envio mostra `loading` e não permite duplo clique.

## Responsividade

- Mobile first: layout em coluna e `sm:`/`lg:` para expandir.
- Sem rolagem horizontal da página em 360px de largura. Tabelas usam `DataTable`
  (colunas com `hideBelow`).
- Espaçamentos e tamanhos pela escala do Tailwind (`p-4`, `gap-4`, `max-w-md`); evite
  valores arbitrários (`w-[437px]`).

## Acessibilidade

- Um `h1` por página. `section` com `aria-labelledby` quando houver título próprio.
- Todo controle tem nome acessível: campo pelo `label` dos componentes de campo, botão
  pelo texto ou `label` do `IconButton`.
- Foco visível e navegação por teclado funcionando (Tab, Enter, Esc nos modais).
- Imagens e SVG decorativos com `aria-hidden="true"`.
- O ESLint (`jsx-a11y`) pega parte disso; o resto está no checklist da skill
  `revisar-padroes`.

## Textos da interface

- Português, frases curtas; botões com verbo ("Salvar", "Enviar link", "Voltar para o login").
- Mensagens de sucesso no particípio com ponto final ("Produto cadastrado.",
  "Senha alterada com sucesso.").
- Os textos são os seletores do e2e: mude-os quando a UX pedir e ajuste o teste junto,
  nunca o contrário.
