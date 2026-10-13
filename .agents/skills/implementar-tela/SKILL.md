---
name: implementar-tela
description: Processo de ponta a ponta para implementar uma tela ou funcionalidade do frontend a partir de uma tarefa — contrato da API, tipos, serviço, página, rota, estados, teste e2e, verificação e descrição do PR. Use ao receber uma tarefa de tela nova, fluxo novo ou mudança de tela.
---

# Implementar uma tela

Entrada: a **tarefa** (história, regras de negócio e critérios de aceite). Esta skill é o
**processo**; os padrões estão nas rules de `.agents/rules/` — leia as que o `AGENTS.md`
indica para o tipo de tela antes de escrever código.

## 1. Entender a tarefa

1. Liste os **critérios de aceite** da tarefa, numerados. Eles guiam o código, o teste e
   a descrição do PR. Critério ambíguo: numa conversa, pergunte; numa tarefa autônoma,
   escolha a leitura mais conservadora e registre a premissa no PR.
2. Confira o **escopo**: o que a tarefa diz que fica de fora não entra no PR.
3. Confira o **contrato da API** no Swagger (`http://localhost:3000/api/docs-json`, ou o
   do ambiente de develop): rotas, método, corpo, resposta de sucesso, códigos e mensagens
   de erro. Se o endpoint necessário **não existir**, pare: avise (ou comente na tarefa)
   que a tela depende da API — não crie mock nem chame rota inventada.

## 2. Escolher o modelo

Pela tabela "Qual tela usar como modelo" de `.agents/rules/arquitetura.md`, abra o
arquivo de referência e espelhe a estrutura. Anote o que vai **reaproveitar**
(componentes, hooks, validações) antes de criar qualquer coisa.

## 3. Implementar, nesta ordem

1. **Tipos** em `src/types/<recurso>.ts`, conforme o Swagger.
2. **Serviço**: método novo em `src/services/<recurso>Service.ts` (ou serviço novo no
   formato de `productService.ts`).
3. **Validação** reutilizável em `src/utils/validation.ts`, se houver regra nova.
4. **Página/componentes** em `src/pages/<modulo>/`, seguindo:
   - `.agents/rules/formularios.md` para formulários;
   - `.agents/rules/telas-publicas-auth.md` para telas fora do painel;
   - `.agents/rules/ui-tema-acessibilidade.md` para visual, estados e acessibilidade.
5. **Rota**: `paths.ts` → (`lazy-pages.tsx` se for do painel) → `router.tsx` →
   (`navigation.ts` se for do menu). Ver "Rotas" em `arquitetura.md`.
6. **Pontos de entrada**: links ou botões que levam à tela nova (ex.: link no login).
7. **Estados**: carregando, erro, vazio, sucesso — cada um com o texto final.

Mantenha a mudança **mínima**: não refatore o que a tarefa não pede, exceto a extração
que uma rule manda fazer (ex.: `AuthLayout` na segunda tela pública).

## 4. Teste e2e

Siga `.agents/skills/criar-teste-e2e/SKILL.md`. Cada critério de aceite verificável pela
tela vira um `test.step`. Regra pura (validação de senha, formatação) não vira e2e.

## 5. Verificar

```bash
npm run check     # lint + typecheck + format:check + check:padroes
npm run build
npm run e2e -- e2e/<modulo>/   # com a API no ar; rode duas vezes
```

- `npm run format` corrige a formatação; `npm run lint:fix` resolve parte do lint.
- Sem API no ambiente: diga isso no PR e acompanhe a CI (`gh pr checks <número> --watch`).
- Depois, siga `.agents/skills/revisar-padroes/SKILL.md` sobre o seu diff.

## 6. Documentar

- `README.md`: atualize a seção da funcionalidade (ex.: "Recuperação de senha") e a
  "Estrutura do projeto", se criou pasta.
- `e2e/README.md`: tabela "Os specs" com o que o spec novo cobre e o dado que cria.
- `AGENTS.md`: remova a funcionalidade de "Funcionalidades pendentes" quando entregue.

## 7. Entregar

Pull Request para `develop`, na branch da tarefa (ver "Branches" no `AGENTS.md`). Na
descrição:

1. **Critérios de aceite**: para cada um, como foi atendido e qual `test.step` o cobre.
2. **Premissas** assumidas e o que ficou fora do escopo.
3. **Verificação**: resultado de `npm run check`, `npm run build` e do e2e (local ou CI).
4. **Configuração**: variáveis de ambiente novas ou que o backend precisa (ex.: URL da
   tela no e-mail).
5. **Checklist humano** da skill `revisar-padroes`, com o que você conseguiu ou não
   conferir.
