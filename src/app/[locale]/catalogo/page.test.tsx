import { renderComProviders, screen, within } from '@/test-utils';
import { notFound } from 'next/navigation';
import {
  getCategorias,
  getTiposDeEvento,
  getCoresDisponiveis,
  getProdutos,
} from '@/lib/cms/adapters';
import CatalogoPage from './page';
import type { TipoDeEvento } from '@/lib/cms/adapters';

jest.mock('@/lib/cms/adapters');
// A busca do catálogo (`BarraDeBuscaCatalogo`) usa `useRouter`/`usePathname`/`useSearchParams`;
// `notFound` também vem de `next/navigation` e precisa continuar sendo um espião.
jest.mock('next/navigation', () => ({
  notFound: jest.fn(),
  useRouter: () => ({ push: jest.fn() }),
  usePathname: () => '/pt-BR/catalogo',
  useSearchParams: () => new URLSearchParams(),
}));

const mockGetCategorias = jest.mocked(getCategorias);
const mockGetTiposDeEvento = jest.mocked(getTiposDeEvento);
const mockGetCoresDisponiveis = jest.mocked(getCoresDisponiveis);
const mockGetProdutos = jest.mocked(getProdutos);

function construirTipoDeEvento(overrides: Partial<TipoDeEvento> = {}): TipoDeEvento {
  return {
    id: 1,
    nome: 'Casamento',
    slug: 'casamento',
    ordem: 0,
    exibirNoFiltroDoCatalogo: true,
    ...overrides,
  };
}

async function renderPagina(sp: Record<string, string | string[] | undefined> = {}) {
  const jsx = await CatalogoPage({
    params: Promise.resolve({ locale: 'pt-BR' }),
    searchParams: Promise.resolve(sp),
  });
  return renderComProviders(jsx);
}

describe('CatalogoPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetCategorias.mockResolvedValue([]);
    mockGetTiposDeEvento.mockResolvedValue([construirTipoDeEvento()]);
    mockGetCoresDisponiveis.mockResolvedValue(['Bege', 'Preto', 'Branco']);
    mockGetProdutos.mockResolvedValue([]);
  });

  it('locale inválido chama notFound', async () => {
    await CatalogoPage({
      params: Promise.resolve({ locale: 'de' }),
      searchParams: Promise.resolve({}),
    });

    expect(notFound).toHaveBeenCalled();
  });

  it('?q=mesa chega em getProdutos como busca: "mesa"', async () => {
    await renderPagina({ q: 'mesa' });

    expect(mockGetProdutos).toHaveBeenCalledWith(
      'pt-BR',
      expect.objectContaining({ busca: 'mesa' }),
    );
  });

  it('?tipo=DROP não chega em getProdutos — a allowlist barrou (nenhum argumento contém DROP)', async () => {
    await renderPagina({ tipo: 'DROP' });

    const chamada = mockGetProdutos.mock.calls[0];
    expect(chamada).toBeDefined();
    expect(JSON.stringify(chamada)).not.toContain('DROP');
  });

  it('?cor=Bege&cor=Preto chega em getProdutos como array de dois', async () => {
    await renderPagina({ cor: ['Bege', 'Preto'] });

    expect(mockGetProdutos).toHaveBeenCalledWith(
      'pt-BR',
      expect.objectContaining({ cores: ['Bege', 'Preto'] }),
    );
  });

  it('getProdutos é chamado com porPagina: 100', async () => {
    await renderPagina();

    expect(mockGetProdutos).toHaveBeenCalledWith(
      'pt-BR',
      expect.objectContaining({ porPagina: 100 }),
    );
  });

  it('getCoresDisponiveis é chamado só com o locale — não recebe o filtro corrente', async () => {
    await renderPagina({ cor: 'Bege' });

    expect(mockGetCoresDisponiveis).toHaveBeenCalledWith('pt-BR');
    expect(mockGetCoresDisponiveis.mock.calls[0]).toHaveLength(1);
  });

  it('os nomes devolvidos por getCoresDisponiveis chegam ao PainelDeFiltros do aside como swatches', async () => {
    mockGetCoresDisponiveis.mockResolvedValue(['Bege', 'Preto']);

    await renderPagina();

    // `{ hidden: true }`: a coluna do aside fica `display: none` fora de `media.desktop`
    // (D5/D7 — mobile-first, o drawer assume abaixo de 1080px em 05-06), e jsdom não avalia
    // `@media (min-width: ...)` (não implementa layout/viewport), então o elemento fica sempre
    // fora da árvore de acessibilidade neste ambiente de teste, mesmo com viewport "desktop"
    // simulado. Isso é limitação do jsdom, não bug de estrutura: a marcação em si — `<aside
    // aria-label="Filtros">`, fora de qualquer `article`/`aside`/`nav`/`section` ancestral —
    // resolve para `complementary` corretamente (confirmado isoladamente). `hidden: true` só
    // pede à Testing Library para não excluir elementos escondidos por CSS, preservando a
    // prova de que os nomes vindos de `getCoresDisponiveis` (D8) chegam ao painel.
    //
    // O marcador de texto (`<li>{nome}</li>`) que 05-04 deixou neste `aside` foi substituído
    // em 05-05 pelo `PainelDeFiltros` real: os nomes de cor agora chegam como swatches
    // (`SwatchesDeCor`), sem texto visível próprio (`aria-label`/`title` só) — por isso a
    // asserção passa a ser "existe um botão de swatch com este nome", não `toHaveTextContent`.
    const aside = screen.getByRole('complementary', { name: 'Filtros', hidden: true });
    expect(within(aside).getByRole('button', { name: 'Bege', hidden: true })).toBeInTheDocument();
    expect(within(aside).getByRole('button', { name: 'Preto', hidden: true })).toBeInTheDocument();
  });

  it('?cor=Bordô (na paleta, ausente do CMS) sobrevive ao parse e chega em getProdutos', async () => {
    // Bordô está na paleta (coresProduto) mas não é devolvido por getCoresDisponiveis aqui —
    // prova de que a allowlist de parse é a paleta inteira, não o conjunto exibido.
    mockGetCoresDisponiveis.mockResolvedValue(['Bege']);

    await renderPagina({ cor: 'Bordô' });

    expect(mockGetProdutos).toHaveBeenCalledWith(
      'pt-BR',
      expect.objectContaining({ cores: ['Bordô'] }),
    );
  });
});
