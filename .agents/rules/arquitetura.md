---
description: Onde cada coisa vive no frontend (types, services, pages, hooks, routes), nomes de arquivos e qual tela usar como modelo para cada tipo de tarefa.
paths:
  - 'src/**'
---

# Arquitetura do frontend

React 19 + Vite + TypeScript + Tailwind 4 + React Router. SPA que consome a API do
backend (NestJS). O detalhe de cada pasta está no `README.md` ("Estrutura do projeto");
aqui fica **a regra de onde colocar o código novo**.

## Camadas — de baixo para cima

| Camada      | Pasta                                       | Regra                                                                                                                    |
| ----------- | ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| Tipos       | `src/types/<recurso>.ts`                    | Espelham os DTOs da API (Swagger). Entidades estendem `BaseEntity`; listagens usam `Paginated<T>` (`src/types/api.ts`).  |
| Serviços    | `src/services/<recurso>Service.ts`          | Objeto `export const <recurso>Service = { ... }` com um método `async` por rota, usando `api`. Retorna `data` já tipado. |
| Hooks       | `src/hooks/`                                | Lógica reutilizável de estado. Só crie um hook novo quando 2+ telas precisarem dele.                                     |
| Componentes | `src/components/{ui,data,feedback,layout}/` | Peças genéricas, sem conhecer recurso da API. Não chamam serviços.                                                       |
| Páginas     | `src/pages/<modulo>/`                       | Uma pasta por módulo. Página + modais/cartões do módulo. Subcomponentes exclusivos em `src/pages/<modulo>/components/`.  |
| Rotas       | `src/routes/`                               | Caminho em `paths.ts`, página lazy em `lazy-pages.tsx`, rota em `router.tsx`, menu em `navigation.ts`.                   |
| Utilitários | `src/utils/`                                | Funções puras: `validation.ts`, `errors.ts`, `format.ts`, `filters.ts`, `cn.ts`.                                         |

Dependência só para baixo: página → hook/serviço/componente → tipo. Componente genérico
nunca importa de `pages/` nem de `services/`.

## Nomes

- Componentes e páginas em `PascalCase.tsx`, um componente exportado por arquivo, export
  nomeado (`export function ProductsPage()`), sem `export default`.
- Página: `<Recurso>Page.tsx` (`ProductsPage`). Modal de formulário: `<Recurso>FormModal.tsx`.
  Cartão dentro de página: `<Assunto>Card.tsx` (`ChangePasswordCard`).
- Serviço: `<recurso>Service.ts`; tipo: `<recurso>.ts` no singular (`product.ts`).
- Imports pelo alias `@/` (`@/services/productService`), nunca `../../`.
- `<modulo>` (pasta em `pages/`) é em inglês e no plural quando for coleção (`products`,
  `users`); a **URL** é em português (`/produtos`, `/usuarios`), definida em `routes/paths.ts`.

## Qual tela usar como modelo

Antes de escrever, abra o modelo e espelhe a estrutura. **Não invente um padrão novo**
quando existir um modelo.

| Você vai fazer…                         | Modelo                                                                            |
| --------------------------------------- | --------------------------------------------------------------------------------- |
| Listagem com busca, filtro e paginação  | `src/pages/products/ProductsPage.tsx`                                             |
| Modal de cadastro/edição                | `src/pages/products/ProductFormModal.tsx`                                         |
| Formulário dentro de cartão (sem modal) | `src/pages/profile/ChangePasswordCard.tsx`                                        |
| Tela pública (fora do painel)           | layout de `src/pages/auth/LoginPage.tsx` + `.agents/rules/telas-publicas-auth.md` |
| Dashboard / indicadores                 | `src/pages/dashboard/`                                                            |
| Serviço                                 | `src/services/productService.ts` (CRUD) ou `src/services/authService.ts` (ações)  |

## Consultas e ações

- **Leitura:** `useApiQuery(fetcher, key)`. A `key` muda quando os parâmetros mudam
  (`JSON.stringify(params)`); `reload()` após escrever.
- **Listagens:** `useListParams()` (página, busca com debounce) + `ListContent` (já trata
  carregando/erro/vazio) + `DataTable` + `RowActions` + `ConfirmDialog`.
- **Ações de linha** (ativar, excluir): `useCrudActions(query.reload)` — mostra o toast
  de sucesso/erro.
- **Formulários:** ver `.agents/rules/formularios.md`.
- **Erro da API:** sempre por `getErrorMessage(error, fallback)` (`src/utils/errors.ts`);
  status por `getErrorStatus(error)`. Nunca leia `error.response` na página.

## Rotas

1. Caminho em `ROUTES` (`src/routes/paths.ts`). Use sempre a constante em links e
   redirecionamentos (`<Link to={ROUTES.login}>`), nunca a string.
2. Página do painel: export lazy em `lazy-pages.tsx`. Páginas públicas são importadas
   direto em `router.tsx` (como `LoginPage`).
3. Rota em `router.tsx`: privada dentro de `ProtectedRoute` + `AdminLayout`; pública
   dentro de `PublicOnlyRoute` (ver `telas-publicas-auth.md`).
4. Item de menu em `navigation.ts` (só telas do painel). Restrição por perfil:
   `RoleGuard` na rota **e** `roles` no item de menu — os dois.

## Proibido

- `fetch` ou `axios` fora de `src/services/`.
- `localStorage`/`sessionStorage` fora de `src/services/token-storage.ts` e do tema.
- `console.log` no código entregue.
- Estado global novo (Context) para dado de uma tela só — use estado local.
- Biblioteca nova (formulário, estado, UI) sem pedido explícito na tarefa.

`npm run check:padroes` verifica parte disso automaticamente.
