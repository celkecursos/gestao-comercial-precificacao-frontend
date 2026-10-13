#!/usr/bin/env node
/**
 * Projeta `.agents/` (fonte única das rules e skills) nas pastas que cada ferramenta de IA
 * procura. Roda sozinho no `npm install` (postinstall) e à mão com `npm run setup:ai`.
 *
 * - Codex e outras ferramentas que seguem o padrão `.agents/` leem a pasta direto.
 * - Claude Code procura em `.claude/skills` e `.claude/rules`: aqui viram links para
 *   `.agents/` (symlink no Linux/macOS, junction no Windows — não exige modo desenvolvedor).
 *   Se o link falhar, a pasta é copiada; nesse caso, rode de novo após editar `.agents/`.
 *
 * Os destinos estão no `.gitignore`: só `.agents/` é versionado. O script nunca falha o
 * `npm install` — no pior caso, avisa.
 */
import {
  cpSync,
  existsSync,
  lstatSync,
  mkdirSync,
  readlinkSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const MARKER = '.gerado-por-setup-ai';

/** Destino (pasta que a ferramenta lê) → origem em `.agents/`. Novas ferramentas entram aqui. */
const TARGETS = [
  { path: '.claude/skills', source: '.agents/skills' },
  { path: '.claude/rules', source: '.agents/rules' },
];

function pointsTo(linkPath, sourcePath) {
  try {
    return resolve(dirname(linkPath), readlinkSync(linkPath)) === resolve(sourcePath);
  } catch {
    return false;
  }
}

function project({ path, source }) {
  const target = join(ROOT, path);
  const origin = join(ROOT, source);
  if (!existsSync(origin)) return `${path}: origem ${source} não existe — ignorado`;

  const stat = lstatSync(target, { throwIfNoEntry: false });
  if (stat?.isSymbolicLink() && pointsTo(target, origin)) return `${path}: link ok`;
  if (stat && !stat.isSymbolicLink() && !existsSync(join(target, MARKER))) {
    return `${path}: pasta existente com conteúdo próprio — NÃO alterada. Mova o conteúdo para ${source} e rode de novo.`;
  }
  if (stat) rmSync(target, { recursive: true, force: true });

  mkdirSync(dirname(target), { recursive: true });
  try {
    if (process.platform === 'win32') symlinkSync(origin, target, 'junction');
    else symlinkSync(relative(dirname(target), origin), target, 'dir');
    return `${path}: link criado → ${source}`;
  } catch {
    cpSync(origin, target, { recursive: true });
    writeFileSync(
      join(target, MARKER),
      `Cópia gerada de ${source} por scripts/setup-ai.mjs. Não edite aqui: edite ${source} e rode npm run setup:ai.\n`,
    );
    return `${path}: link indisponível, pasta copiada de ${source} (rode de novo após editar)`;
  }
}

for (const entry of TARGETS) {
  try {
    console.log(`setup:ai — ${project(entry)}`);
  } catch (error) {
    console.warn(
      `setup:ai — ${entry.path}: falhou (${error.message}). Siga o AGENTS.md.`,
    );
  }
}
