import { axe } from 'jest-axe';
import { renderComProviders, screen } from '@/test-utils';
import { HeroBloco, type HeroBlocoProps } from './HeroBloco';

const blocoCompleto: HeroBlocoProps['bloco'] = {
  __component: 'blocos.hero',
  id: 1,
  eyebrow: 'Locação para eventos · Flórida',
  titulo: 'O palco é seu. Nós levamos a estrutura.',
  subtitulo: 'Estruturas, telas de LED, luz e som para o seu evento.',
  citacao: 'Do planejamento à montagem, cuidamos de cada detalhe.',
  // Formato já adaptado (`Imagem`, pós `adaptarImagem`): `alt`, não `alternativeText`;
  // `largura`/`altura`, não `width`/`height`. `HeroBloco` recebe o bloco depois do adaptador —
  // nunca a mídia crua do Strapi.
  imagem: {
    url: 'http://localhost:1337/uploads/x.jpg',
    alt: 'Palco montado com painel de LED',
    largura: 1600,
    altura: 900,
  },
  ctaPrimarioRotulo: null,
  ctaPrimarioUrl: null,
  ctaSecundarioRotulo: null,
  ctaSecundarioUrl: null,
};

const blocoSemImagem: HeroBlocoProps['bloco'] = {
  ...blocoCompleto,
  imagem: null,
};

describe('HeroBloco', () => {
  it('com imagem cadastrada: mostra título, eyebrow e as 72 células do mosaico', () => {
    const { container } = renderComProviders(<HeroBloco bloco={blocoCompleto} locale="pt-BR" />);

    expect(
      screen.getByRole('heading', { level: 1, name: blocoCompleto.titulo }),
    ).toBeInTheDocument();
    expect(screen.getByText(blocoCompleto.eyebrow!)).toBeInTheDocument();
    expect(container.querySelectorAll('[data-testid="mosaico-celula"]')).toHaveLength(72);
  });

  it('sem imagem: título continua aparecendo e não há células de mosaico', () => {
    const { container } = renderComProviders(<HeroBloco bloco={blocoSemImagem} locale="pt-BR" />);

    expect(
      screen.getByRole('heading', { level: 1, name: blocoSemImagem.titulo }),
    ).toBeInTheDocument();
    expect(container.querySelectorAll('[data-testid="mosaico-celula"]')).toHaveLength(0);
  });

  it('CTAs apontam para as rotas reais quando o CMS não traz URL própria', () => {
    renderComProviders(<HeroBloco bloco={blocoCompleto} locale="pt-BR" />);

    expect(screen.getByRole('link', { name: 'EXPLORAR CATÁLOGO' })).toHaveAttribute(
      'href',
      '/pt-BR/catalogo',
    );
    expect(screen.getByRole('link', { name: 'SOLICITAR ORÇAMENTO' })).toHaveAttribute(
      'href',
      '/pt-BR/solicitar-orcamento',
    );
  });

  it('sem violações de acessibilidade (axe)', async () => {
    const { container } = renderComProviders(<HeroBloco bloco={blocoCompleto} locale="pt-BR" />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
