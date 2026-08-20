import { axe } from 'jest-axe';
import { renderComProviders, screen } from '@/test-utils';
import { HeroCatalogo } from './HeroCatalogo';

const TEXTO_SOBRE_VALORES =
  'Os preços não são exibidos online. Os valores dependem da quantidade, data, endereço, entrega, montagem e necessidades do evento.';

describe('HeroCatalogo', () => {
  it('mostra o H1, o parágrafo e o card SOBRE OS VALORES com a cópia literal do layout', () => {
    renderComProviders(<HeroCatalogo busca={<div>busca</div>} />);

    expect(
      screen.getByRole('heading', { level: 1, name: 'Catálogo de Produtos para Eventos' }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        'Navegue pelo catálogo, escolha os produtos e adicione os itens desejados ao seu orçamento.',
      ),
    ).toBeInTheDocument();
    expect(screen.getByText('SOBRE OS VALORES')).toBeInTheDocument();
    expect(screen.getByText(TEXTO_SOBRE_VALORES)).toBeInTheDocument();
  });

  it('renderiza o filho de busca recebido pela prop `busca`', () => {
    renderComProviders(<HeroCatalogo busca={<div data-testid="busca-mock" />} />);
    expect(screen.getByTestId('busca-mock')).toBeInTheDocument();
  });

  it('sem violações de acessibilidade', async () => {
    const { container } = renderComProviders(<HeroCatalogo busca={<div>busca</div>} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
