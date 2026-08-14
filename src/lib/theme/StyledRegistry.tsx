'use client';

import { useState, type ReactNode } from 'react';
import { useServerInsertedHTML } from 'next/navigation';
import { ServerStyleSheet, StyleSheetManager, ThemeProvider } from 'styled-components';
import { theme } from './theme';
import { GlobalStyle } from './GlobalStyle';

/**
 * Registry SSR do styled-components para o App Router.
 * - Coleta as regras no servidor e as injeta via useServerInsertedHTML (sem flash sem estilo).
 * - Fornece o ThemeProvider global.
 * Decisão e gatilho de reversão em docs/adr/001-styled-components.md.
 */
export function StyledRegistry({ children }: { children: ReactNode }) {
  const [styledSheet] = useState(() => new ServerStyleSheet());

  useServerInsertedHTML(() => {
    const styles = styledSheet.getStyleElement();
    styledSheet.instance.clearTag();
    return <>{styles}</>;
  });

  // No cliente, deixa o styled-components gerenciar as tags normalmente.
  if (typeof window !== 'undefined') {
    return (
      <ThemeProvider theme={theme}>
        <GlobalStyle />
        {children}
      </ThemeProvider>
    );
  }

  return (
    <StyleSheetManager sheet={styledSheet.instance}>
      <ThemeProvider theme={theme}>
        <GlobalStyle />
        {children}
      </ThemeProvider>
    </StyleSheetManager>
  );
}
