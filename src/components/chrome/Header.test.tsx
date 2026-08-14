import userEvent from '@testing-library/user-event';
import { renderComProviders, screen } from '@/test-utils';
import { Header } from './Header';

describe('Header', () => {
  it('o hambúrguer alterna o menu mobile no store e no aria', async () => {
    const { store } = renderComProviders(<Header quantidade={0} />);

    const botao = screen.getByRole('button', { name: 'Abrir menu' });
    expect(botao).toHaveAttribute('aria-expanded', 'false');
    expect(store.getState().ui.menuMobileAberto).toBe(false);

    await userEvent.click(botao);

    expect(store.getState().ui.menuMobileAberto).toBe(true);
    expect(screen.getByRole('button', { name: 'Fechar menu' })).toHaveAttribute(
      'aria-expanded',
      'true',
    );
  });

  it('mostra a contagem do orçamento', () => {
    renderComProviders(<Header quantidade={4} />);
    expect(screen.getByLabelText('4 itens no orçamento')).toBeInTheDocument();
  });
});
