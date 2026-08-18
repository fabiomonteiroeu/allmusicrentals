'use client';

import styled from 'styled-components';

/**
 * E4 — spinner do botão de busca (SearchBarGrande, plano 04-04), exibido durante `searchBusy`.
 * Consome `amrSpin`, keyframe já existente em GlobalStyle.ts — não redeclarar.
 */
export const Spinner = styled.span.attrs({ 'aria-hidden': true })`
  display: inline-block;
  width: 13px;
  height: 13px;
  border-radius: ${({ theme }) => theme.raio.circulo};
  border: 2px solid rgba(241, 242, 242, 0.35);
  border-top-color: ${({ theme }) => theme.cor.teal};
  animation: amrSpin 0.7s linear infinite;
`;
