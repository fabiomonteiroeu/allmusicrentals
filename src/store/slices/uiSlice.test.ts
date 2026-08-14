import reducer, {
  abrirMenuMobile,
  fecharMenuMobile,
  alternarMenuMobile,
  definirDrawerFiltros,
  type UiState,
} from './uiSlice';

const inicial: UiState = { menuMobileAberto: false, drawerFiltrosAberto: false };

describe('uiSlice', () => {
  it('abre e fecha o menu mobile', () => {
    const aberto = reducer(inicial, abrirMenuMobile());
    expect(aberto.menuMobileAberto).toBe(true);
    expect(reducer(aberto, fecharMenuMobile()).menuMobileAberto).toBe(false);
  });

  it('alterna o menu mobile', () => {
    const s1 = reducer(inicial, alternarMenuMobile());
    expect(s1.menuMobileAberto).toBe(true);
    expect(reducer(s1, alternarMenuMobile()).menuMobileAberto).toBe(false);
  });

  it('define o estado do drawer de filtros', () => {
    expect(reducer(inicial, definirDrawerFiltros(true)).drawerFiltrosAberto).toBe(true);
  });
});
