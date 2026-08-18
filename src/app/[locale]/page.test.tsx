import { renderComProviders, screen } from '@/test-utils';
import { notFound } from 'next/navigation';
import { getPagina, getCategorias, getProdutos, getAvaliacoes } from '@/lib/cms/adapters';
import HomePage from './page';
import type { Pagina, Bloco } from '@/lib/cms/adapters';

jest.mock('@/lib/cms/adapters');
jest.mock('@/lib/analytics/dataLayer');
// O bloco de busca monta `SearchBarGrande`, que usa `useRouter()`; `notFound` também vem de
// `next/navigation` e precisa continuar sendo um espião — mesmo padrão de mock combinado.
jest.mock('next/navigation', () => ({
  notFound: jest.fn(),
  useRouter: () => ({ push: jest.fn() }),
}));

const mockGetPagina = jest.mocked(getPagina);
const mockGetCategorias = jest.mocked(getCategorias);
const mockGetProdutos = jest.mocked(getProdutos);
const mockGetAvaliacoes = jest.mocked(getAvaliacoes);

function construirPagina(blocos: Bloco[]): Pagina {
  return { id: 1, slug: 'home', titulo: 'Home', seo: null, blocos };
}

describe('HomePage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetCategorias.mockResolvedValue([]);
    mockGetProdutos.mockResolvedValue([]);
    mockGetAvaliacoes.mockResolvedValue([]);
  });

  it('getPagina com 2 blocos: os 2 blocos renderizam e categorias/produtos/avaliações foram buscados', async () => {
    mockGetPagina.mockResolvedValue(
      construirPagina([
        { __component: 'blocos.hero', titulo: 'HERO-TXT', imagem: null },
        { __component: 'blocos.chamada-final', titulo: 'CTA-TXT' },
      ]),
    );

    const jsx = await HomePage({ params: Promise.resolve({ locale: 'pt-BR' }) });
    renderComProviders(jsx);

    expect(screen.getByText('HERO-TXT')).toBeInTheDocument();
    expect(screen.getByText('CTA-TXT')).toBeInTheDocument();
    expect(mockGetCategorias).toHaveBeenCalledWith('pt-BR');
    expect(mockGetProdutos).toHaveBeenCalledWith('pt-BR', { destaque: true });
    expect(mockGetAvaliacoes).toHaveBeenCalled();
  });

  it('getPagina null: mostra CONTEÚDO INDISPONÍVEL e não busca categorias/produtos/avaliações', async () => {
    mockGetPagina.mockResolvedValue(null);

    const jsx = await HomePage({ params: Promise.resolve({ locale: 'pt-BR' }) });
    renderComProviders(jsx);

    expect(screen.getByText('CONTEÚDO INDISPONÍVEL')).toBeInTheDocument();
    expect(
      screen.getByText(/Não foi possível carregar o conteúdo da página no momento/),
    ).toBeInTheDocument();
    expect(mockGetCategorias).not.toHaveBeenCalled();
    expect(mockGetProdutos).not.toHaveBeenCalled();
    expect(mockGetAvaliacoes).not.toHaveBeenCalled();
  });

  it('locale inválido chama notFound', async () => {
    mockGetPagina.mockResolvedValue(null);

    await HomePage({ params: Promise.resolve({ locale: 'de' }) });

    expect(notFound).toHaveBeenCalled();
  });
});
