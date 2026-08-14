import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

/**
 * Guarda da regra inviolável: fluxo de ORÇAMENTO SEM PREÇO / SEM PAGAMENTO.
 * Falha o build se vocabulário de preço/compra/checkout aparecer no código-fonte
 * (UI, modelo de dados, dataLayer, schema.org, nomes de variáveis, rotas).
 *
 * Escopo: código em src/ (exceto dicionários de conteúdo e este próprio teste).
 * Conteúdo editorial legítimo pode citar "preço"/"valor" (ex.: FAQ "Os preços aparecem no site? NÃO"),
 * por isso os dicionários e o CMS não são varridos aqui — a regra é sobre CÓDIGO.
 *
 * Exceção aprovada (docs/00-divergencias.md #15): campo "Faixa de investimento" em US$
 * é budget do cliente, não preço de produto. `US$` está na allowlist.
 */

const SRC_DIR = join(process.cwd(), 'src');

const EXCLUDE_DIRS = new Set(['dictionaries']);
const EXCLUDE_FILE_SUFFIXES = ['no-price.test.ts'];

// Padrões proibidos em código. Case-insensitive salvo indicado.
const FORBIDDEN: { label: string; re: RegExp }[] = [
  { label: 'checkout', re: /\bcheckout\b/i },
  { label: 'finalizar compra', re: /finalizar\s+compra/i },
  { label: 'carrinho de compras', re: /carrinho\s+de\s+compras/i },
  { label: 'add to cart', re: /\badd[_\s]?to[_\s]?cart\b/i },
  { label: 'addToCart', re: /\baddToCart\b/ },
  { label: 'campo price', re: /\bprice\s*:/i },
  { label: 'campo preco/preço', re: /\bpre[çc]o\s*:/i },
  { label: 'priceCurrency', re: /\bprice[_]?currency\b/i },
  { label: 'priceRange', re: /\bprice[_]?range\b/i },
  { label: 'subtotal', re: /\bsubtotal\b/i },
  { label: 'campo total (monetário)', re: /\btotal(APagar|_a_pagar|Pagar)\b/i },
  { label: 'gateway de pagamento', re: /payment[_]?gateway|gateway[_]?de[_]?pagamento/i },
];

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) {
      if (EXCLUDE_DIRS.has(entry)) continue;
      out.push(...walk(full));
    } else if (/\.(ts|tsx|js|jsx)$/.test(entry)) {
      if (EXCLUDE_FILE_SUFFIXES.some((s) => full.endsWith(s))) continue;
      out.push(full);
    }
  }
  return out;
}

describe('guarda anti-preço', () => {
  const files = walk(SRC_DIR);

  it('encontra ao menos um arquivo para varrer', () => {
    expect(files.length).toBeGreaterThan(0);
  });

  it.each(FORBIDDEN.map((f) => [f.label, f.re] as const))(
    'nenhum arquivo de código contém "%s"',
    (_label, re) => {
      const hits: string[] = [];
      for (const file of files) {
        const content = readFileSync(file, 'utf8');
        content.split('\n').forEach((line, i) => {
          if (re.test(line)) hits.push(`${relative(process.cwd(), file)}:${i + 1}  ${line.trim()}`);
        });
      }
      expect(hits).toEqual([]);
    },
  );
});
