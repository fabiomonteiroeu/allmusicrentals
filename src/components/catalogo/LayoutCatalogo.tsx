'use client';

import styled from 'styled-components';
import { media } from '@/lib/theme/media';
import type { ReactNode } from 'react';

/**
 * Bloco 3 do UI-SPEC — shell de duas colunas do catálogo. D5: `layoutCols` do layout-fonte
 * (`mobile ? '1fr' : '272px minmax(0,1fr)'`, calculado por JS de viewport) vira grid fixo em
 * CSS dentro de `media.desktop` (D7 — único breakpoint aprovado do projeto, 1080px,
 * `theme.breakpoint.header`). Abaixo de 1080px, uma coluna só e a coluna do `aside` fica
 * escondida, porque nessa faixa os filtros são servidos pelo drawer mobile (05-06) — nenhuma
 * media query nova foi criada.
 *
 * Recebe `aside` e `children` como nós prontos (o chamador decide a semântica interna de cada
 * um, ex.: `<aside aria-label="Filtros">`) — este componente só resolve a grade e a
 * visibilidade por breakpoint, para que os planos 05-05/05-06/05-07 preencham cada lado sem
 * reescrever este arquivo.
 */

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: clamp(24px, 3vw, 40px);
  align-items: start;

  ${media.desktop} {
    grid-template-columns: 272px minmax(0, 1fr);
  }
`;

const ColunaAside = styled.div`
  display: none;

  ${media.desktop} {
    display: block;
    position: sticky;
    top: 96px;
  }
`;

export interface LayoutCatalogoProps {
  aside: ReactNode;
  children: ReactNode;
}

export function LayoutCatalogo({ aside, children }: LayoutCatalogoProps) {
  return (
    <Grid>
      <ColunaAside>{aside}</ColunaAside>
      <div>{children}</div>
    </Grid>
  );
}
