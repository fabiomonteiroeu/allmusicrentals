'use client';

import { createGlobalStyle } from 'styled-components';

/**
 * Estilos globais base — traduzidos do reset inline dos HTMLs de /projeto-base.
 * Keyframes do layout (amrFade/amrToast/amrErro/amrSpin/amrPulso/amrDrawer) entram na Fase 02.
 * `prefers-reduced-motion` (ausente no layout) já fica previsto aqui.
 */
export const GlobalStyle = createGlobalStyle`
  *, *::before, *::after {
    box-sizing: border-box;
  }

  html, body {
    margin: 0;
    padding: 0;
    background: ${({ theme }) => theme.cor.fundo};
    color: ${({ theme }) => theme.cor.tinta900};
    font-family: ${({ theme }) => theme.fonte.corpo};
    -webkit-font-smoothing: antialiased;
  }

  a {
    color: ${({ theme }) => theme.cor.tealLink};
    text-decoration: none;
  }
  a:hover {
    color: ${({ theme }) => theme.cor.tinta900};
  }

  input, select, button, textarea {
    font-family: inherit;
  }

  :focus-visible {
    outline: 2px solid ${({ theme }) => theme.cor.teal};
    outline-offset: 2px;
  }

  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
      scroll-behavior: auto !important;
    }
  }
`;
