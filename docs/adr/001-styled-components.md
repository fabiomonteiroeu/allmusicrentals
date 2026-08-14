# ADR 001 — styled-components no App Router

**Status:** Aceito (Fase 01) · **Data:** 2026-08-13

## Contexto
A stack obrigatória inclui styled-components, que é CSS-em-runtime. No App Router isso exige:
registry com `useServerInsertedHTML`, `compiler.styledComponents` no `next.config`, e componentes
estilizados marcados como client (`"use client"`). Isso tende a empurrar código para o cliente e
conflita com as metas de Core Web Vitals (LCP < 2,5s mobile).

## Decisão
Adotar styled-components com as seguintes regras de contenção:
1. **Registry na raiz** (`src/lib/theme/StyledRegistry.tsx`) coletando estilos no servidor via
   `useServerInsertedHTML` — sem flash de conteúdo sem estilo.
2. **Busca de dados SEMPRE em Server Component.** Nenhuma página inteira vira client component.
3. **Componentes estilizados ficam nas folhas** da árvore, recebendo dados por props.
4. `compiler.styledComponents: true` (transform no SWC, com displayName para depuração).

## Consequências
- Custo aceito: um pouco de JS de runtime do styled-components no cliente e a disciplina de manter
  o `"use client"` o mais fundo possível.
- Benefício: fidelidade ao tema/tokens sem reescrever para outra tecnologia.

## Gatilho de reversão
Se **LCP mobile passar de 2,5s no p75 de campo**, reavaliamos a abordagem (candidatos:
extrair CSS crítico, migrar folhas quentes para CSS Modules/zero-runtime). Medição na Fase 14.
