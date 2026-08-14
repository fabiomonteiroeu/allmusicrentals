// Orçamento de performance: falha se o JS transferido ao cliente passar do teto.
// Roda após `next build`. Mede tamanho GZIP (o que impacta LCP/transferência).
// Tetos conservadores na Fase 01; apertados na Fase 14 (Core Web Vitals).
//
// Métricas estáveis no App Router + Turbopack (não há manifesto por rota):
//   - compartilhado: JS de primeira carga que TODA rota baixa (rootMainFiles + polyfills)
//   - total: soma de todo JS em .next/static/chunks
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import { join } from 'node:path';

const ROOT = process.cwd();
const NEXT = join(ROOT, '.next');

// Tetos em bytes GZIP.
const SHARED_BUDGET = Number(process.env.SHARED_JS_BUDGET_BYTES ?? 185 * 1024);
const TOTAL_BUDGET = Number(process.env.TOTAL_JS_BUDGET_BYTES ?? 215 * 1024);

const manifestPath = join(NEXT, 'build-manifest.json');
if (!existsSync(manifestPath)) {
  console.error('✗ .next/build-manifest.json não encontrado. Rode `npm run build` antes.');
  process.exit(1);
}

const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));

function gzipBytesOf(relFiles) {
  let raw = 0;
  let gz = 0;
  for (const rel of relFiles) {
    const full = join(NEXT, rel);
    if (!existsSync(full)) continue;
    const buf = readFileSync(full);
    raw += buf.length;
    gz += gzipSync(buf).length;
  }
  return { raw, gz };
}

const sharedFiles = [...(manifest.rootMainFiles ?? []), ...(manifest.polyfillFiles ?? [])];
const shared = gzipBytesOf(sharedFiles);

// Total: todo .js sob static/chunks (inclui chunks de rota carregados sob demanda).
const chunksDir = join(NEXT, 'static', 'chunks');
const allChunks = [];
function walkJs(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) walkJs(full);
    else if (entry.name.endsWith('.js'))
      allChunks.push(join('static', 'chunks', full.slice(chunksDir.length + 1)));
  }
}
if (existsSync(chunksDir)) walkJs(chunksDir);
const total = gzipBytesOf(allChunks);

const kb = (n) => (n / 1024).toFixed(1).padStart(7);
const sharedOk = shared.gz <= SHARED_BUDGET;
const totalOk = total.gz <= TOTAL_BUDGET;

console.log('Orçamento de performance (JS, gzip):');
console.log(
  `${sharedOk ? '✓' : '✗'}  compartilhado ${kb(shared.gz)} KB gz  (bruto ${kb(shared.raw)} KB)  / teto ${(SHARED_BUDGET / 1024).toFixed(0)} KB`,
);
console.log(
  `${totalOk ? '✓' : '✗'}  total cliente  ${kb(total.gz)} KB gz  (bruto ${kb(total.raw)} KB)  / teto ${(TOTAL_BUDGET / 1024).toFixed(0)} KB`,
);

if (!sharedOk || !totalOk) {
  console.error('\n✗ Orçamento de performance estourado.');
  process.exit(1);
}
console.log('\n✓ Dentro do orçamento.');
