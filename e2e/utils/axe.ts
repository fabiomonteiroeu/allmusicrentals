import type { Page } from '@playwright/test';

/**
 * Injeção do axe-core sem dependência nova (T-05-35): `axe-core@4.13.0` já está na árvore como
 * transitiva de `jest-axe` (`node_modules/axe-core/axe.min.js`). `require.resolve` localiza o
 * arquivo físico independentemente de como o npm elevou a árvore — não depende de layout de
 * `node_modules` nem do pacote `@axe-core/playwright`, que **não é** instalado aqui.
 *
 * Se esta injeção parar de funcionar num ambiente futuro, o caminho correto é escalar para o
 * usuário (nova tabela de auditoria de legitimidade em `05-RESEARCH.md`), nunca instalar um
 * pacote de substituição por conta própria.
 */

export interface NoResultadoAxe {
  id: string;
  impact: string | null | undefined;
  description: string;
  nodes: { target: string[]; html: string }[];
}

export interface ResultadoAxe {
  violations: NoResultadoAxe[];
}

/** Injeta o axe-core na página sob teste e devolve só as violações (resultTypes filtrado). */
export async function rodarAxe(page: Page): Promise<ResultadoAxe> {
  await page.addScriptTag({ path: require.resolve('axe-core/axe.min.js') });
  const resultado = await page.evaluate(async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const axe = (window as any).axe;
    return axe.run(document, { resultTypes: ['violations'] });
  });
  return resultado as ResultadoAxe;
}

/** Formata violações para saída de teste legível: id, impact e seletor de cada nó. */
export function formatarViolacoes(violacoes: NoResultadoAxe[]): string {
  return violacoes
    .map((v) => {
      const seletores = v.nodes.map((n) => n.target.join(' ')).join(' | ');
      return `[${v.impact ?? 'desconhecido'}] ${v.id}: ${v.description} — seletores: ${seletores}`;
    })
    .join('\n');
}

/** Só `serious`/`critical` reprovam a suíte — `moderate`/`minor` são registrados no SUMMARY. */
export function filtrarPorImpactoBloqueante(violacoes: NoResultadoAxe[]): NoResultadoAxe[] {
  return violacoes.filter((v) => v.impact === 'serious' || v.impact === 'critical');
}
