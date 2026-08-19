import { axe } from 'jest-axe';
import { renderComProviders, screen } from '@/test-utils';
import { emitirEvento, type EventoDataLayer } from '@/lib/analytics/dataLayer';
import { GradeDeCategoriasBloco } from './GradeDeCategoriasBloco';
import type { Bloco, Categoria } from '@/lib/cms/adapters';

jest.mock('@/lib/analytics/dataLayer');

const emitir = jest.mocked(emitirEvento);

/** Estreita o evento mockado para o membro `view_item_list` da união (Fase 5 acrescentou
 * `search`/`filter_applied`; este teste só emite `view_item_list`). */
function comoViewItemList(evento: EventoDataLayer | undefined) {
  if (evento?.event !== 'view_item_list') throw new Error('evento inesperado no mock');
  return evento;
}

type BlocoGrade = Extract<Bloco, { __component: 'blocos.grade-de-categorias' }>;

const blocoBase: BlocoGrade = {
  __component: 'blocos.grade-de-categorias',
  eyebrow: 'Catálogo',
  titulo: 'Explore nossas categorias',
  subtitulo: 'Encontre os produtos certos para o seu evento.',
};

function categoria(overrides: Partial<Categoria>): Categoria {
  return {
    id: 1,
    slug: 'estruturas',
    nome: 'Estruturas',
    descricao: 'Palcos, coberturas e treliças.',
    subcategorias: [],
    hero: null,
    ordem: 0,
    produtos: [],
    seo: null,
    ...overrides,
  };
}

const categoriasCompletas: Categoria[] = [
  categoria({ id: 1, slug: 'estruturas', nome: 'Estruturas', ordem: 0 }),
  categoria({
    id: 2,
    slug: 'telas-de-led',
    nome: 'Telas de LED',
    descricao: 'Painéis de LED para eventos.',
    ordem: 1,
  }),
  categoria({ id: 3, slug: 'luz-e-som', nome: 'Luz & Som', ordem: 2 }),
  categoria({ id: 4, slug: 'tendas', nome: 'Tendas', ordem: 3, descricao: null }),
  categoria({ id: 5, slug: 'moveis', nome: 'Móveis', ordem: 4 }),
];

describe('GradeDeCategoriasBloco', () => {
  beforeEach(() => {
    emitir.mockClear();
  });

  it('renderiza o card-bandeira LED e os 4 cards padrão com os hrefs certos', () => {
    renderComProviders(
      <GradeDeCategoriasBloco bloco={blocoBase} locale="pt-BR" categorias={categoriasCompletas} />,
    );

    expect(screen.getByText('Produto-bandeira')).toBeInTheDocument();
    const links = screen.getAllByRole('link');
    const bandeiraLink = links.find(
      (link) => link.getAttribute('href') === '/pt-BR/categoria/telas-de-led',
    );
    expect(bandeiraLink).toBeInTheDocument();

    const hrefsRestantes = ['estruturas', 'luz-e-som', 'tendas', 'moveis'].map(
      (slug) => `/pt-BR/categoria/${slug}`,
    );
    hrefsRestantes.forEach((href) => {
      expect(links.some((link) => link.getAttribute('href') === href)).toBe(true);
    });
    expect(links).toHaveLength(5);
  });

  it('categoria sem hero renderiza o placeholder, não uma <img> quebrada', () => {
    renderComProviders(
      <GradeDeCategoriasBloco bloco={blocoBase} locale="pt-BR" categorias={categoriasCompletas} />,
    );

    expect(screen.getByRole('img', { name: /FOTO · Tendas/ })).toBeInTheDocument();
  });

  it('sem a categoria telas-de-led, renderiza 4 cards e nenhum bandeira, sem lançar', () => {
    const semBandeira = categoriasCompletas.filter((c) => c.slug !== 'telas-de-led');

    expect(() =>
      renderComProviders(
        <GradeDeCategoriasBloco bloco={blocoBase} locale="pt-BR" categorias={semBandeira} />,
      ),
    ).not.toThrow();

    expect(screen.queryByText('Produto-bandeira')).not.toBeInTheDocument();
    expect(screen.getAllByRole('link')).toHaveLength(4);
  });

  it('emite view_item_list uma vez, com as 5 categorias na ordem renderizada e sem campo monetário', () => {
    renderComProviders(
      <GradeDeCategoriasBloco bloco={blocoBase} locale="pt-BR" categorias={categoriasCompletas} />,
    );

    expect(emitir).toHaveBeenCalledTimes(1);
    const evento = comoViewItemList(emitir.mock.calls[0]?.[0]);
    expect(evento.event).toBe('view_item_list');
    expect(evento.item_list_id).toBe('home_categorias');
    expect(evento.items).toHaveLength(5);
    expect(evento.items[0]).toMatchObject({ item_id: 'telas-de-led', index: 0 });
    expect(Object.keys(evento.items[0] ?? {})).not.toEqual(
      expect.arrayContaining(['price', 'value', 'currency', 'quantity']),
    );
  });

  it('sem violações de acessibilidade', async () => {
    const { container } = renderComProviders(
      <GradeDeCategoriasBloco bloco={blocoBase} locale="pt-BR" categorias={categoriasCompletas} />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
