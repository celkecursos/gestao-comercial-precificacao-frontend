# Guia para agentes de IA e desenvolvedores

Convenções deste repositório. Valem para qualquer ferramenta (Claude Code, Codex, Copilot,
Cursor, Gemini, agentes do Paperclip) e para pessoas. Este arquivo é a **entrada**: ele é
curto de propósito e aponta para o detalhe em `.agents/`.

## Antes de começar

- Leia o `README.md`.
- Suba o backend (repositório da API) e rode `npm install` e `npm run dev` aqui.
- O contrato da API está no Swagger do backend: `http://localhost:3000/api/docs`
  (JSON em `/api/docs-json`). Confira nele as rotas, os payloads e as mensagens de erro
  antes de escrever tipos e serviços.

## Leia antes de cada tipo de tarefa

Ler os arquivos indicados é **obrigatório**, mesmo que a sua ferramenta não carregue
rules ou skills automaticamente. Rule = o padrão (o quê). Skill = o passo a passo (como).

| Tarefa                                    | Leia antes                                                                 |
| ----------------------------------------- | -------------------------------------------------------------------------- |
| Qualquer código em `src/`                 | `.agents/rules/arquitetura.md` e `.agents/rules/ui-tema-acessibilidade.md` |
| Tela nova ou mudança de tela              | as duas acima + `.agents/skills/implementar-tela/SKILL.md`                 |
| Formulário                                | `.agents/rules/formularios.md`                                             |
| Tela pública ou fluxo de autenticação     | `.agents/rules/telas-publicas-auth.md` (ex.: login, recuperação de senha)  |
| Teste e2e (Playwright)                    | `.agents/rules/e2e.md` + `.agents/skills/criar-teste-e2e/SKILL.md`         |
| Revisar antes de entregar (ou revisar PR) | `.agents/skills/revisar-padroes/SKILL.md`                                  |
| Criar ou mudar uma rule/skill             | `.agents/README.md`                                                        |

Ordem de precedência em caso de conflito: este arquivo > `.agents/rules/` >
`.agents/skills/` > o código de referência citado nas rules.

## Regras de ouro

- **Idioma:** código em inglês; textos da interface, comentários e documentação em português.
- **HTTP só em `src/services/`**, pelo cliente `api` de `src/services/api.ts`. Componentes
  nunca importam o Axios (o ESLint bloqueia).
- **Sem `any`.** Tipos das entidades e payloads em `src/types/`, espelhando os DTOs da API.
- **Reaproveite antes de criar:** campos, botões, modais, estados e hooks já existem em
  `src/components/` e `src/hooks/`. Não crie um componente paralelo a um existente.
- **Cores só por token semântico** (`bg-surface`, `text-muted`, `border-border`, `bg-primary`...).
  Nunca a paleta fixa do Tailwind (`bg-white`, `text-gray-500`, `text-blue-600`).
- **Nunca troque um texto da interface para facilitar um teste.** Textos, `label` de campos
  e `label` de `IconButton` são os seletores do e2e.
- **Nunca** coloque segredo, token ou credencial no código, nem aponte nada para produção.

## Branches

- `main` = produção, `homolog` = testes humanos, `develop` = integração.
- Trabalhe na branch da tarefa, criada a partir de `develop`, e entregue por Pull Request
  para `develop`. No Paperclip, a branch já vem criada (`<ID>-<slug>`): use-a e não crie
  outra. Fora dele, crie uma (ex.: `feature/recuperacao-de-senha`).
- **Nunca** faça commit ou push diretamente em `develop`, `homolog` ou `main`.

## Definição de pronto

```bash
npm run check      # lint + typecheck + format:check + check:padroes
npm run build
```

- Tela nova ou alterada: teste e2e criado ou ajustado (`.agents/rules/e2e.md`).
- O e2e precisa da API no ar. Se o seu ambiente não tiver a API (ex.: agente em VPS),
  diga isso no PR e use a CI (`.github/workflows/e2e.yml`) como verificação:
  `gh pr checks <número> --watch`. PR só está pronto para revisão com a CI verde.
- Confira a tela nos **dois temas** (claro e escuro) e em largura de celular — ou, se não
  puder abrir um navegador, liste isso como pendência para o revisor no PR.
- README atualizado quando a funcionalidade for visível ao usuário.

## Descrição do Pull Request

Para cada critério de aceite da tarefa: como foi atendido e qual teste o cobre. Depois,
o resultado de `npm run check`, `npm run build` e do e2e (local ou CI), e o checklist humano
da skill `revisar-padroes`.

## Funcionalidades pendentes

A **recuperação de senha** ainda não existe e é uma tarefa planejada, a ser feita por um
agente via Paperclip. Ela depende dos endpoints `POST /auth/forgot-password` e
`POST /auth/reset-password` estarem na `develop` do backend.
