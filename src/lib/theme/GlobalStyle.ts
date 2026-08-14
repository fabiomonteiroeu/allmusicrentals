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

  /* Keyframes do layout (bloco <style> dos exports /projeto-base). */
  @keyframes amrFade {
    from { opacity: 0; transform: translateY(6px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes amrToast {
    from { opacity: 0; transform: translateY(12px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes amrSpin {
    to { transform: rotate(360deg); }
  }
  @keyframes amrPulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.45; }
  }
  @keyframes amrDrawer {
    from { transform: translateY(100%); }
    to { transform: translateY(0); }
  }
  @keyframes amrErro {
    0%, 100% { transform: translateX(0); }
    20% { transform: translateX(-4px); }
    40% { transform: translateX(4px); }
    60% { transform: translateX(-3px); }
    80% { transform: translateX(3px); }
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
