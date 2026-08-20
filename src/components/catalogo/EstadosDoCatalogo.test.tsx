import { axe } from 'jest-axe';
import { renderComProviders, screen } from '@/test-utils';
import { EstadoSemResultados } from './EstadoSemResultados';
import { EstadoCatalogoVazio } from './EstadoCatalogoVazio';
import type { Locale } from '@/i18n/config';

const mockPush = jest.fn();
let mockSearchParams = new URLSearchParams();

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  usePathname: () => '/pt-BR/catalogo',
  useSearchParams: () => mockSearchParams,
}));

const locale: Locale = 'pt-BR';

describe('EstadoSemResultados', () => {
  beforeEach(() => {
    mockPush.mockClear();
    mockSearchParams = new URLSearchParams();
  });

  it('mostra a cópia literal do layout: eyebrow, título, texto e o texto de apoio do rodapé', () => {
    renderComProviders(<EstadoSemResultados locale={locale} />);

    expect(screen.getByText('BUSCA SEM CORRESPONDÊNCIA')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Amplie a busca ou fale com a equipe' }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Nenhum produto do catálogo combina com todos os filtros aplicados/),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Descreva o item e a data — a equipe responde com o que temos disponível.'),
    ).toBeInTheDocument();
  });

  it('as três sugestões existem e navegam para os alvos especificados', async () => {
    mockSearchParams = new URLSearchParams('categoria=moveis&q=lustre&ordenar=recentes');
    renderComProviders(<EstadoSemResultados locale={locale} />);

    screen.getByRole('button', { name: 'Remover todos os filtros' }).click();
    const chamadaRemover = mockPush.mock.calls[0]?.[0] as string;
    const paramsRemover = new URLSearchParams(chamadaRemover.split('?')[1] ?? '');
    expect(paramsRemover.get('categoria')).toBeNull();
    expect(paramsRemover.get('q')).toBe('lustre');
    expect(paramsRemover.get('ordenar')).toBe('recentes');

    screen.getByRole('button', { name: 'Ver painéis de LED' }).click();
    expect(mockPush.mock.calls[1]?.[0]).toBe('/pt-BR/catalogo?categoria=telas-de-led');

    screen.getByRole('button', { name: 'Ver mesas de coquetel' }).click();
    expect(mockPush.mock.calls[2]?.[0]).toBe('/pt-BR/catalogo?q=mesa');
  });

  it('o CTA aponta para a rota de solicitar orçamento', () => {
    renderComProviders(<EstadoSemResultados locale={locale} />);
    expect(screen.getByRole('link', { name: 'SOLICITAR ORÇAMENTO' })).toHaveAttribute(
      'href',
      '/pt-BR/solicitar-orcamento',
    );
  });

  it('não ecoa o termo buscado na tela', () => {
    mockSearchParams = new URLSearchParams('q=zzzzzz-termo-de-teste-unico');
    renderComProviders(<EstadoSemResultados locale={locale} />);

    expect(screen.queryByText(/zzzzzz-termo-de-teste-unico/)).not.toBeInTheDocument();
  });

  it('sem violações de acessibilidade (axe)', async () => {
    const { container } = renderComProviders(<EstadoSemResultados locale={locale} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});

describe('EstadoCatalogoVazio', () => {
  it('mostra cópia própria, distinta da tela de sem correspondência', () => {
    renderComProviders(<EstadoCatalogoVazio locale={locale} />);

    expect(screen.getByText('CATÁLOGO EM ATUALIZAÇÃO')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Nosso catálogo está sendo montado' }),
    ).toBeInTheDocument();
    expect(screen.queryByText('BUSCA SEM CORRESPONDÊNCIA')).not.toBeInTheDocument();
    expect(screen.queryByText(/Amplie a busca/)).not.toBeInTheDocument();
    expect(screen.queryByText('SUGESTÕES')).not.toBeInTheDocument();
  });

  it('o CTA aponta para a rota de solicitar orçamento', () => {
    renderComProviders(<EstadoCatalogoVazio locale={locale} />);
    expect(screen.getByRole('link', { name: 'SOLICITAR ORÇAMENTO' })).toHaveAttribute(
      'href',
      '/pt-BR/solicitar-orcamento',
    );
  });

  it('sem violações de acessibilidade (axe)', async () => {
    const { container } = renderComProviders(<EstadoCatalogoVazio locale={locale} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});

describe('EstadoSemResultados vs EstadoCatalogoVazio — telas distinguíveis', () => {
  it('nenhuma das duas contém a cópia principal da outra', () => {
    const { container: semResultados } = renderComProviders(
      <EstadoSemResultados locale={locale} />,
    );
    const { container: catalogoVazio } = renderComProviders(
      <EstadoCatalogoVazio locale={locale} />,
    );

    expect(semResultados.textContent).not.toContain('CATÁLOGO EM ATUALIZAÇÃO');
    expect(catalogoVazio.textContent).not.toContain('BUSCA SEM CORRESPONDÊNCIA');
  });
});
