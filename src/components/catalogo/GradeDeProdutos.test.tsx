import { axe } from 'jest-axe';
import userEvent from '@testing-library/user-event';
import { renderComProviders, screen } from '@/test-utils';
import { emitirEvento, type EventoDataLayer } from '@/lib/analytics/dataLayer';
import { GradeDeProdutos } from './GradeDeProdutos';
import type { Produto } from '@/lib/cms/adapters';
import type { HtmlSeguro } from '@/lib/cms/sanitize';
import type { Locale } from '@/i18n/config';

jest.mock('@/lib/analytics/dataLayer');

const emitir = jest.mocked(emitirEvento);
const locale: Locale = 'pt-BR';

/** Estreita o evento mockado para o membro `view_item_list` da união. */
function comoViewItemList(evento: EventoDataLayer | undefined) {
  if (evento?.event !== 'view_item_list') throw new Error('evento inesperado no mock');
  return evento;
}

function criarProduto(indice: number, overrides: Partial<Produto> = {}): Produto {
  return {
    id: indice,
    slug: `produto-${indice}`,
    nome: `Produto ${indice}`,
    codigo: null,
    descricaoCurta: `Descrição do produto ${indice}.`,
    descricaoHtml: '' as HtmlSeguro,
    caracteristicas: [],
    medidas: [{ rotulo: 'Altura', valor: `${indice}0 cm` }],
    material: null,
    aplicacoes: [],
    variacoes: [],
    tipoDeItem: 'fisico',
    ambiente: null,
    imagens: [],
    destaque: false,
    faq: [],
    seo: null,
    categoria: { nome: 'Móveis', slug: 'moveis' },
    tiposDeEvento: [],
    contagemSolicitacoes: 0,
    ...overrides,
  };
}

const produtos: Produto[] = Array.from({ length: 10 }, (_, i) => criarProduto(i + 1));

describe('GradeDeProdutos', () => {
  beforeEach(() => {
    emitir.mockClear();
  });

  it('renderiza os 10 produtos recebidos, um ProductCard por produto', () => {
    renderComProviders(<GradeDeProdutos produtos={produtos} locale={locale} />);
    expect(screen.getAllByRole('article')).toHaveLength(10);
  });

  it('mapearParaProductCard é a origem do que aparece: nome e spec da fixture no DOM', () => {
    renderComProviders(<GradeDeProdutos produtos={produtos} locale={locale} />);
    expect(screen.getByText('Produto 1')).toBeInTheDocument();
    expect(screen.getByText('ALTURA · 10 CM')).toBeInTheDocument();
  });

  it('nenhum card recebe callback de adicionar — clicar não lança nem muda a contagem de cards', async () => {
    renderComProviders(<GradeDeProdutos produtos={produtos} locale={locale} />);
    const botoes = screen.getAllByRole('button', { name: /adicionar ao orçamento/i });

    await expect(userEvent.click(botoes[0] as HTMLElement)).resolves.not.toThrow();
    expect(screen.getAllByRole('article')).toHaveLength(10);
  });

  it('emite view_item_list uma única vez, com item_list_id catalogo_resultados', () => {
    renderComProviders(<GradeDeProdutos produtos={produtos} locale={locale} />);

    expect(emitir).toHaveBeenCalledTimes(1);
    const evento = comoViewItemList(emitir.mock.calls[0]?.[0]);
    expect(evento).toMatchObject({ event: 'view_item_list', item_list_id: 'catalogo_resultados' });
    expect(evento.items).toHaveLength(10);
    expect(evento.items[0]).toMatchObject({ item_id: 'produto-1', index: 0 });
  });

  it('nenhuma string monetária aparece no DOM renderizado', () => {
    const { container } = renderComProviders(
      <GradeDeProdutos produtos={produtos} locale={locale} />,
    );
    expect(container.textContent ?? '').not.toMatch(/R\$|US\$|\$\s?\d/);
  });

  it('sem violações de acessibilidade (axe)', async () => {
    const { container } = renderComProviders(
      <GradeDeProdutos produtos={produtos} locale={locale} />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
