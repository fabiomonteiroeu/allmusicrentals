import { axe } from 'jest-axe';
import userEvent from '@testing-library/user-event';
import { renderComProviders, screen } from '@/test-utils';
import { SwatchesDeCor } from './SwatchesDeCor';

describe('SwatchesDeCor', () => {
  it('renderiza exatamente as cores recebidas por prop — 4 cores, não uma lista fixa de 3', () => {
    renderComProviders(
      <SwatchesDeCor
        cores={['Bege', 'Preto', 'Branco', 'Bordô']}
        selecionadas={[]}
        onAlternar={jest.fn()}
      />,
    );

    expect(screen.getAllByRole('button')).toHaveLength(4);
  });

  it('cores vazio não renderiza nenhum swatch e não quebra', () => {
    renderComProviders(<SwatchesDeCor cores={[]} selecionadas={[]} onAlternar={jest.fn()} />);

    expect(screen.queryAllByRole('button')).toHaveLength(0);
    expect(screen.getByText('Outras cores cadastradas aparecem aqui.')).toBeInTheDocument();
  });

  it('clicar num swatch chama onAlternar com o nome da cor', async () => {
    const onAlternar = jest.fn();
    renderComProviders(
      <SwatchesDeCor cores={['Bege', 'Preto']} selecionadas={[]} onAlternar={onAlternar} />,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Preto' }));

    expect(onAlternar).toHaveBeenCalledWith('Preto');
  });

  it('cor já selecionada tem aria-pressed="true" e as demais "false"', () => {
    renderComProviders(
      <SwatchesDeCor cores={['Bege', 'Preto']} selecionadas={['Preto']} onAlternar={jest.fn()} />,
    );

    expect(screen.getByRole('button', { name: 'Preto' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'Bege' })).toHaveAttribute('aria-pressed', 'false');
  });

  it('sem violações de acessibilidade', async () => {
    const { container } = renderComProviders(
      <SwatchesDeCor
        cores={['Bege', 'Preto', 'Branco']}
        selecionadas={['Preto']}
        onAlternar={jest.fn()}
      />,
    );

    expect(await axe(container)).toHaveNoViolations();
  });
});
