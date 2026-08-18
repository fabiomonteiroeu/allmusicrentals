import { axe } from 'jest-axe';
import userEvent from '@testing-library/user-event';
import { renderComProviders, screen } from '@/test-utils';
import { SearchBarGrande } from './SearchBarGrande';

const mockPush = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

const MENSAGEM_ERRO = 'Digite um produto, equipamento ou solução para buscar.';

describe('SearchBarGrande', () => {
  beforeEach(() => {
    mockPush.mockClear();
  });

  it('submeter vazio não navega e mostra o erro com role=alert', async () => {
    renderComProviders(<SearchBarGrande locale="pt-BR" />);

    await userEvent.click(screen.getByRole('button', { name: /buscar/i }));

    expect(mockPush).not.toHaveBeenCalled();
    expect(screen.getByRole('alert')).toHaveTextContent(MENSAGEM_ERRO);
  });

  it('digitar um termo e submeter navega para /pt-BR/catalogo?q= com o termo codificado', async () => {
    renderComProviders(<SearchBarGrande locale="pt-BR" />);

    await userEvent.type(screen.getByPlaceholderText(/busque por/i), 'painel de led');
    await userEvent.click(screen.getByRole('button', { name: /buscar/i }));

    expect(mockPush).toHaveBeenCalledWith('/pt-BR/catalogo?q=painel%20de%20led');
  });

  it('termo só com espaços não navega e mostra o erro', async () => {
    renderComProviders(<SearchBarGrande locale="pt-BR" />);

    await userEvent.type(screen.getByPlaceholderText(/busque por/i), '   ');
    await userEvent.click(screen.getByRole('button', { name: /buscar/i }));

    expect(mockPush).not.toHaveBeenCalled();
    expect(screen.getByRole('alert')).toHaveTextContent(MENSAGEM_ERRO);
  });

  it('depois de um submit válido, o erro anterior desaparece', async () => {
    renderComProviders(<SearchBarGrande locale="pt-BR" />);

    await userEvent.click(screen.getByRole('button', { name: /buscar/i }));
    expect(screen.getByRole('alert')).toHaveTextContent(MENSAGEM_ERRO);

    await userEvent.type(screen.getByPlaceholderText(/busque por/i), 'mesa redonda');
    await userEvent.click(screen.getByRole('button', { name: /buscar/i }));

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(mockPush).toHaveBeenCalledWith('/pt-BR/catalogo?q=mesa%20redonda');
  });

  it('sem violações de acessibilidade', async () => {
    const { container } = renderComProviders(<SearchBarGrande locale="pt-BR" />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
