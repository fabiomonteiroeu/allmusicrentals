import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

/**
 * Guarda de segredos: nada sensível pode ir para o bundle do cliente.
 * - Nenhuma variável `NEXT_PUBLIC_*` pode ter nome de segredo (TOKEN, SECRET, KEY, PASSWORD, PRIVATE).
 * - Qualquer arquivo que leia segredos de servidor (STRAPI_*, *_TOKEN, *_SECRET) precisa ser
 *   server-only (importar 'server-only') ou ser um Route Handler / arquivo de servidor.
 *
 * A varredura do bundle compilado (.next/static) contra valores reais de segredo
 * é feita na Fase 15; aqui garantimos a disciplina no código-fonte.
 */

const SRC_DIR = join(process.cwd(), 'src');
const EXCLUDE_FILE_SUFFIXES = ['no-secret.test.ts'];

const SECRET_NAME = /(TOKEN|SECRET|KEY|PASSWORD|PRIVATE|APIKEY)/i;
const PUBLIC_ENV = /process\.env\.NEXT_PUBLIC_([A-Z0-9_]+)/g;
// Sem flag `/g`: usada só com .test() num loop — evita estado de lastIndex entre arquivos.
// Casa as DUAS notações: `process.env.NOME` e `process.env['NOME']`/`process.env["NOME"]`.
// Só a notação de ponto deixava um desvio trivial: trocar para colchetes escapava da guarda.
const SERVER_SECRET_ENV =
  /process\.env(?:\.|\[\s*['"])[A-Z0-9_]*(?:TOKEN|SECRET|PASSWORD|PRIVATE_KEY)[A-Z0-9_]*/;

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) {
      out.push(...walk(full));
    } else if (/\.(ts|tsx|js|jsx)$/.test(entry)) {
      if (EXCLUDE_FILE_SUFFIXES.some((s) => full.endsWith(s))) continue;
      out.push(full);
    }
  }
  return out;
}

describe('guarda de segredos', () => {
  const files = walk(SRC_DIR);

  it('nenhuma variável NEXT_PUBLIC_* tem nome de segredo', () => {
    const hits: string[] = [];
    for (const file of files) {
      const content = readFileSync(file, 'utf8');
      for (const match of content.matchAll(PUBLIC_ENV)) {
        const name = match[1] ?? '';
        if (SECRET_NAME.test(name)) {
          hits.push(`${relative(process.cwd(), file)}  NEXT_PUBLIC_${name}`);
        }
      }
    }
    expect(hits).toEqual([]);
  });

  it('todo arquivo que lê segredo de servidor é server-only', () => {
    const offenders: string[] = [];
    for (const file of files) {
      const content = readFileSync(file, 'utf8');
      const usesSecret = SERVER_SECRET_ENV.test(content);
      if (!usesSecret) continue;

      const isServerOnly = /['"]server-only['"]/.test(content);
      const isRouteHandler = /[/\\]route\.(ts|js)$/.test(file);
      // Arquivo de teste não entra em bundle algum — ler segredo do ambiente ali é legítimo
      // (ex.: definir REVALIDATE_SECRET para exercitar o contrato do webhook).
      const isTestFile = /\.(test|spec)\.(ts|tsx|js|jsx)$/.test(file);
      const hasUseClient = /^\s*['"]use client['"]/m.test(content);

      if (hasUseClient || (!isServerOnly && !isRouteHandler && !isTestFile)) {
        offenders.push(relative(process.cwd(), file));
      }
    }
    expect(offenders).toEqual([]);
  });
});
