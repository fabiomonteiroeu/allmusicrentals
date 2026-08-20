import { renderComProviders } from '@/test-utils';
import { emitirEvento, type EventoDataLayer } from '@/lib/analytics/dataLayer';
import { EmissorSearch } from './EmissorSearch';
import { EmissorFiltroAplicado } from './EmissorFiltroAplicado';
import type { FiltroCatalogo } from '@/lib/catalogo/filtros';

jest.mock('@/lib/analytics/dataLayer');

const emitir = jest.mocked(emitirEvento);

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

function chamadasComo<E extends EventoDataLayer['event']>(
  evento: E,
): Extract<EventoDataLayer, { event: E }>[] {
  return emitir.mock.calls
    .map((c) => c[0])
    .filter((e): e is Extract<EventoDataLayer, { event: E }> => e.event === evento);
}

describe('EmissorSearch', () => {
  beforeEach(() => {
    emitir.mockClear();
  });

  it('termo vazio não emite', () => {
    renderComProviders(<EmissorSearch termo="" />);
    expect(emitir).not.toHaveBeenCalled();
  });

  it('termo emite uma vez; re-renderizar com o mesmo termo não emite de novo; termo diferente emite de novo', () => {
    const { rerender } = renderComProviders(<EmissorSearch termo="mesa" />);
    expect(emitir).toHaveBeenCalledTimes(1);
    expect(chamadasComo('search')[0]).toMatchObject({ event: 'search', search_term: 'mesa' });

    rerender(<EmissorSearch termo="mesa" />);
    expect(emitir).toHaveBeenCalledTimes(1);

    rerender(<EmissorSearch termo="painel de led" />);
    expect(emitir).toHaveBeenCalledTimes(2);
    expect(chamadasComo('search')[1]).toMatchObject({
      event: 'search',
      search_term: 'painel de led',
    });
  });

  it('nenhum evento emitido contém chave de valor monetário', () => {
    renderComProviders(<EmissorSearch termo="mesa" />);
    const evento = emitir.mock.calls[0]?.[0] as unknown as Record<string, unknown>;
    expect(evento).not.toHaveProperty('value');
    expect(evento).not.toHaveProperty('price');
    expect(evento).not.toHaveProperty('currency');
    expect(evento).not.toHaveProperty('revenue');
  });
});

describe('EmissorFiltroAplicado', () => {
  beforeEach(() => {
    emitir.mockClear();
  });

  it('primeira montagem não emite, mesmo com filtro já preenchido (chegada por URL compartilhada)', () => {
    renderComProviders(<EmissorFiltroAplicado filtro={filtroVazio({ categorias: ['moveis'] })} />);
    expect(emitir).not.toHaveBeenCalled();
  });

  it('acrescentar um valor emite um filter_applied com filter_type e filter_value corretos', () => {
    const { rerender } = renderComProviders(<EmissorFiltroAplicado filtro={filtroVazio()} />);
    expect(emitir).not.toHaveBeenCalled();

    rerender(<EmissorFiltroAplicado filtro={filtroVazio({ cores: ['Bege'] })} />);

    expect(emitir).toHaveBeenCalledTimes(1);
    expect(chamadasComo('filter_applied')[0]).toEqual({
      event: 'filter_applied',
      filter_type: 'cor',
      filter_value: 'Bege',
    });
  });

  it('acrescentar dois valores de uma vez emite dois eventos', () => {
    const { rerender } = renderComProviders(<EmissorFiltroAplicado filtro={filtroVazio()} />);

    rerender(
      <EmissorFiltroAplicado filtro={filtroVazio({ categorias: ['moveis'], cores: ['Bege'] })} />,
    );

    expect(emitir).toHaveBeenCalledTimes(2);
    const emitidos = chamadasComo('filter_applied');
    expect(emitidos).toEqual(
      expect.arrayContaining([
        { event: 'filter_applied', filter_type: 'categoria', filter_value: 'moveis' },
        { event: 'filter_applied', filter_type: 'cor', filter_value: 'Bege' },
      ]),
    );
  });

  it('remover um valor não emite nada', () => {
    const { rerender } = renderComProviders(
      <EmissorFiltroAplicado filtro={filtroVazio({ cores: ['Bege', 'Preto'] })} />,
    );
    expect(emitir).not.toHaveBeenCalled();

    rerender(<EmissorFiltroAplicado filtro={filtroVazio({ cores: ['Bege'] })} />);

    expect(emitir).not.toHaveBeenCalled();
  });

  it('nenhum evento emitido contém chave de valor monetário', () => {
    const { rerender } = renderComProviders(<EmissorFiltroAplicado filtro={filtroVazio()} />);
    rerender(<EmissorFiltroAplicado filtro={filtroVazio({ ambientes: ['interno'] })} />);

    const evento = emitir.mock.calls[0]?.[0] as unknown as Record<string, unknown>;
    expect(evento).not.toHaveProperty('value');
    expect(evento).not.toHaveProperty('price');
    expect(evento).not.toHaveProperty('currency');
    expect(evento).not.toHaveProperty('revenue');
  });
});
