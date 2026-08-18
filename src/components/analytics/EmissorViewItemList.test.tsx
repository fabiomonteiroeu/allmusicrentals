import { renderComProviders } from '@/test-utils';
import { emitirEvento } from '@/lib/analytics/dataLayer';
import { EmissorViewItemList } from './EmissorViewItemList';

jest.mock('@/lib/analytics/dataLayer');

const emitir = jest.mocked(emitirEvento);

describe('EmissorViewItemList', () => {
  beforeEach(() => {
    emitir.mockClear();
  });

  it('emite view_item_list uma vez ao montar, com os itens recebidos', () => {
    const itens = [
      { item_id: '1', item_name: 'Estrutura Q30' },
      { item_id: '2', item_name: 'Painel P1.9' },
    ];

    renderComProviders(
      <EmissorViewItemList listaId="destaques" listaNome="Produtos em destaque" itens={itens} />,
    );

    expect(emitir).toHaveBeenCalledTimes(1);
    expect(emitir).toHaveBeenCalledWith({
      event: 'view_item_list',
      item_list_id: 'destaques',
      item_list_name: 'Produtos em destaque',
      items: itens,
    });
    expect(emitir.mock.calls[0]?.[0]?.items).toHaveLength(2);
  });

  it('não reemite o evento em re-renders (trava do useRef)', () => {
    const itens = [{ item_id: '1', item_name: 'Estrutura Q30' }];

    const { rerender } = renderComProviders(
      <EmissorViewItemList listaId="destaques" listaNome="Produtos em destaque" itens={itens} />,
    );

    rerender(
      <EmissorViewItemList
        listaId="destaques"
        listaNome="Produtos em destaque"
        itens={[...itens]}
      />,
    );

    expect(emitir).toHaveBeenCalledTimes(1);
  });

  it('não produz nenhum nó no DOM', () => {
    const { container } = renderComProviders(
      <EmissorViewItemList listaId="destaques" listaNome="Produtos em destaque" itens={[]} />,
    );

    expect(container).toBeEmptyDOMElement();
  });
});
