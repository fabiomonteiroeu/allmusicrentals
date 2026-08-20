import { axe } from 'jest-axe';
import userEvent from '@testing-library/user-event';
import { renderComProviders, screen } from '@/test-utils';
import { ChipsDeFiltroAtivo, type ChipsDeFiltroAtivoProps } from './ChipsDeFiltroAtivo';

const mockPush = jest.fn();
let mockSearchParams = new URLSearchParams();

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  useSearchParams: () => mockSearchParams,
}));

const propsFixture: ChipsDeFiltroAtivoProps = {
  categorias: [
    { valor: 'moveis', rotulo: 'Móveis' },
    { valor: 'estruturas', rotulo: 'Estruturas' },
  ],
  tiposDeEvento: [{ valor: 'casamento', rotulo: 'Casamento' }],
  cores: ['Bege', 'Preto', 'Branco'],
};

function renderChips(sp = '', props: Partial<ChipsDeFiltroAtivoProps> = {}) {
  mockSearchParams = new URLSearchParams(sp);
  return renderComProviders(<ChipsDeFiltroAtivo {...propsFixture} {...props} />);
}

describe('ChipsDeFiltroAtivo', () => {
  beforeEach(() => {
    mockPush.mockClear();
  });

  it('sem filtro na URL, nada é renderizado', () => {
    const { container } = renderChips('');
    expect(container).toBeEmptyDOMElement();
  });

  it('com ?cor=Bege&tipo=pacote, dois chips aparecem com os rótulos de grupo corretos', () => {
    renderChips('cor=Bege&tipo=pacote');

    expect(screen.getByRole('button', { name: /Remover filtro Cor: Bege/i })).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Remover filtro Tipo de item: Pacote/i }),
    ).toBeInTheDocument();
  });

  it('clicar no X de um chip chama router.push sem aquele valor e com o outro preservado', async () => {
    renderChips('cor=Bege&tipo=pacote');

    await userEvent.click(screen.getByRole('button', { name: /Remover filtro Cor: Bege/i }));

    const chamada = mockPush.mock.calls[0]?.[0] as string;
    const params = new URLSearchParams(chamada.replace(/^\?/, ''));
    expect(params.getAll('cor')).toEqual([]);
    expect(params.getAll('tipo')).toEqual(['pacote']);
  });

  it('com ?cor=Bege&cor=Preto, dois chips aparecem e remover um preserva o outro', async () => {
    renderChips('cor=Bege&cor=Preto');

    expect(screen.getByRole('button', { name: /Remover filtro Cor: Bege/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Remover filtro Cor: Preto/i })).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /Remover filtro Cor: Bege/i }));

    const chamada = mockPush.mock.calls[0]?.[0] as string;
    const params = new URLSearchParams(chamada.replace(/^\?/, ''));
    expect(params.getAll('cor')).toEqual(['Preto']);
  });

  it('com ?q=mesa&cor=Bege existe um chip só (o de cor) e LIMPAR TUDO preserva q=mesa', async () => {
    renderChips('q=mesa&cor=Bege');

    expect(screen.getByRole('button', { name: /Remover filtro Cor: Bege/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Remover filtro.*mesa/i })).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'LIMPAR TUDO' }));

    const chamada = mockPush.mock.calls[0]?.[0] as string;
    const params = new URLSearchParams(chamada.replace(/^\?/, ''));
    expect(params.get('q')).toBe('mesa');
    expect(params.getAll('cor')).toEqual([]);
  });

  it('o grupo categoria resolve o rótulo pela lista recebida por prop, não pelo slug cru', () => {
    renderChips('categoria=moveis');

    expect(
      screen.getByRole('button', { name: /Remover filtro Categoria: Móveis/i }),
    ).toBeInTheDocument();
  });

  it('sem violações de acessibilidade', async () => {
    const { container } = renderChips('cor=Bege&tipo=pacote');
    expect(await axe(container)).toHaveNoViolations();
  });
});
