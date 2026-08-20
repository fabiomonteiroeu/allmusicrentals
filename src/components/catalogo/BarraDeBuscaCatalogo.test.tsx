import { axe } from 'jest-axe';
import userEvent from '@testing-library/user-event';
import { renderComProviders, screen } from '@/test-utils';
import { BarraDeBuscaCatalogo } from './BarraDeBuscaCatalogo';

const mockPush = jest.fn();
let mockSearchParams = new URLSearchParams();

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  usePathname: () => '/pt-BR/catalogo',
  useSearchParams: () => mockSearchParams,
}));

const MENSAGEM_ERRO = 'Digite um produto, equipamento ou solução para buscar.';

describe('BarraDeBuscaCatalogo', () => {
  beforeEach(() => {
    mockPush.mockClear();
    mockSearchParams = new URLSearchParams();
  });

  it('submeter vazio não navega e mostra o erro com role=alert', async () => {
    renderComProviders(<BarraDeBuscaCatalogo termoInicial="" />);

    await userEvent.click(screen.getByRole('button', { name: /buscar/i }));

    expect(mockPush).not.toHaveBeenCalled();
    expect(screen.getByRole('alert')).toHaveTextContent(MENSAGEM_ERRO);
  });

  it('termo só com espaços não navega e mostra o erro', async () => {
    renderComProviders(<BarraDeBuscaCatalogo termoInicial="" />);

    await userEvent.type(screen.getByPlaceholderText(/busque por/i), '   ');
    await userEvent.click(screen.getByRole('button', { name: /buscar/i }));

    expect(mockPush).not.toHaveBeenCalled();
    expect(screen.getByRole('alert')).toHaveTextContent(MENSAGEM_ERRO);
  });

  it('digitar um termo e submeter chama router.push com `q` codificado', async () => {
    renderComProviders(<BarraDeBuscaCatalogo termoInicial="" />);

    await userEvent.type(screen.getByPlaceholderText(/busque por/i), 'painel de led');
    await userEvent.click(screen.getByRole('button', { name: /buscar/i }));

    expect(mockPush).toHaveBeenCalledWith('?q=painel+de+led');
  });

  it('submit com termo quando já existe ?cor=Bege na URL preserva ambos os parâmetros', async () => {
    mockSearchParams = new URLSearchParams('cor=Bege');
    renderComProviders(<BarraDeBuscaCatalogo termoInicial="" />);

    await userEvent.type(screen.getByPlaceholderText(/busque por/i), 'mesa');
    await userEvent.click(screen.getByRole('button', { name: /buscar/i }));

    expect(mockPush).toHaveBeenCalledTimes(1);
    const chamada = mockPush.mock.calls[0]?.[0] as string;
    const params = new URLSearchParams(chamada.replace(/^\?/, ''));
    expect(params.get('cor')).toBe('Bege');
    expect(params.get('q')).toBe('mesa');
  });

  it('o input recebe o valor de `termoInicial`', () => {
    renderComProviders(<BarraDeBuscaCatalogo termoInicial="painel" />);
    expect(screen.getByPlaceholderText(/busque por/i)).toHaveValue('painel');
  });

  it('sem violações de acessibilidade', async () => {
    const { container } = renderComProviders(<BarraDeBuscaCatalogo termoInicial="" />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
