# Divergências técnicas de implementação

> Registradas **antes de implementar**, conforme a regra do plano: "Se você precisar divergir do HTML
> original por razão técnica, registre aqui com o motivo, antes de implementar."
> (Divergências de conteúdo/design da Fase 00 ficam em `docs/00-divergencias.md`.)

## D1 — Troca desktop↔mobile do chrome: media query em vez de `window.innerWidth`

**Fase:** 02 · **Data:** 2026-08-14

**No layout:** o header/topbar/menu trocam entre desktop e mobile lendo `window.innerWidth < 1080`
em estado React (`this.state.mobile`), injetando `display: flex|none` no `render()`. Não há `@media`.

**Divergência:** implemento a troca com **media query CSS no mesmo breakpoint (1080px)** via
styled-components, em vez de estado JS de viewport.

**Motivo (técnico):**
1. Ler `window.innerWidth` no cliente causa **mismatch de hidratação** (o servidor não conhece a
   largura) e um **flash** + **CLS** na primeira pintura — viola diretamente as metas de Core Web
   Vitals (LCP/CLS) do projeto.
2. Media query resolve no CSS, sem JS, sem shift, e mantém o **mesmo ponto de troca (1080px)** —
   o resultado visual é idêntico ao layout.

**Escopo:** apenas a *visibilidade* desktop/mobile do chrome. Toda a escala fluida (clamp) e os grids
`auto-fit` seguem exatamente como no layout. O breakpoint fica em `theme.breakpoint.header` (1080px).

**Reversível:** trocar a media query por container query ou por estado é local ao componente `Header`.
