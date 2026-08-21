import type { MetadataRoute } from 'next';

/**
 * Beta pública de prazo apertado (Fase 17, desvio de ordem de execução registrado em
 * `.planning/ROADMAP.md` em 2026-08-20): bloqueia a indexação do site inteiro enquanto só
 * Home e Catálogo estão publicados, sem SEO/metadata (Fase 12 — ainda não executada), sem
 * carrinho nem formulário de orçamento (Fases 8-9 — o core value do produto).
 *
 * Reabrir a indexação por rota é entrega da Fase 12, não deste plano. Até lá, TODO o site fica
 * fora do índice — não só as rotas que ainda não existem.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      disallow: '/',
    },
  };
}
