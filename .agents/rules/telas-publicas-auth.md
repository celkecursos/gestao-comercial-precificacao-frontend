---
description: Telas públicas e fluxos de autenticação (login, recuperação e redefinição de senha) — rota pública, layout, mensagens que não revelam cadastro, token na URL e segurança.
paths:
  - 'src/pages/auth/**'
  - 'src/routes/**'
  - 'src/services/authService.ts'
  - 'src/types/auth.ts'
  - 'src/contexts/AuthProvider.tsx'
  - 'src/services/api.ts'
---

# Telas públicas e fluxos de autenticação

Tela pública = acessível sem login, fora do `AdminLayout` (sem menu lateral). Hoje só
existe `/login`. Esta rule vale para qualquer nova (ex.: "Esqueci minha senha",
"Nova senha").

## Rota

- Caminho em `ROUTES` (`src/routes/paths.ts`), **em português**, como as demais URLs.
  Para a recuperação de senha, use:
  - `forgotPassword: '/recuperar-senha'` — pedir o link por e-mail;
  - `resetPassword: '/redefinir-senha'` — cadastrar a nova senha (o link do e-mail).
- A rota entra como filha de `PublicOnlyRoute` em `router.tsx`, ao lado de `/login`
  (usuário já autenticado é levado ao painel). Atualize o comentário do topo de
  `router.tsx` ("Públicas: ...").
- Páginas públicas são importadas direto em `router.tsx` (não em `lazy-pages.tsx`).
- **Não** entram em `navigation.ts` (menu é só do painel).
- O endereço da tela que o backend coloca no e-mail é uma variável de ambiente **do
  backend** (`FRONTEND_RESET_PASSWORD_URL`). Informe no PR o valor esperado por ambiente
  (ex.: `http://localhost:5173/redefinir-senha`). O fallback de SPA da hospedagem
  (`public/.htaccess`) já permite abrir essas URLs direto.

## Layout

- Reaproveite a moldura de `src/pages/auth/LoginPage.tsx`: fundo decorativo, cabeçalho
  com `Logo` + `ThemeToggle`, cartão central (`section` com `aria-labelledby` apontando
  para o `h1`).
- Ao criar a **segunda** tela pública, **não copie** a moldura: extraia-a para
  `src/pages/auth/AuthLayout.tsx` (props: `title`, `description`, `children`) e faça o
  `LoginPage` usá-la também, sem mudar nenhum texto do login (o e2e depende deles).
- O `LoginHero` (coluna de apresentação) é do login; telas de senha podem usar só o
  cartão centralizado.
- Título da aba: `document.title = \`<Título> · ${APP_FULL_NAME}\``num`useEffect`,
como no `LoginPage`.
- Toda tela pública tem caminho de volta: link "Voltar para o login" (`<Link to={ROUTES.login}>`).
- Link entre telas é `<Link>` do `react-router` estilizado como link
  (`text-primary-text hover:underline font-medium text-sm`), não um `Button`.

## Serviço e tipos

- Métodos novos em `src/services/authService.ts` (não crie outro serviço de auth), com
  JSDoc curto do comportamento. Tipos dos payloads/respostas em `src/types/auth.ts`,
  conforme o Swagger.
- Endpoint público que responde **401** como parte do fluxo normal deve entrar em
  `IGNORE_UNAUTHORIZED` (`src/services/api.ts`), senão o app trata como sessão expirada.
  Erros de token inválido costumam ser 400 — confira no Swagger.

## Segurança e mensagens

- **Não revele se um e-mail tem cadastro.** No pedido de recuperação, a tela mostra a
  **mesma** mensagem de sucesso exista ou não o e-mail — use a mensagem que a API devolve,
  ou um texto genérico ("Se o e-mail estiver cadastrado, você receberá um link...").
- **Token da URL** (`?token=`): leia com `useSearchParams`. Envie só no corpo do POST.
  Nunca grave em `localStorage`/`sessionStorage`, nunca registre em log.
- **Sem token na URL:** não mostre o formulário; mostre o estado de link inválido com o
  caminho para pedir um novo.
- **Link inválido, expirado ou já usado** (erro da API): mensagem clara (a da API, via
  `getErrorMessage`) e link para pedir um novo — não deixe o usuário preso no formulário.
- **Muitas tentativas (429):** mostre a mensagem da API no `Alert` de erro.
- **Após redefinir a senha:** a API encerra as sessões do usuário. Leve-o ao login com
  `navigate(ROUTES.login, { replace: true, state: { passwordReset: true } })` e mostre no
  `LoginPage` um `Alert variant="success"` ("Senha redefinida. Entre com a nova senha.").
  Não faça login automático.
- Política de senha: `isStrongPassword` + `PASSWORD_HINT` (`src/utils/validation.ts`),
  com campo de confirmação — ver `.agents/rules/formularios.md`.

## Login

- O link "Esqueci minha senha" fica no formulário de login, perto do campo Senha, e leva a
  `ROUTES.forgotPassword`. Não altere os textos existentes do login.
- O `PublicOnlyRoute` lê `location.state.from` para voltar à página de origem após o
  login. Ao passar outro `state` para o login, preserve esse comportamento.

## Teste e2e

Fluxos públicos rodam **sem sessão** e criam o próprio usuário — ver "Fluxos sem sessão"
e "Fluxos com e-mail" em `.agents/rules/e2e.md`.
