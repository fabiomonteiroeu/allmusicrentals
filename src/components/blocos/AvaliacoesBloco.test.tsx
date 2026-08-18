import { axe } from 'jest-axe';
import { renderComProviders, screen } from '@/test-utils';
import { AvaliacoesBloco, AvaliacaoSkeleton } from './AvaliacoesBloco';
import type { Bloco, Avaliacao } from '@/lib/cms/adapters';

type BlocoAvaliacoes = Extract<Bloco, { __component: 'blocos.avaliacoes' }>;

const blocoBase: BlocoAvaliacoes = {
  __component: 'blocos.avaliacoes',
  eyebrow: 'Avaliações',
  titulo: 'A confiança de quem já realizou eventos conosco',
  subtitulo: 'Conheça a experiência de clientes que já contrataram a All Music Rentals.',
};

// Nomes obviamente fictícios de teste — nunca os 4 nomes de exemplo de design do HTML-fonte
// (item 13 de docs/00-divergencias.md), para não plantar depoimento que pareça real.
const avaliacaoUm: Avaliacao = {
  id: 1,
  nome: 'Cliente Um',
  empresa: 'Empresa de Teste Um',
  cidade: 'Cidade Teste',
  tipoDeEvento: 'Evento corporativo',
  nota: 5,
  texto: 'Depoimento de teste número um.',
  verificada: true,
};

const avaliacaoDois: Avaliacao = {
  id: 2,
  nome: 'Cliente Dois',
  empresa: null,
  cidade: 'Outra Cidade Teste',
  tipoDeEvento: 'Casamento',
  nota: null,
  texto: 'Depoimento de teste número dois.',
  verificada: false,
};

describe('AvaliacoesBloco', () => {
  it('sem avaliações, mostra o estado vazio completo e nenhum figure', () => {
    renderComProviders(<AvaliacoesBloco bloco={blocoBase} locale="pt-BR" avaliacoes={[]} />);

    expect(screen.getByText('Publicamos apenas avaliações reais de clientes.')).toBeInTheDocument();
    expect(screen.getByText('NENHUMA AVALIAÇÃO PUBLICADA')).toBeInTheDocument();
    expect(screen.getByText('ESTRUTURA DA AVALIAÇÃO')).toBeInTheDocument();
    expect(screen.getByText('NOME · EMPRESA')).toBeInTheDocument();
    expect(screen.getByText('CIDADE · TIPO DE EVENTO')).toBeInTheDocument();
    expect(screen.getByText('NOTA · 0,0 / 5')).toBeInTheDocument();
    expect(screen.getByText('TEXTO COMPLETO DA AVALIAÇÃO')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'SOLICITAR ORÇAMENTO' })).toHaveAttribute(
      'href',
      '/pt-BR/solicitar-orcamento',
    );
    expect(document.querySelector('figure')).not.toBeInTheDocument();
  });

  it('com 2 avaliações, mostra 2 figures e não mostra o estado vazio', () => {
    renderComProviders(
      <AvaliacoesBloco
        bloco={blocoBase}
        locale="pt-BR"
        avaliacoes={[avaliacaoUm, avaliacaoDois]}
      />,
    );

    expect(document.querySelectorAll('figure')).toHaveLength(2);
    expect(screen.queryByText('NENHUMA AVALIAÇÃO PUBLICADA')).not.toBeInTheDocument();
  });

  it('formata a nota pelo locale — vírgula em pt-BR, ponto em en', () => {
    const { rerender } = renderComProviders(
      <AvaliacoesBloco bloco={blocoBase} locale="pt-BR" avaliacoes={[avaliacaoUm]} />,
    );
    expect(screen.getByText('5,0')).toBeInTheDocument();
    expect(screen.getByText('/ 5,0')).toBeInTheDocument();

    rerender(<AvaliacoesBloco bloco={blocoBase} locale="en" avaliacoes={[avaliacaoUm]} />);
    expect(screen.getByText('5.0')).toBeInTheDocument();
    expect(screen.getByText('/ 5.0')).toBeInTheDocument();
  });

  it('com empresa nula, o figcaption não mostra linha de empresa', () => {
    renderComProviders(
      <AvaliacoesBloco bloco={blocoBase} locale="pt-BR" avaliacoes={[avaliacaoDois]} />,
    );

    expect(screen.queryByText('Empresa de Teste Um')).not.toBeInTheDocument();
    const figcaption = document.querySelector('figcaption');
    expect(figcaption?.querySelectorAll('p')).toHaveLength(2); // nome + cidade/tipo, sem empresa
  });

  it('com nota nula, o bloco de nota não é renderizado e nada lança', () => {
    expect(() =>
      renderComProviders(
        <AvaliacoesBloco bloco={blocoBase} locale="pt-BR" avaliacoes={[avaliacaoDois]} />,
      ),
    ).not.toThrow();
    expect(screen.queryByText(/^\/ /)).not.toBeInTheDocument();
  });

  it('sem violações de acessibilidade nos dois estados', async () => {
    const { container: containerVazio } = renderComProviders(
      <AvaliacoesBloco bloco={blocoBase} locale="pt-BR" avaliacoes={[]} />,
    );
    expect(await axe(containerVazio)).toHaveNoViolations();

    const { container: containerCheio } = renderComProviders(
      <AvaliacoesBloco
        bloco={blocoBase}
        locale="pt-BR"
        avaliacoes={[avaliacaoUm, avaliacaoDois]}
      />,
    );
    expect(await axe(containerCheio)).toHaveNoViolations();
  });
});

describe('AvaliacaoSkeleton', () => {
  it('renderiza exatamente 3 cards-esqueleto com 12 barras no total', () => {
    const { container } = renderComProviders(<AvaliacaoSkeleton />);

    const grade = container.querySelector('[aria-hidden="true"]');
    expect(grade?.children).toHaveLength(3);
    expect(container.querySelectorAll('span').length).toBe(12);
  });

  it('o primeiro card tem barras com as larguras 40%, 60%, 100%, 85%', () => {
    const { container } = renderComProviders(<AvaliacaoSkeleton />);

    const grade = container.querySelector('[aria-hidden="true"]');
    const primeiroCard = grade?.children[0];
    const larguras = Array.from(primeiroCard?.children ?? []).map(
      (barra) => getComputedStyle(barra as HTMLElement).width,
    );
    expect(larguras).toEqual(['40%', '60%', '100%', '85%']);
  });

  it('AvaliacoesBloco com avaliações=[] não renderiza o esqueleto — o estado vazio é o real em produção', () => {
    const { container } = renderComProviders(
      <AvaliacoesBloco bloco={blocoBase} locale="pt-BR" avaliacoes={[]} />,
    );
    expect(container.querySelectorAll('span').length).toBe(0);
  });

  it('sem violações de acessibilidade', async () => {
    const { container } = renderComProviders(<AvaliacaoSkeleton />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
