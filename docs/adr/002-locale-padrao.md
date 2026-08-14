# ADR 002 — pt-BR como locale padrão

**Status:** Aceito (Fase 01) · **Data:** 2026-08-13

## Contexto
O negócio atende a Flórida, onde a busca orgânica relevante é majoritariamente em inglês.
Ainda assim, o cliente confirmou **pt-BR como locale padrão**. Isso coloca a raiz do site e parte
do peso de SEO no idioma que não é o da busca local.

## Decisão
- Implementar **pt-BR como padrão** (`defaultLocale`), com `en` e `es` como locales adicionais.
- Roteamento por prefixo de caminho (`/pt-BR`, `/en`, `/es`) via middleware, com negociação por
  `Accept-Language` na entrada sem prefixo.
- **Mitigar o custo de SEO em inglês** (Fase 12): `hreflang` para os três locales + `x-default`,
  canônica por locale, sitemap por locale. Assim o inglês não é sacrificado.

## Consequências
- É uma decisão de **aquisição de cliente**, não técnica. Registrada para revisão futura.
- Se os dados de busca mostrarem perda relevante em inglês, reconsiderar `x-default`/estratégia de
  raiz é reversível sem reescrever a base (só configuração de i18n/SEO).
