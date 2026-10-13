#!/usr/bin/env node
/**
 * Varredura dos padrões que passam no lint e no build, mas ferem as rules de `.agents/rules/`.
 * Independe da ferramenta de IA (ou pessoa) que escreveu o código.
 *
 *   npm run check:padroes                         # src/ e e2e/ inteiros
 *   node scripts/check-padroes.mjs src/pages/auth # só os caminhos informados
 *
 * Erros fazem o comando falhar; avisos só pedem julgamento de quem revisa.
 * Exceção legítima entra em EXCECOES, com o motivo — nunca contorne o script no código.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { basename, dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SCAN_DIRS = ['src', 'e2e'];
const EXTENSIONS = ['.ts', '.tsx'];

const PALETTE =
  'slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose';

const inSrc = (file) => file.startsWith('src/');
const inE2e = (file) => file.startsWith('e2e/');
const inScreens = (file) => /^src\/(pages|layouts)\//.test(file);
const isComponentFile = (file) =>
  /^src\/(pages|components|layouts)\//.test(file) && file.endsWith('.tsx');

/** Regras por linha. `files` decide onde a regra vale. */
const RULES = [
  {
    id: 'paleta-fixa',
    level: 'erro',
    files: inSrc,
    pattern: new RegExp(
      `\\b(?:bg|text|border|ring|fill|stroke|from|via|to|outline|divide|decoration|placeholder|caret|shadow)-(?:${PALETTE})-\\d{2,3}\\b`,
    ),
    message:
      'Paleta fixa do Tailwind. Use um token semântico (ui-tema-acessibilidade.md).',
  },
  {
    id: 'branco-preto',
    level: 'erro',
    files: inScreens,
    pattern: /\b(?:bg|text|border)-(?:white|black)\b(?!\/)/,
    message: 'Cor fixa em tela. Use bg-surface, text-foreground, border-border...',
  },
  {
    id: 'hex-em-componente',
    level: 'erro',
    files: isComponentFile,
    pattern: /(?<![\w&])#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3})\b/,
    message:
      'Cor hexadecimal em componente. Use token (src/index.css) ou useChartTheme().',
  },
  {
    id: 'fetch-fora-de-servico',
    level: 'erro',
    files: (file) => inSrc(file) && !file.startsWith('src/services/'),
    pattern: /\bfetch\(/,
    message: 'HTTP só em src/services/, pelo cliente api (arquitetura.md).',
  },
  {
    id: 'storage-fora-do-lugar',
    level: 'erro',
    files: (file) =>
      inSrc(file) &&
      !['src/services/token-storage.ts', 'src/contexts/ThemeProvider.tsx'].includes(file),
    pattern: /\b(?:localStorage|sessionStorage)\b/,
    message:
      'Storage só em token-storage.ts e no tema. Token de URL nunca vai para storage.',
  },
  {
    id: 'console',
    level: 'erro',
    files: inSrc,
    pattern: /\bconsole\.(?:log|debug|info)\(/,
    message: 'console.log no código entregue.',
  },
  {
    id: 'data-testid',
    level: 'aviso',
    files: (file) => inSrc(file) || inE2e(file),
    pattern: /data-testid|getByTestId\(/,
    message:
      'data-testid é o último recurso: prefira papel + nome acessível ou rótulo (e2e.md).',
  },
  {
    id: 'button-nativo',
    level: 'aviso',
    files: inScreens,
    pattern: /<button\b/,
    message: '<button> nativo em tela: confira se não deveria ser Button ou IconButton.',
  },
  {
    id: 'e2e-espera-fixa',
    level: 'erro',
    files: inE2e,
    pattern: /\bwaitForTimeout\(/,
    message: 'Espera fixa. Espere a resposta, a URL ou o elemento (e2e.md).',
  },
  {
    id: 'e2e-seletor-por-posicao',
    level: 'erro',
    files: inE2e,
    pattern: /\.(?:nth|first|last)\(|:nth-(?:child|of-type)/,
    message:
      'Seletor por posição. Localize pelo conteúdo da linha ou nome acessível (e2e.md).',
  },
  {
    id: 'e2e-seletor-fragil',
    level: 'erro',
    files: inE2e,
    pattern: /getByPlaceholder\(|locator\(\s*['"`](?:[^'"`]*[\s>+~(])?\.[a-zA-Z]/,
    message:
      'Seletor por placeholder ou classe CSS. Use papel, rótulo ou conteúdo (e2e.md).',
  },
  {
    id: 'e2e-force',
    level: 'erro',
    files: inE2e,
    pattern: /\bforce:\s*true\b/,
    message: 'force: true esconde problema real de interação ou acessibilidade.',
  },
  {
    id: 'e2e-foco-ou-pausa',
    level: 'erro',
    files: inE2e,
    pattern: /\b(?:test|describe)\.only\(|\bpage\.pause\(/,
    message: '.only() ou page.pause() esquecido.',
  },
];

/** Regras por arquivo (nome e local). */
const FILE_RULES = [
  {
    id: 'e2e-nome-repete-modulo',
    level: 'erro',
    check: (file) => {
      const match = /^e2e\/([^/]+)\/([^/]+)\.spec\.ts$/.exec(file);
      return match && match[2].startsWith(`${match[1]}-`);
    },
    message: 'O nome do spec não repete o módulo: e2e/users/crud.spec.ts (e2e.md).',
  },
  {
    id: 'e2e-helper-como-spec',
    level: 'erro',
    check: (file) => inE2e(file) && /\.helpers?\.spec\.ts$/.test(file),
    message: 'Helper não termina em .spec.ts (o Playwright o coletaria como teste).',
  },
];

/**
 * Exceções aprovadas: { file, rule, reason }. Toda entrada aparece no diff para o revisor.
 */
const EXCECOES = [
  {
    file: 'src/components/layout/Logo.tsx',
    rule: 'hex-em-componente',
    reason: 'Cores da marca no SVG do logotipo.',
  },
  {
    file: 'src/components/layout/Logo.tsx',
    rule: 'paleta-fixa',
    reason: 'Traço do logotipo no tema escuro (cor da marca).',
  },
  {
    file: 'src/pages/auth/LoginHero.tsx',
    rule: 'hex-em-componente',
    reason: 'Ilustração SVG decorativa com as cores da marca.',
  },
  {
    file: 'src/pages/auth/LoginPage.tsx',
    rule: 'button-nativo',
    reason:
      'Botão "Mostrar senha" posicionado dentro do campo, com aria-label e aria-pressed.',
  },
  {
    file: 'src/layouts/Sidebar.tsx',
    rule: 'button-nativo',
    reason: 'Item "Sair" do menu lateral, com o mesmo visual dos links de navegação.',
  },
  {
    file: 'src/pages/dashboard/components/QuotationChart.tsx',
    rule: 'button-nativo',
    reason: 'Grupo de alternância de commodity, com aria-pressed.',
  },
];

function isException(file, rule) {
  return EXCECOES.some((entry) => entry.file === file && entry.rule === rule);
}

function walk(dir) {
  const absolute = join(ROOT, dir);
  let entries;
  try {
    entries = readdirSync(absolute);
  } catch {
    return [];
  }
  return entries.flatMap((name) => {
    const path = join(dir, name);
    if (statSync(join(ROOT, path)).isDirectory()) return walk(path);
    return EXTENSIONS.some((ext) => name.endsWith(ext)) ? [path] : [];
  });
}

const toPosix = (path) => path.split('\\').join('/');
const isComment = (line) => /^\s*(?:\/\/|\/\*|\*)/.test(line);

const filters = process.argv
  .slice(2)
  .map((arg) => toPosix(relative(ROOT, join(process.cwd(), arg))).replace(/\/$/, ''));
const files = SCAN_DIRS.flatMap(walk)
  .map(toPosix)
  .filter(
    (file) =>
      filters.length === 0 ||
      filters.some((filter) => file === filter || file.startsWith(`${filter}/`)),
  );

const findings = [];
for (const file of files) {
  for (const rule of FILE_RULES) {
    if (rule.check(file) && !isException(file, rule.id)) {
      findings.push({ file, line: 1, rule, snippet: basename(file) });
    }
  }
  const lines = readFileSync(join(ROOT, file), 'utf-8').split(/\r?\n/);
  lines.forEach((text, index) => {
    if (isComment(text)) return;
    for (const rule of RULES) {
      if (rule.files(file) && rule.pattern.test(text) && !isException(file, rule.id)) {
        findings.push({ file, line: index + 1, rule, snippet: text.trim() });
      }
    }
  });
}

const errors = findings.filter((finding) => finding.rule.level === 'erro');
const warnings = findings.filter((finding) => finding.rule.level === 'aviso');

for (const { file, line, rule, snippet } of [...errors, ...warnings]) {
  console.log(
    `${file}:${line}  ${rule.level.toUpperCase()} [${rule.id}] ${rule.message}`,
  );
  console.log(`    ${snippet.slice(0, 160)}`);
}

console.log(
  `\ncheck:padroes — ${files.length} arquivo(s), ${errors.length} erro(s), ${warnings.length} aviso(s).`,
);
if (errors.length > 0) process.exitCode = 1;
