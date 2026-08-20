import { axe } from 'jest-axe';
import userEvent from '@testing-library/user-event';
import { renderComProviders, screen } from '@/test-utils';
import { ToolbarDoCatalogo } from './ToolbarDoCatalogo';
import type { FiltroCatalogo } from '@/lib/catalogo/filtros';

const mockPush = jest.fn();
let mockSearchParams = new URLSearchParams();

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  useSearchParams: () => mockSearchParams,
}));

function filtroVazio(overrides: Partial<FiltroCatalogo> = {}): FiltroCatalogo {
  return {
    q: null,
    categorias: [],
    tiposDeItem: [],
    cores: [],
    tiposDeEvento: [],
    ambientes: [],
    ordenar: null,
    ...overrides,
  };
}

describe('ToolbarDoCatalogo', () => {
  beforeEach(() => {
    mockPush.mockClear();
    mockSearchParams = new URLSearchParams();
  });

  it('as 5 opções de ordenação aparecem com os rótulos literais', () => {
    renderComProviders(<ToolbarDoCatalogo total={0} filtro={filtroVazio()} />);

    expect(screen.getByRole('option', { name: 'Produtos em destaque' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Mais solicitados' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Mais recentes' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Nome de A a Z' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Nome de Z a A' })).toBeInTheDocument();
  });

  it('mostra "1 PRODUTO" para total 1', () => {
    renderComProviders(<ToolbarDoCatalogo total={1} filtro={filtroVazio()} />);
    expect(screen.getByText('1 PRODUTO')).toBeInTheDocument();
  });

  it('mostra "10 PRODUTOS" para total 10', () => {
    renderComProviders(<ToolbarDoCatalogo total={10} filtro={filtroVazio()} />);
    expect(screen.getByText('10 PRODUTOS')).toBeInTheDocument();
  });

  it('o badge mostra o número de filtros ativos', () => {
    renderComProviders(
      <ToolbarDoCatalogo
        total={4}
        filtro={filtroVazio({ categorias: ['moveis'], cores: ['Bege', 'Preto'] })}
      />,
    );

    expect(screen.getByRole('button', { name: 'Filtros, 3 ativos' })).toBeInTheDocument();
  });

  it('clicar em FILTROS despacha definirDrawerFiltros(true)', async () => {
    const { store } = renderComProviders(<ToolbarDoCatalogo total={0} filtro={filtroVazio()} />);

    await userEvent.click(screen.getByRole('button', { name: /filtros/i }));

    expect(store.getState().ui.drawerFiltrosAberto).toBe(true);
  });

  it('trocar a seleção chama router.push contendo ordenar=nome-desc', async () => {
    renderComProviders(<ToolbarDoCatalogo total={0} filtro={filtroVazio()} />);

    await userEvent.selectOptions(screen.getByLabelText('Ordenar por'), 'nome-desc');

    expect(mockPush).toHaveBeenCalledWith('?ordenar=nome-desc');
  });

  it('sem violações de acessibilidade', async () => {
    const { container } = renderComProviders(
      <ToolbarDoCatalogo total={3} filtro={filtroVazio({ categorias: ['moveis'] })} />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
