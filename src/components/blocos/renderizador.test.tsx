import { renderComProviders, screen } from '@/test-utils';
import { emitirEvento } from '@/lib/analytics/dataLayer';
import { RenderizadorDeBlocos } from './renderizador';
import type { Bloco, Categoria, Produto, Avaliacao } from '@/lib/cms/adapters';

jest.mock('@/lib/analytics/dataLayer');
// O bloco de busca monta `SearchBarGrande`, que usa `useRouter()` — o renderizador não
// tem fronteira de app router própria em teste isolado; mockar como em SearchBarGrande.test.tsx.
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

const categorias: Categoria[] = [];
const produtosDestaque: Produto[] = [];
const avaliacoes: Avaliacao[] = [];

/** Um exemplar mínimo válido de cada um dos 9 `__component` da Home, na ordem do layout. */
const nove: Bloco[] = [
  { __component: 'blocos.hero', titulo: 'HERO-TXT' },
  { __component: 'blocos.busca', titulo: 'BUSCA-TXT' },
  { __component: 'blocos.grade-de-categorias', titulo: 'GRADE-TXT' },
  { __component: 'blocos.produtos-em-destaque', titulo: 'DESTAQUE-TXT' },
  { __component: 'blocos.destaque-led', titulo: 'LED-TXT' },
  { __component: 'blocos.como-funciona', titulo: 'COMOFUNCIONA-TXT' },
  { __component: 'blocos.diferenciais', titulo: 'DIFERENCIAIS-TXT' },
  { __component: 'blocos.avaliacoes', titulo: 'AVALIACOES-TXT' },
  { __component: 'blocos.chamada-final', titulo: 'CHAMADAFINAL-TXT' },
];

function renderizar(blocos: Bloco[]) {
  return renderComProviders(
    <RenderizadorDeBlocos
      blocos={blocos}
      locale="pt-BR"
      categorias={categorias}
      produtosDestaque={produtosDestaque}
      avaliacoes={avaliacoes}
    />,
  );
}

describe('RenderizadorDeBlocos', () => {
  beforeEach(() => {
    jest.mocked(emitirEvento).mockClear();
  });

  it('renderiza os 9 blocos, um <section> por bloco, na mesma ordem do array', () => {
    const { container } = renderizar(nove);

    const secoes = container.querySelectorAll('section');
    expect(secoes).toHaveLength(9);

    // Ordem: o título de cada bloco aparece dentro da <section> na mesma posição do array.
    const titulosEsperados = nove.map((b) => b.titulo);
    const posicoes = titulosEsperados.map((titulo) => {
      const el = screen.getByText(titulo as string);
      let idx = -1;
      secoes.forEach((secao, i) => {
        if (secao.contains(el)) idx = i;
      });
      return idx;
    });
    expect(posicoes).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8]);
  });

  it('bloco de tipo não-Home (blocos.texto-rico) não renderiza nada e os demais continuam presentes', () => {
    const comTextoRico: Bloco[] = [
      nove[0] as Bloco,
      { __component: 'blocos.texto-rico', conteudo: 'x', conteudoHtml: 'x' } as unknown as Bloco,
      nove[1] as Bloco,
    ];

    const { container } = renderizar(comTextoRico);

    expect(container.querySelectorAll('section')).toHaveLength(2);
    expect(screen.getByText('HERO-TXT')).toBeInTheDocument();
    expect(screen.getByText('BUSCA-TXT')).toBeInTheDocument();
  });

  it('__component inventado devolve null sem lançar', () => {
    const inventado = { __component: 'blocos.inexistente' } as unknown as Bloco;

    expect(() => renderizar([nove[0] as Bloco, inventado])).not.toThrow();
    expect(screen.getByText('HERO-TXT')).toBeInTheDocument();
  });

  it('blocos=[] renderiza vazio, sem lançar', () => {
    const { container } = renderizar([]);
    expect(container.querySelectorAll('section')).toHaveLength(0);
  });

  it('dois blocos de tipos diferentes com o mesmo bloco.id (cenário real do Strapi) não geram chave duplicada', () => {
    // Achado no checkpoint HOME-04: os ids de componente do Strapi são sequenciais por tabela
    // de componente, então colidem entre tipos diferentes na mesma Dynamic Zone (8 dos 9 blocos
    // da página `home` real têm id: 7). A chave não pode depender só de `bloco.id`.
    const idColidido: Bloco[] = [
      { __component: 'blocos.busca', id: 7, titulo: 'BUSCA-TXT' },
      { __component: 'blocos.diferenciais', id: 7, titulo: 'DIFERENCIAIS-TXT' },
    ];

    const erro = jest.spyOn(console, 'error').mockImplementation(() => {});
    const { container } = renderizar(idColidido);

    expect(container.querySelectorAll('section')).toHaveLength(2);
    expect(screen.getByText('BUSCA-TXT')).toBeInTheDocument();
    expect(screen.getByText('DIFERENCIAIS-TXT')).toBeInTheDocument();
    expect(erro).not.toHaveBeenCalledWith(
      expect.stringContaining('Encountered two children with the same key'),
      expect.anything(),
    );

    erro.mockRestore();
  });

  it('ordem invertida no array é a ordem visual — a ordem vem do CMS, não do código', () => {
    const invertidos = [...nove].reverse();
    const { container } = renderizar(invertidos);

    const secoes = container.querySelectorAll('section');
    const titulosEsperados = invertidos.map((b) => b.titulo);
    const posicoes = titulosEsperados.map((titulo) => {
      const el = screen.getByText(titulo as string);
      let idx = -1;
      secoes.forEach((secao, i) => {
        if (secao.contains(el)) idx = i;
      });
      return idx;
    });
    expect(posicoes).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8]);
  });
});
