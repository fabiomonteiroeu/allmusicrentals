import { theme } from './theme';

/**
 * Helpers de media query para a troca de chrome desktop↔mobile (ver docs/divergencias.md D1).
 * Mesmo ponto de troca do layout (1080px), mas em CSS — sem JS de viewport, sem CLS.
 */
const px = parseInt(theme.breakpoint.header, 10);

export const media = {
  /** Estilos aplicados no mobile (abaixo do breakpoint do header). */
  mobile: `@media (max-width: ${px - 0.02}px)`,
  /** Estilos aplicados no desktop (a partir do breakpoint do header). */
  desktop: `@media (min-width: ${px}px)`,
};
