import { axe } from 'jest-axe';
import { renderComProviders, screen } from '@/test-utils';
import { ChamadaFinalBloco, type ChamadaFinalBlocoProps } from './ChamadaFinalBloco';

const blocoVazio: ChamadaFinalBlocoProps['bloco'] = {
  __component: 'blocos.chamada-final',
  id: 1,
  titulo: null,
  subtitulo: null,
  ctaPrimarioRotulo: null,
  ctaPrimarioUrl: null,
  ctaSecundarioRotulo: null,
  ctaSecundarioUrl: null,
};

const blocoDoCms: ChamadaFinalBlocoProps['bloco'] = {
  __component: 'blocos.chamada-final',
  id: 2,
  titulo: 'Vamos montar o seu evento',
  subtitulo: 'Fale com a nossa equipe agora mesmo.',
  ctaPrimarioRotulo: 'VER CATÁLOGO COMPLETO',
  ctaPrimarioUrl: '/pt-BR/categoria/telas-de-led',
  ctaSecundarioRotulo: null,
  ctaSecundarioUrl: null,
};

describe('ChamadaFinalBloco', () => {
  it('bloco vazio: mostra os textos padrão e os CTAs apontam para as rotas reais', () => {
    renderComProviders(<ChamadaFinalBloco bloco={blocoVazio} locale="pt-BR" />);

    expect(
      screen.getByRole('heading', { level: 2, name: 'Comece a montar seu evento' }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        'Explore o catálogo, selecione os produtos e envie sua solicitação para nossa equipe.',
      ),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'VER TODOS OS PRODUTOS' })).toHaveAttribute(
      'href',
      '/pt-BR/catalogo',
    );
    expect(screen.getByRole('link', { name: 'SOLICITAR ORÇAMENTO' })).toHaveAttribute(
      'href',
      '/pt-BR/solicitar-orcamento',
    );
  });

  it('valores do CMS vencem os defaults', () => {
    renderComProviders(<ChamadaFinalBloco bloco={blocoDoCms} locale="pt-BR" />);

    expect(
      screen.getByRole('heading', { level: 2, name: 'Vamos montar o seu evento' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Fale com a nossa equipe agora mesmo.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'VER CATÁLOGO COMPLETO' })).toHaveAttribute(
      'href',
      '/pt-BR/categoria/telas-de-led',
    );
  });

  it('sem violações de acessibilidade (axe)', async () => {
    const { container } = renderComProviders(
      <ChamadaFinalBloco bloco={blocoVazio} locale="pt-BR" />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
