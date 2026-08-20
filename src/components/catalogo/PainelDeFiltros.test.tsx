import { axe } from 'jest-axe';
import userEvent from '@testing-library/user-event';
import { renderComProviders, screen } from '@/test-utils';
import { PainelDeFiltros, type OpcoesDinamicasDeFiltro } from './PainelDeFiltros';

const mockPush = jest.fn();
let mockSearchParams = new URLSearchParams();

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  useSearchParams: () => mockSearchParams,
}));

const gruposFixture: OpcoesDinamicasDeFiltro = {
  categoria: [
    { valor: 'estruturas', rotulo: 'Estruturas' },
    { valor: 'tendas', rotulo: 'Tendas' },
  ],
  evento: [
    { valor: 'casamento', rotulo: 'Casamento' },
    { valor: 'festa-privada', rotulo: 'Festa privada' },
  ],
  cor: ['Bege', 'Preto', 'Branco'],
};

function renderPainel(sp = '') {
  mockSearchParams = new URLSearchParams(sp);
  return renderComProviders(<PainelDeFiltros grupos={gruposFixture} idPrefixo="aside" />);
}

describe('PainelDeFiltros', () => {
  beforeEach(() => {
    mockPush.mockClear();
  });

  it('os 5 rótulos de grupo estão na tela', () => {
    renderPainel();

    expect(screen.getByRole('button', { name: /Categoria/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Tipo de item/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Cor/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Tipo de evento/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Ambiente/i })).toBeInTheDocument();
  });

  it('Categoria, Tipo de item e Cor começam expandidos; Tipo de evento e Ambiente começam recolhidos', () => {
    renderPainel();

    expect(screen.getByRole('button', { name: /Categoria/i })).toHaveAttribute(
      'aria-expanded',
      'true',
    );
    expect(screen.getByRole('button', { name: /Tipo de item/i })).toHaveAttribute(
      'aria-expanded',
      'true',
    );
    expect(screen.getByRole('button', { name: /^Cor/i })).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('button', { name: /Tipo de evento/i })).toHaveAttribute(
      'aria-expanded',
      'false',
    );
    expect(screen.getByRole('button', { name: /Ambiente/i })).toHaveAttribute(
      'aria-expanded',
      'false',
    );
  });

  it('Enter no trigger de um grupo recolhido alterna aria-expanded para true', async () => {
    renderPainel();
    const trigger = screen.getByRole('button', { name: /Ambiente/i });

    trigger.focus();
    await userEvent.keyboard('{Enter}');

    expect(trigger).toHaveAttribute('aria-expanded', 'true');
  });

  it('clicar num checkbox desmarcado chama router.push acrescentando o parâmetro', async () => {
    renderPainel();

    await userEvent.click(screen.getByLabelText('Produto físico'));

    expect(mockPush).toHaveBeenCalledWith('?tipo=fisico');
  });

  it('clicar num checkbox já marcado chama router.push removendo o parâmetro', async () => {
    renderPainel('tipo=fisico');

    await userEvent.click(screen.getByLabelText('Produto físico'));

    expect(mockPush).toHaveBeenCalledWith('?');
  });

  it('marcar dois valores do mesmo grupo produz o parâmetro repetido duas vezes (OR)', async () => {
    renderPainel('tipo=fisico');

    await userEvent.click(screen.getByLabelText('Pacote'));

    const chamada = mockPush.mock.calls[0]?.[0] as string;
    const params = new URLSearchParams(chamada.replace(/^\?/, ''));
    expect(params.getAll('tipo')).toEqual(['fisico', 'pacote']);
  });

  it('o grupo categoria renderiza as categorias recebidas por prop, sem rótulo de subcategoria do layout', () => {
    renderPainel();

    expect(screen.getByLabelText('Estruturas')).toBeInTheDocument();
    expect(screen.getByLabelText('Tendas')).toBeInTheDocument();
    expect(screen.queryByText('Mesas de coquetel')).not.toBeInTheDocument();
    expect(screen.queryByText('Área externa')).not.toBeInTheDocument();
    expect(screen.queryByText('Capas de mesa')).not.toBeInTheDocument();
    expect(screen.queryByText('Painéis de LED')).not.toBeInTheDocument();
  });

  it('o grupo cor repassa uma cor arbitrária da paleta recebida por prop', () => {
    mockSearchParams = new URLSearchParams();
    renderComProviders(
      <PainelDeFiltros grupos={{ ...gruposFixture, cor: ['Bege', 'Bordô'] }} idPrefixo="aside" />,
    );

    expect(screen.getByRole('button', { name: 'Bordô' })).toBeInTheDocument();
  });

  it('sem violações de acessibilidade', async () => {
    const { container } = renderPainel();
    expect(await axe(container)).toHaveNoViolations();
  });
});
