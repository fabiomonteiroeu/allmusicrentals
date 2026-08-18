import userEvent from '@testing-library/user-event';
import { renderComProviders, screen } from '@/test-utils';
import { ChipFiltro } from './Chip';
import { MensagemErro } from './Field';
import { Eyebrow, Heading } from './Typography';
import { Button } from './Button';

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

describe('Eyebrow (E1 — $sobreEscuro)', () => {
  it('sai em teal (#2FB6B9) sobre fundo escuro', () => {
    renderComProviders(<Eyebrow $sobreEscuro>Rótulo</Eyebrow>);
    const no = screen.getByText('Rótulo');
    expect(getComputedStyle(no).color).toBe('rgb(47, 182, 185)');
  });

  it('sai em tealLink (#1A7F82) sem a prop', () => {
    renderComProviders(<Eyebrow>Rótulo</Eyebrow>);
    const no = screen.getByText('Rótulo');
    expect(getComputedStyle(no).color).toBe('rgb(26, 127, 130)');
  });
});

describe('Heading (E2 — leading por nível)', () => {
  it('$nivel="h1" usa line-height 0.92', () => {
    renderComProviders(<Heading $nivel="h1">Título</Heading>);
    const no = screen.getByText('Título');
    expect(getComputedStyle(no).lineHeight).toBe('0.92');
  });

  it('$nivel="h2" usa line-height 0.98', () => {
    renderComProviders(<Heading $nivel="h2">Título</Heading>);
    const no = screen.getByText('Título');
    expect(getComputedStyle(no).lineHeight).toBe('0.98');
  });
});

describe('Button (E3 — $variante="pretoSolido")', () => {
  it('renderiza e responde a clique', async () => {
    const onClick = jest.fn();
    renderComProviders(
      <Button $variante="pretoSolido" onClick={onClick}>
        Buscar
      </Button>,
    );
    const botao = screen.getByRole('button', { name: 'Buscar' });
    await userEvent.click(botao);
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
