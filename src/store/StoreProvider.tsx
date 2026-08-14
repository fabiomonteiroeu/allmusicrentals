'use client';

import { useState, type ReactNode } from 'react';
import { Provider } from 'react-redux';
import { makeStore } from './store';

/**
 * Provider client que instancia a store uma vez por árvore no cliente.
 * `useState` com inicializador preguiçoso cria a store por requisição, sem vazar
 * entre requisições no servidor e sem recriá-la a cada render.
 */
export function StoreProvider({ children }: { children: ReactNode }) {
  const [store] = useState(makeStore);
  return <Provider store={store}>{children}</Provider>;
}
