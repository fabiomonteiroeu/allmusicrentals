import userEvent from '@testing-library/user-event';
import { renderComProviders, screen } from '@/test-utils';
import { ChipFiltro } from './Chip';
import { MensagemErro } from './Field';

describe('ChipFiltro', () => {
  it('rotula acessivelmente e remove ao clicar', async () => {
    const onRemover = jest.fn();
    renderComProviders(<ChipFiltro rotulo="Cor" valor="Preto" onRemover={onRemover} />);
    const chip = screen.getByRole('button', { name: 'Remover filtro Cor: Preto' });
    await userEvent.click(chip);
    expect(onRemover).toHaveBeenCalledTimes(1);
  });
});

describe('MensagemErro', () => {
  it('usa role="alert" para leitores de tela', () => {
    renderComProviders(<MensagemErro>Informe seu nome.</MensagemErro>);
    expect(screen.getByRole('alert')).toHaveTextContent('Informe seu nome.');
  });
});
