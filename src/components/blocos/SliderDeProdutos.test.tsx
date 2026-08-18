import { axe } from 'jest-axe';
import userEvent from '@testing-library/user-event';
import { renderComProviders, screen } from '@/test-utils';
import { emitirEvento } from '@/lib/analytics/dataLayer';
import { SliderDeProdutos } from './SliderDeProdutos';
import type { Produto } from '@/lib/cms/adapters';
import type { HtmlSeguro } from '@/lib/cms/sanitize';
import type { Locale } from '@/i18n/config';

jest.mock('@/lib/analytics/dataLayer');

const emitir = jest.mocked(emitirEvento);
const locale: Locale = 'pt-BR';

/** Classe stub — jsdom não implementa `IntersectionObserver`. */
class IntersectionObserverStub {
  observe = jest.fn();
  unobserve = jest.fn();
  disconnect = jest.fn();
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
    destaque: true,
    faq: [],
    seo: null,
    categoria: { nome: 'Móveis', slug: 'moveis' },
    ...overrides,
  };
}

const produtos: Produto[] = [1, 2, 3, 4, 5].map((i) => criarProduto(i));

describe('SliderDeProdutos', () => {
  beforeEach(() => {
    emitir.mockClear();
    // jsdom não implementa `IntersectionObserver` nem `HTMLElement.prototype.scrollBy` —
    // garante que a propriedade exista antes de qualquer `jest.spyOn` em cima dela.
    (global as unknown as { IntersectionObserver: unknown }).IntersectionObserver =
      IntersectionObserverStub;
    if (!('scrollBy' in HTMLElement.prototype)) {
      Object.defineProperty(HTMLElement.prototype, 'scrollBy', {
        value: () => {},
        writable: true,
        configurable: true,
      });
    }
  });

  it('renderiza os 5 ProductCard recebidos', () => {
    renderComProviders(<SliderDeProdutos produtos={produtos} locale={locale} />);
    expect(screen.getAllByRole('article')).toHaveLength(5);
  });

  it('emite view_item_list uma vez, com os 5 produtos na ordem renderizada', () => {
    renderComProviders(<SliderDeProdutos produtos={produtos} locale={locale} />);

    expect(emitir).toHaveBeenCalledTimes(1);
    const evento = emitir.mock.calls[0]?.[0];
    expect(evento).toMatchObject({ event: 'view_item_list', item_list_id: 'home_destaques' });
    expect(evento?.items).toHaveLength(5);
    expect(evento?.items[0]).toMatchObject({ item_id: 'produto-1', index: 0 });
  });

  it('a seta "Produtos anteriores" começa desabilitada (scrollLeft 0 em jsdom)', () => {
    renderComProviders(<SliderDeProdutos produtos={produtos} locale={locale} />);
    expect(screen.getByRole('button', { name: 'Produtos anteriores' })).toBeDisabled();
  });

  it('clicar em "Próximos produtos" chama scrollBy na faixa com left positivo', async () => {
    const scrollBySpy = jest.spyOn(HTMLElement.prototype, 'scrollBy').mockImplementation(() => {});
    renderComProviders(<SliderDeProdutos produtos={produtos} locale={locale} />);

    await userEvent.click(screen.getByRole('button', { name: 'Próximos produtos' }));

    expect(scrollBySpy).toHaveBeenCalledTimes(1);
    const args = scrollBySpy.mock.calls[0]?.[0] as unknown as { left: number };
    expect(args.left).toBeGreaterThan(0);
  });

  it('nenhum ProductCard recebe onAdicionar — clicar em adicionar não lança nem muda nada', async () => {
    renderComProviders(<SliderDeProdutos produtos={produtos} locale={locale} />);
    const botoes = screen.getAllByRole('button', { name: /adicionar ao orçamento/i });

    await expect(userEvent.click(botoes[0] as HTMLElement)).resolves.not.toThrow();
    expect(screen.getAllByRole('article')).toHaveLength(5);
  });

  it('sem violações de acessibilidade (axe)', async () => {
    const { container } = renderComProviders(
      <SliderDeProdutos produtos={produtos} locale={locale} subtitulo="Selecione os produtos." />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
