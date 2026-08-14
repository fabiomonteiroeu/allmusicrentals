import type { ReactNode } from 'react';

/**
 * Layout raiz mínimo. O <html>/<body> com o `lang` correto vive em [locale]/layout.tsx,
 * porque o locale só é conhecido dentro do segmento dinâmico.
 */
export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}
