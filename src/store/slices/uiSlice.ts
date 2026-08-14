import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

/**
 * Estado de UI efêmero (menu mobile, drawer de filtros, toast).
 * Conteúdo do CMS NUNCA entra no Redux — só estado de interface e o orçamento (fases 08/09).
 */
export interface UiState {
  menuMobileAberto: boolean;
  drawerFiltrosAberto: boolean;
}

const initialState: UiState = {
  menuMobileAberto: false,
  drawerFiltrosAberto: false,
};

export const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    abrirMenuMobile(state) {
      state.menuMobileAberto = true;
    },
    fecharMenuMobile(state) {
      state.menuMobileAberto = false;
    },
    alternarMenuMobile(state) {
      state.menuMobileAberto = !state.menuMobileAberto;
    },
    definirDrawerFiltros(state, action: PayloadAction<boolean>) {
      state.drawerFiltrosAberto = action.payload;
    },
  },
});

export const { abrirMenuMobile, fecharMenuMobile, alternarMenuMobile, definirDrawerFiltros } =
  uiSlice.actions;

export default uiSlice.reducer;
