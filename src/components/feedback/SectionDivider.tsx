'use client';

import styled from 'styled-components';

/**
 * Divisor de seção tracejado (do layout): traço de 22px + vão de 2px (ciclo 24px).
 * Variante escura (#2A2D2F, sobre fundo escuro/rodapé) e clara (#C9CBCC, sobre fundo claro).
 */
export const SectionDivider = styled.div.attrs({ 'aria-hidden': true })<{ $claro?: boolean }>`
  height: 2px;
  background: ${({ theme, $claro }) =>
    `repeating-linear-gradient(90deg, ${
      $claro ? theme.cor.borda : theme.cor.tinta750
    } 0 22px, transparent 22px 24px)`};
`;
