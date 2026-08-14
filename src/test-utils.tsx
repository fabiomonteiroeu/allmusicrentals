import type { ReactElement, ReactNode } from 'react';
import { render, type RenderOptions } from '@testing-library/react';
import { Provider } from 'react-redux';
import { ThemeProvider } from 'styled-components';
import { theme } from '@/lib/theme/theme';
import { makeStore } from '@/store/store';

/**
 * Render de teste com os providers da aplicação (tema styled-components + store Redux nova).
 * Cada chamada cria uma store isolada.
 */
export function renderComProviders(ui: ReactElement, options?: RenderOptions) {
  const store = makeStore();
  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <Provider store={store}>
        <ThemeProvider theme={theme}>{children}</ThemeProvider>
      </Provider>
    );
  }
  return { store, ...render(ui, { wrapper: Wrapper, ...options }) };
}

export * from '@testing-library/react';
