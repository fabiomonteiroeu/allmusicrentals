import { axe } from 'jest-axe';
import { renderComProviders, screen } from '@/test-utils';
import { DestaqueLedBloco, type DestaqueLedBlocoProps } from './DestaqueLedBloco';
import type { Locale } from '@/i18n/config';

const locale: Locale = 'pt-BR';

function criarBloco(
  overrides: Partial<DestaqueLedBlocoProps['bloco']> = {},
): DestaqueLedBlocoProps['bloco'] {
  return {
    __component: 'blocos.destaque-led',
    id: 1,
    eyebrow: 'Painéis de LED',
    titulo: 'Painéis de LED para transformar seu evento',
    textos: ['Primeiro parágrafo.', 'Segundo parágrafo.'],
    instalamos: [
      'Tamanhos personalizados',
      'Instalação profissional',
      'Configurações internas e externas',
      'Suporte técnico disponível',
    ],
    exibimos: [
      'Compatibilidade com vídeos',
      'Compatibilidade com apresentações',
      'Possibilidade de transmissão ao vivo',
      'Exibição de conteúdos de patrocinadores',
    ],
    ctaRotulo: null,
    ctaUrl: null,
    // Formato já adaptado (`Imagem`, pós `adaptarImagens`): `alt`, não `alternativeText`;
    // `largura`/`altura`, não `width`/`height`. `DestaqueLedBloco` recebe o bloco depois do
    // adaptador — nunca a mídia crua do Strapi.
    imagens: [
      { url: '/uploads/led-1.jpg', alt: 'Painel LED 1', largura: 1600, altura: 1000 },
      { url: '/uploads/led-2.jpg', alt: 'Painel LED 2', largura: 800, altura: 800 },
      { url: '/uploads/led-3.jpg', alt: 'Painel LED 3', largura: 800, altura: 800 },
    ],
    ...overrides,
  };
}

describe('DestaqueLedBloco', () => {
  it('bloco completo mostra os dois valores de pixel pitch, 8 itens e o CTA do CMS', () => {
    const bloco = criarBloco({ ctaRotulo: 'Fale com a gente', ctaUrl: '/pt-BR/led-custom' });
    renderComProviders(<DestaqueLedBloco bloco={bloco} locale={locale} />);

    expect(screen.getByText('P1.9')).toBeInTheDocument();
    expect(screen.getByText('P3.9')).toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(8);
    expect(screen.getByRole('link', { name: 'Fale com a gente' })).toHaveAttribute(
      'href',
      '/pt-BR/led-custom',
    );
  });

  it('sem imagens cadastradas, a galeria mostra 3 placeholders (nunca menos)', () => {
    const bloco = criarBloco({ imagens: [] });
    renderComProviders(<DestaqueLedBloco bloco={bloco} locale={locale} />);
    expect(screen.getAllByRole('img', { name: /FOTO · PAINEL DE LED/ })).toHaveLength(3);
  });

  it('sem ctaUrl, o CTA aponta para a rota real de telas-de-led', () => {
    const bloco = criarBloco({ ctaUrl: null });
    renderComProviders(<DestaqueLedBloco bloco={bloco} locale={locale} />);
    expect(screen.getByRole('link', { name: /CONHECER NOSSAS SOLUÇÕES EM LED/i })).toHaveAttribute(
      'href',
      '/pt-BR/categoria/telas-de-led',
    );
  });

  it('lista vazia não renderiza a coluna, mas a outra continua aparecendo', () => {
    const bloco = criarBloco({ exibimos: [] });
    renderComProviders(<DestaqueLedBloco bloco={bloco} locale={locale} />);
    expect(screen.queryByText('O QUE EXIBIMOS')).not.toBeInTheDocument();
    expect(screen.getByText('O QUE INSTALAMOS')).toBeInTheDocument();
  });

  it('sem violações de acessibilidade (axe)', async () => {
    const bloco = criarBloco();
    const { container } = renderComProviders(<DestaqueLedBloco bloco={bloco} locale={locale} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
