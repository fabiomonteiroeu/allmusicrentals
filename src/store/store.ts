import { configureStore } from '@reduxjs/toolkit';
import uiReducer from './slices/uiSlice';

/**
 * Cria uma store NOVA por requisição (nunca uma store global em módulo).
 * Carrinho de orçamento e rascunho do formulário entram como slices nas fases 08/09.
 */
export function makeStore() {
  return configureStore({
    reducer: {
      ui: uiReducer,
    },
  });
}

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];
