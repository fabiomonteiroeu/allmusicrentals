# ADR 003 — Rota canônica de produto

**Status:** Aceito (Fase 03) · **Data:** 2026-08-17

## Contexto
`docs/00-inventario.md` registrava duas alternativas para a rota de produto — `/[locale]/produto/[slug]`
e `/[locale]/[categoria]/[slug]` — sem decisão (ver `.planning/INGEST-CONFLICTS.md`, WARNING "Rota
canônica de produto indefinida"). A escolha afeta o roteamento (Fase 7), o breadcrumb e o
`BreadcrumbList` (schema.org), a canônica e o sitemap por locale (Fase 12), e o fluxo e2e (Fase 16).
Adiar a decisão custa reescrita de rotas e redirecionamento com perda de SEO.

## Decisão
A rota canônica de produto é **`/[locale]/[categoria]/[slug]`**, pelo sinal semântico de URL — a
categoria aparece no caminho, reforçando contexto e hierarquia para buscadores e usuários.

## Consequências
Nomeadas como trabalho de fase:
- **(a) Guarda de colisão de slug (Fase 7).** Um produto com slug igual ao de uma das 5 categorias
  quebra o roteamento. A guarda roda no CI, não só em runtime.
- **(b) Redirect de mudança de categoria (Fase 7).** Se a categoria de um produto muda, a URL antiga
  precisa de um redirect 301 para a nova, porque a categoria faz parte do caminho.
- **(c) Canônica, `hreflang` e sitemap por locale (Fase 12).** Seguem o mesmo padrão de caminho
  `/[locale]/[categoria]/[slug]` nos três locales.
- **(d) Uma URL por locale.** O slug do produto é localizado no schema (`product.slug` tem
  `pluginOptions.i18n.localized: true`), então cada locale tem sua própria URL de produto.

## Gatilho de reversão
Se a taxa de colisão de slugs se mostrar operacionalmente inviável para o editor, o fallback é
`/[locale]/produto/[slug]` com 301 em massa das URLs antigas — reversível, mas com custo de SEO.
