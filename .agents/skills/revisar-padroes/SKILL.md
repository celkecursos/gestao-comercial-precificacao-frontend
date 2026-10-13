---
name: revisar-padroes
description: Revisa um diff (ou caminho) contra os padrões do projeto — roda a varredura automática (check:padroes) e confere o que nenhuma ferramenta pega, gerando o checklist para o revisor humano. Use antes de abrir um PR, ao revisar o PR de outra pessoa/agente ou quando pedirem "revisar padrões".
---

# Revisar padrões

Entrada: o **alvo** — o diff da branch atual (padrão) ou um caminho. Para o diff:

```bash
git diff --name-only origin/develop...HEAD
git status --short          # inclui o que ainda não foi commitado
```

Você **reporta**; só corrige se for o autor da mudança. Quem revisa o trabalho de outro
não altera o código — comenta.

## 1. Varredura automática

```bash
npm run check                          # lint + typecheck + format:check + check:padroes
node scripts/check-padroes.mjs <arquivos ou pastas>   # só o alvo, se quiser focar
```

O `check:padroes` acusa o que passa no lint e no build mas fere as rules: paleta fixa do
Tailwind, hex solto em componente, `fetch`/storage/`console` fora do lugar, e, no `e2e/`,
`waitForTimeout`, seletor por posição/placeholder/classe, `force: true`, `page.pause()`.
Avisos (não falham) pedem julgamento: `data-testid`, `<button>` nativo em página.

Exceção legítima não se resolve mudando o código para enganar o script: entra em
`EXCECOES` de `scripts/check-padroes.mjs`, com o motivo, e aparece no diff para o revisor.

## 2. Leitura do diff — o que nenhuma ferramenta pega

Para cada arquivo do alvo, confira contra as rules de `.agents/rules/`:

- [ ] Reaproveitou componentes e hooks existentes; nada duplicado de `src/components/`.
- [ ] Formulário com `useFormState` e campos de `fields.tsx` (não `<input>` cru).
- [ ] HTTP só no serviço; erro por `getErrorMessage`; tipos espelham o Swagger, sem `any`.
- [ ] Rota completa (`paths.ts`, `router.tsx`, menu/guard quando cabe); links usam `ROUTES`.
- [ ] Estados de carregando, erro, vazio e sucesso existem, com textos em português.
- [ ] Fluxo de auth: não revela se o e-mail existe; token não vai para storage nem log.
- [ ] Nenhum texto de interface mudado só para um teste passar.
- [ ] e2e cobre os critérios de aceite, confere o status da API, usa dado `E2E <carimbo>`
      e limpa o que criou (`afterAll`).
- [ ] Escopo: nada além do que a tarefa pediu; README e `e2e/README.md` atualizados.

## 3. Checklist humano

Copie para a descrição do PR, marcando só o que foi **de fato** visto:

- [ ] Tema **claro e escuro** conferidos.
- [ ] Largura de **celular** (360px) sem rolagem horizontal; desktop em 1366×768.
- [ ] Navegação por **teclado** e **foco visível** em toda ação; Esc fecha modais.
- [ ] Estados **vazio / carregando / erro** vistos na tela.
- [ ] **Perfis**: o que cada perfil vê e não vê.
- [ ] e2e verde **duas vezes seguidas** (local) ou na CI.

## Saída

1. **Violações** (`arquivo:linha` · trecho · regra · como corrigir).
2. **A revisar** — o que é ambíguo, com a sua leitura.
3. **Checklist humano** acima.
4. Se estiver tudo limpo, diga isso claramente; não invente achado.
