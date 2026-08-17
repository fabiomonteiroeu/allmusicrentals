import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, relative } from 'node:path';

/**
 * Guarda da regra de aceite da Fase 03: nenhuma Dynamic Zone (nem qualquer componente)
 * renderiza HTML cru do CMS. Todo `dangerouslySetInnerHTML` precisa vir de conteúdo
 * que passou por `src/lib/cms/sanitize` (tipo `HtmlSeguro`).
 *
 * Exceções: JSON-LD (`application/ld+json`) e o registry de styled-components, que
 * injetam conteúdo gerado por nós, não pelo CMS — devem marcar a linha com
 * `// sanitize-ok: <motivo>`.
 */

const SRC_DIR = join(process.cwd(), 'src');
const EXCLUDE_FILE_SUFFIXES = ['html-sanitizado.test.ts'];

function walk(dir: string): string[] {
  if (!existsSync(dir)) return [];
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) out.push(...walk(full));
    else if (/\.(ts|tsx)$/.test(entry) && !EXCLUDE_FILE_SUFFIXES.some((s) => full.endsWith(s)))
      out.push(full);
  }
  return out;
}

describe('guarda de HTML sanitizado', () => {
  const arquivos = walk(SRC_DIR);

  it('todo dangerouslySetInnerHTML vem do sanitizador do CMS ou está justificado', () => {
    const violacoes: string[] = [];

    for (const arquivo of arquivos) {
      const conteudo = readFileSync(arquivo, 'utf8');
      if (!conteudo.includes('dangerouslySetInnerHTML')) continue;

      const importaSanitizador =
        /from\s+['"](@\/lib\/cms\/sanitize|\.\.?\/[^'"]*sanitize)['"]/.test(conteudo) ||
        /HtmlSeguro/.test(conteudo);

      conteudo.split('\n').forEach((linha, i) => {
        if (!linha.includes('dangerouslySetInnerHTML')) return;
        const justificado =
          /sanitize-ok:/.test(linha) || /sanitize-ok:/.test(conteudo.split('\n')[i - 1] ?? '');
        if (!importaSanitizador && !justificado) {
          violacoes.push(`${relative(process.cwd(), arquivo)}:${i + 1}  ${linha.trim()}`);
        }
      });
    }

    expect(violacoes).toEqual([]);
  });

  it('o sanitizador do CMS existe e é server-only', () => {
    const sanitize = readFileSync(join(SRC_DIR, 'lib', 'cms', 'sanitize.ts'), 'utf8');
    expect(sanitize).toContain("import 'server-only'");
    expect(sanitize).toContain('allowedTags');
  });
});
