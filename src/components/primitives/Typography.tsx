'use client';

import styled, { css } from 'styled-components';

/**
 * Primitivos tipográficos do design system (Fase 02).
 * Três vozes do layout: display (Archivo wdth 75, caixa-alta), corpo (Public Sans), mono (IBM Plex).
 */

/** Níveis de título mapeiam para os tamanhos fluidos do tema. */
type NivelDisplay = 'displayHero' | 'display' | 'h1' | 'h2' | 'h3' | 'h4';

/** Título em Archivo condensada (wdth 75), caixa-alta, tracking negativo. */
export const Heading = styled.h2<{ $nivel?: NivelDisplay }>`
  margin: 0;
  font-family: ${({ theme }) => theme.fonte.display};
  font-weight: ${({ theme }) => theme.peso.display};
  font-variation-settings: 'wdth' 75;
  text-transform: uppercase;
  letter-spacing: ${({ theme }) => theme.tracking.apertado};
  line-height: ${({ theme }) => theme.leading.display};
  color: ${({ theme }) => theme.cor.tinta900};
  font-size: ${({ theme, $nivel = 'h2' }) => theme.fluido[$nivel]};
`;

/** Rótulo/eyebrow em mono, caixa-alta, tracking forte. */
export const Eyebrow = styled.p`
  margin: 0;
  font-family: ${({ theme }) => theme.fonte.mono};
  font-weight: ${({ theme }) => theme.peso.medio};
  text-transform: uppercase;
  letter-spacing: ${({ theme }) => theme.tracking.rotuloForte};
  font-size: ${({ theme }) => theme.tamanho[13]};
  color: ${({ theme }) => theme.cor.tealLink};
`;

const corpoBase = css`
  margin: 0;
  font-family: ${({ theme }) => theme.fonte.corpo};
  line-height: ${({ theme }) => theme.leading.corpo};
  color: ${({ theme }) => theme.cor.tinta900};
`;

/** Texto corrido. `$mid` usa o cinza de texto secundário. */
export const Body = styled.p<{ $mid?: boolean }>`
  ${corpoBase};
  font-size: ${({ theme }) => theme.tamanho[16]};
  color: ${({ theme, $mid }) => ($mid ? theme.cor.textoMid : theme.cor.tinta900)};
`;

/** Texto mono para códigos, specs e micro-rótulos. */
export const Mono = styled.span`
  font-family: ${({ theme }) => theme.fonte.mono};
  font-size: ${({ theme }) => theme.tamanho[13]};
  letter-spacing: ${({ theme }) => theme.tracking.rotulo};
  color: ${({ theme }) => theme.cor.textoMuted};
`;
