import userEvent from '@testing-library/user-event';
import { renderComProviders, screen } from '@/test-utils';
import { theme } from '@/lib/theme/theme';
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
  /**
   * Deriva o rgb do token em vez de fixar o hex: o que este teste protege é a ESCOLHA de token
   * por variante, não o valor da cor. Fixar o literal fazia um ajuste de contraste na paleta
   * (tealLink #1A7F82 → #157A7D, para cruzar 4.5:1) quebrar um teste que nada tem a ver com isso.
   */
  const rgbDoToken = (hex: string) => {
    const h = hex.replace('#', '');
    const [r, g, b] = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
    return `rgb(${r}, ${g}, ${b})`;
  };

  it('sai em teal sobre fundo escuro', () => {
    renderComProviders(<Eyebrow $sobreEscuro>Rótulo</Eyebrow>);
    const no = screen.getByText('Rótulo');
    expect(getComputedStyle(no).color).toBe(rgbDoToken(theme.cor.teal));
  });

  it('sai em tealLink sem a prop', () => {
    renderComProviders(<Eyebrow>Rótulo</Eyebrow>);
    const no = screen.getByText('Rótulo');
    expect(getComputedStyle(no).color).toBe(rgbDoToken(theme.cor.tealLink));
  });

  it('os dois tokens são distintos — a variante escura não é cosmética', () => {
    expect(theme.cor.teal).not.toBe(theme.cor.tealLink);
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

describe('Heading (E7 — $sobreEscuro)', () => {
  it('sem a prop, sai em tinta900 (#0B0C0D) — pensado para fundo claro', () => {
    renderComProviders(<Heading>Título</Heading>);
    const no = screen.getByText('Título');
    expect(getComputedStyle(no).color).toBe('rgb(11, 12, 13)');
  });

  it('com $sobreEscuro, sai em fundo (#F1F2F2) — legível sobre seção escura (tinta900)', () => {
    renderComProviders(<Heading $sobreEscuro>Título</Heading>);
    const no = screen.getByText('Título');
    expect(getComputedStyle(no).color).toBe('rgb(241, 242, 242)');
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
