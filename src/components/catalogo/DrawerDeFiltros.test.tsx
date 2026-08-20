import { act } from 'react';
import { axe } from 'jest-axe';
import userEvent from '@testing-library/user-event';
import { renderComProviders, screen } from '@/test-utils';
import { DrawerDeFiltros } from './DrawerDeFiltros';
import { definirDrawerFiltros } from '@/store/slices/uiSlice';
import type { OpcoesDinamicasDeFiltro } from './PainelDeFiltros';

const mockPush = jest.fn();
let mockSearchParams = new URLSearchParams();

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  useSearchParams: () => mockSearchParams,
}));

const gruposFixture: OpcoesDinamicasDeFiltro = {
  categoria: [{ valor: 'moveis', rotulo: 'Móveis' }],
  evento: [{ valor: 'casamento', rotulo: 'Casamento' }],
  cor: ['Bege', 'Preto', 'Branco'],
};

function renderDrawerAberto(total = 0, sp = '') {
  mockSearchParams = new URLSearchParams(sp);
  const utils = renderComProviders(<DrawerDeFiltros grupos={gruposFixture} total={total} />);
  act(() => {
    utils.store.dispatch(definirDrawerFiltros(true));
  });
  return utils;
}

describe('DrawerDeFiltros', () => {
  beforeEach(() => {
    mockPush.mockClear();
    mockSearchParams = new URLSearchParams();
  });

  it('com drawerFiltrosAberto: false o conteúdo não está no documento', () => {
    mockSearchParams = new URLSearchParams();
    renderComProviders(<DrawerDeFiltros grupos={gruposFixture} total={0} />);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('com drawerFiltrosAberto: true o diálogo aparece com nome acessível "Filtros"', () => {
    renderDrawerAberto();

    expect(screen.getByRole('dialog', { name: 'Filtros' })).toBeInTheDocument();
  });

  it('Escape despacha definirDrawerFiltros(false)', async () => {
    const { store } = renderDrawerAberto();

    await userEvent.keyboard('{Escape}');

    expect(store.getState().ui.drawerFiltrosAberto).toBe(false);
  });

  it('clicar no CTA de aplicar despacha definirDrawerFiltros(false)', async () => {
    const { store } = renderDrawerAberto(5);

    await userEvent.click(screen.getByRole('button', { name: 'VER 5 PRODUTOS' }));

    expect(store.getState().ui.drawerFiltrosAberto).toBe(false);
  });

  it('o CTA mostra "VER 1 PRODUTO" para total 1', () => {
    renderDrawerAberto(1);

    expect(screen.getByRole('button', { name: 'VER 1 PRODUTO' })).toBeInTheDocument();
  });

  it('o CTA mostra "VER 10 PRODUTOS" para total 10', () => {
    renderDrawerAberto(10);

    expect(screen.getByRole('button', { name: 'VER 10 PRODUTOS' })).toBeInTheDocument();
  });

  it('LIMPAR chama router.push sem nenhuma chave de filtro e com q preservado', async () => {
    renderDrawerAberto(3, 'q=mesa&cor=Bege&tipo=pacote');

    await userEvent.click(screen.getByRole('button', { name: 'LIMPAR' }));

    const chamada = mockPush.mock.calls[0]?.[0] as string;
    const params = new URLSearchParams(chamada.replace(/^\?/, ''));
    expect(params.get('q')).toBe('mesa');
    expect(params.getAll('cor')).toEqual([]);
    expect(params.getAll('tipo')).toEqual([]);
  });

  it('clicar no botão de fechar do cabeçalho despacha definirDrawerFiltros(false)', async () => {
    const { store } = renderDrawerAberto();

    await userEvent.click(screen.getByRole('button', { name: 'Fechar' }));

    expect(store.getState().ui.drawerFiltrosAberto).toBe(false);
  });

  it('sem violações de acessibilidade', async () => {
    const { baseElement } = renderDrawerAberto();
    expect(await axe(baseElement)).toHaveNoViolations();
  });
});
