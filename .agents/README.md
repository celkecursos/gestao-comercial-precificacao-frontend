# `.agents/`: rules e skills de IA do projeto

Fonte única de tudo que orienta agentes de IA (e pessoas) neste repositório. O conteúdo
não depende de ferramenta: Claude Code, Codex, Copilot, Cursor, Gemini e agentes do
Paperclip usam os mesmos arquivos.

## Como cada ferramenta chega aqui

| Ferramenta                       | Entrada                               | Como acha rules e skills                                        |
| -------------------------------- | ------------------------------------- | --------------------------------------------------------------- |
| Qualquer uma                     | `AGENTS.md`                           | Tabela "Leia antes de cada tipo de tarefa" (leitura de arquivo) |
| Claude Code (CLI e VS Code)      | `CLAUDE.md` → `@AGENTS.md`            | `.claude/skills` e `.claude/rules` → links para `.agents/`      |
| Codex (CLI, VS Code, Paperclip)  | `AGENTS.md`                           | Lê `.agents/skills` direto                                      |
| Outras (Copilot, Cursor, Gemini) | `AGENTS.md` (ou configuração própria) | Tabela do `AGENTS.md`                                           |

A **tabela do `AGENTS.md` é o mecanismo que vale para todas**. O carregamento automático
de cada ferramenta é um bônus; nada aqui pode depender dele.

Os links de `.claude/` são criados por `scripts/setup-ai.mjs`, que roda no `npm install` e
com `npm run setup:ai`. Eles estão no `.gitignore`. No Windows, o script usa junction;
se não conseguir criar o link, copia a pasta e você precisa rodar `npm run setup:ai`
de novo após editar `.agents/`.

## Estrutura

```text
.agents/
├── README.md                     ← este arquivo
├── rules/                        ← O QUÊ: o padrão a seguir
│   ├── arquitetura.md            camadas, nomes, modelos de tela, rotas
│   ├── formularios.md            useFormState, campos, validação, feedback
│   ├── telas-publicas-auth.md    telas fora do painel, login, recuperação de senha
│   ├── ui-tema-acessibilidade.md tokens de cor, componentes, estados, a11y
│   └── e2e.md                    testes Playwright: organização, seletores, dado
└── skills/                       ← COMO: o passo a passo
    ├── implementar-tela/         tarefa → código → teste → PR
    ├── criar-teste-e2e/          e2e de um módulo
    └── revisar-padroes/          varredura + checklist antes do PR
```

Fiscalização automática das rules: `scripts/check-padroes.mjs` (`npm run check:padroes`,
que também faz parte de `npm run check`).

## Precedência

`AGENTS.md` > `rules/` > `skills/` > código de referência citado nas rules. Cada
informação mora em **um** lugar: a skill aponta para a rule, a rule aponta para o
código de referência. Não duplique.

## Criar ou mudar uma rule

`rules/<nome>.md`, em português:

```markdown
---
description: Uma frase dizendo do que a rule trata e quando ela vale.
paths:
  - 'src/pages/**'
---

# Título
```

- `paths` é opcional e só o Claude Code usa (carrega a rule ao tocar esses arquivos);
  as outras ferramentas ignoram o frontmatter. Por isso **toda rule nova também entra na
  tabela do `AGENTS.md`**.
- Aponte para o código de referência (`src/pages/products/ProductsPage.tsx`) em vez de
  copiar código grande: o código vivo é a verdade e não envelhece.
- O que dá para verificar por grep entra também em `scripts/check-padroes.mjs`.

## Criar ou mudar uma skill

`skills/<nome>/SKILL.md` (pasta com o nome da skill, em kebab-case):

```markdown
---
name: <nome>
description: O que a skill faz e QUANDO usar. É o gatilho de quem carrega skills sozinho.
---

# Título
```

- Corpo **neutro de ferramenta**:
  - nada de `$ARGUMENTS` (só o Claude substitui): escreva "o módulo indicado na tarefa";
  - nada de nomes de ferramentas internas (Read, Grep, Agent): escreva "leia", "rode";
  - nada de depender de slash command ou de servidor MCP: o contrato da API vem do
    Swagger por HTTP.
- Escreva para dois modos: **conversa** (pode perguntar ao usuário) e **tarefa autônoma**
  (Paperclip: registra a decisão no PR em vez de perguntar).
- Arquivos de apoio da skill (modelos, scripts) ficam na própria pasta dela.
- Toda skill nova entra na tabela do `AGENTS.md`.

Depois de criar uma pasta nova em `skills/` ou `rules/`, os links já a refletem. Se o
seu ambiente estiver em modo cópia, rode `npm run setup:ai`.
