---
name: criar-teste-e2e
description: Cria ou amplia os testes e2e (Playwright) de um módulo do frontend seguindo o padrão do projeto — e2e/<modulo>/<fluxo>.spec.ts. Use quando pedirem "teste e2e", "teste ponta a ponta", ao terminar uma tela nova ou ao mudar uma tela que já tem teste.
---

# Criar teste e2e de um módulo

Entrada: o **módulo** (nome da pasta em `src/pages/`) e, opcionalmente, o **fluxo** —
vindos da tarefa ou do pedido. Se não estiverem claros, deduza pela tela alterada.

O **padrão** (organização, seletores, dado de teste) está em `.agents/rules/e2e.md` — leia
antes de escrever. Esta skill é o **processo**. Modelos: `e2e/users/` (CRUD com perfil),
`e2e/products/` (com helper do módulo) e `e2e/session.spec.ts` (sem sessão).

## 1. Entender a tela antes de escrever

Leia, nesta ordem:

1. `src/pages/<modulo>/` — a página e o modal de formulário. Anote os textos exatos:
   título (`PageHeader`), botões, `label` de cada campo, título do modal, mensagens do
   `showToast`/`useCrudActions`, `itemLabel` do `RowActions`.
2. `src/services/<recurso>Service.ts` — métodos e rotas HTTP (para os `waitForResponse`).
3. `src/routes/router.tsx` e `navigation.ts` — rota, `RoleGuard`, `roles` do menu.
4. `src/types/` e `src/utils/validation.ts` — campos obrigatórios e mensagens de validação.
5. Se tiver acesso ao backend (`../gestao-comercial-precificacao-backend/src/<recurso>/`):
   exclusão física ou lógica, conflitos (409), regras que o front não valida.

Se algo não for localizável sem posição ou classe CSS, **pare e avise** — a correção é
no componente (acessibilidade), não um seletor frágil.

## 2. Planejar os specs

Liste os specs antes de escrever. Numa conversa, proponha a lista ao usuário e espere o
ok; numa tarefa autônoma (ex.: Paperclip), registre a lista na descrição do PR. Exemplo:

- `crud.spec.ts` — ciclo completo num único `test` com `test.step`s: abre, valida vazio,
  cadastra, busca, erro de negócio da API, edita, ativa/desativa, exclui.
- `access.spec.ts` — o que cada perfil vê e não vê (só se a tela tiver regra de perfil).
- outros fluxos específicos do módulo (ex.: cálculo exibido, filtros).
- fluxo público ou com e-mail (ex.: recuperação de senha) — siga "Fluxos sem sessão" e
  "Fluxos com e-mail" da rule.

Um arquivo por fluxo, não um arquivo gigante por módulo.

## 3. Escrever

- Copie a estrutura de `e2e/users/crud.spec.ts`: cabeçalho JSDoc (cobre / não cobre /
  dado criado), constantes `STAMP`/`NAME`, funções locais `rowOf`, `successToast`, `afterAll`
  de limpeza com `adminApi()`.
- Toda ação que chama a API: `waitForResponse` **antes** do clique + asserção do status.
- Repetiu um trecho em dois specs do mesmo módulo? Extraia para `e2e/<modulo>/<modulo>.helpers.ts`.
  Serve para todos os módulos? `e2e/support/`.

## 4. Verificar

```bash
npm run e2e -- e2e/<modulo>/      # passar
npm run e2e -- e2e/<modulo>/      # passar DE NOVO (dado único + limpeza)
npm run check
```

A API precisa estar rodando. Se o seu ambiente não tiver a API (ex.: agente em VPS),
escreva o teste, rode `npm run check`, diga no PR que o e2e não rodou localmente e
acompanhe a CI (`gh pr checks <número> --watch`). Falhou na CI: baixe o artefato
`playwright-report` do job e leia o trace. Se um teste falhar, abra `npm run e2e:report` e leia o
trace antes de mexer: a falha pode ser um **bug real** da tela ou da API. Bug real não se
contorna no teste — registre no `e2e/README.md` (seção "Achados") e avise o usuário
(ou descreva no PR).

## 5. Documentar

Atualize a tabela "Os specs" do `e2e/README.md` com o que o módulo cobre e o dado que cria.
