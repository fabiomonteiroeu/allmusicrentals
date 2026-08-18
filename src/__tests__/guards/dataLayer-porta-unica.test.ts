import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, relative } from 'node:path';

/**
 * Guarda da porta única de eventos (MED-01): nenhum arquivo fora de
 * `src/lib/analytics/dataLayer.ts` pode acessar `window.dataLayer`/`dataLayer.push`
 * diretamente. Complementa a regra de lint `no-restricted-properties`
 * (eslint.config.mjs) com uma segunda barreira independente.
 *
 * Lista fechada. Testes de componente devem mockar `@/lib/analytics/dataLayer` e
 * afirmar sobre `emitirEvento`, nunca inspecionar `window.dataLayer`.
 */

const SRC_DIR = join(process.cwd(), 'src');
const ARQUIVO_PERMITIDO = join(SRC_DIR, 'lib', 'analytics', 'dataLayer.ts');
const EXCLUDE_FILE_SUFFIXES = [
  'dataLayer-porta-unica.test.ts',
  'src/lib/analytics/dataLayer.test.ts',
];

function walk(dir: string): string[] {
  if (!existsSync(dir)) return [];
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) out.push(...walk(full));
    else if (/\.(ts|tsx)$/.test(entry)) out.push(full);
  }
  return out;
}

describe('guarda da porta única do dataLayer', () => {
  it('nenhum arquivo fora do módulo acessa window.dataLayer ou dataLayer.push', () => {
    const violacoes: string[] = [];
    for (const arquivo of walk(SRC_DIR)) {
      if (arquivo === ARQUIVO_PERMITIDO) continue;
      if (EXCLUDE_FILE_SUFFIXES.some((s) => arquivo.endsWith(s))) continue;
      const conteudo = readFileSync(arquivo, 'utf8');
      conteudo.split('\n').forEach((linha, i) => {
        if (/window\.dataLayer|(?<!window\.)dataLayer\.push/.test(linha)) {
          violacoes.push(`${relative(process.cwd(), arquivo)}:${i + 1}  ${linha.trim()}`);
        }
      });
    }
    expect(violacoes).toEqual([]);
  });
});
