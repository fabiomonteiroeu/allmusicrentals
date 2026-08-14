/**
 * Tema base — esqueleto derivado de docs/tokens/tokens.json.
 * A Fase 02 (Design System) completa a escala tipográfica fluida e os componentes.
 * Regra: valores vêm dos tokens extraídos do layout, não são inventados.
 */
export const theme = {
  cor: {
    // Tinta / superfícies escuras
    tinta900: '#0B0C0D',
    tinta800: '#1C1E20',
    tinta750: '#2A2D2F',
    tinta700: '#3A3E40',
    tinta600: '#4A4E50',
    // Cinzas / superfícies claras
    fundo: '#F1F2F2',
    branco: '#FFFFFF',
    borda: '#C9CBCC',
    superficie200: '#DDE0E0',
    superficie150: '#E4E6E6',
    textoMid: '#5A5F61',
    textoMuted: '#6B7072',
    textoHint: '#8A8F91',
    textoMutedClaro: '#9EA3A5',
    // Marca (teal)
    teal: '#2FB6B9',
    tealLink: '#1A7F82',
    tealHover: '#166D70',
    // Erro
    erro: '#8C2A2A',
    erroBg: '#FBF0F0',
    erroBorda: '#E0C4C4',
  },
  fonte: {
    display: "var(--fonte-display), 'Archivo', sans-serif",
    corpo: "var(--fonte-corpo), 'Public Sans', system-ui, sans-serif",
    mono: "var(--fonte-mono), 'IBM Plex Mono', monospace",
  },
  peso: {
    corpo: 400,
    medio: 500,
    semibold: 600,
    display: 800,
  },
  // Escala de espaçamento (px) — base 2, ritmo em múltiplos de 4.
  espaco: {
    1: '1px',
    2: '2px',
    4: '4px',
    6: '6px',
    8: '8px',
    10: '10px',
    12: '12px',
    14: '14px',
    16: '16px',
    18: '18px',
    20: '20px',
    24: '24px',
    28: '28px',
    32: '32px',
    40: '40px',
  },
  raio: {
    base: '2px',
    circulo: '50%',
  },
  borda: {
    fina: '1px',
    grossa: '2px',
  },
  sombra: {
    // Sistema de sombra dura (sem blur).
    duraDiagonal: '6px 6px 0 rgba(11,12,13,0.35)',
    duraBaixo: '0 6px 0 rgba(11,12,13,0.35)',
    duraCima: '0 -4px 0 rgba(11,12,13,0.35)',
  },
  container: {
    principal: '1280px',
  },
  motion: {
    rapida: '.12s',
    padrao: '.18s',
    lenta: '.38s',
    easing: 'ease-out',
    easingSaida: 'cubic-bezier(.2,.7,.2,1)',
  },
  z: {
    header: 40,
    barraFixa: 45,
    drawer: 50,
    toast: 60,
    modal: 70,
  },
  // Ponto de troca desktop↔mobile reconstituído do support.js (não havia @media no layout).
  breakpoint: {
    header: '1080px',
  },
} as const;

export type Theme = typeof theme;
