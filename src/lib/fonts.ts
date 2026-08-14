import { Archivo, Public_Sans, IBM_Plex_Mono } from 'next/font/google';

/**
 * Fontes do layout (docs/tokens).
 * Archivo é variável e usa o eixo de largura `wdth` — incluído explicitamente
 * para que o subset preserve o eixo (senão o display quebra, conforme tokens.md).
 */
export const fonteDisplay = Archivo({
  subsets: ['latin'],
  axes: ['wdth'],
  display: 'swap',
  variable: '--fonte-display',
});

export const fonteCorpo = Public_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  display: 'swap',
  variable: '--fonte-corpo',
});

export const fonteMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  display: 'swap',
  variable: '--fonte-mono',
});

export const fontVariables = `${fonteDisplay.variable} ${fonteCorpo.variable} ${fonteMono.variable}`;
