import { axe } from 'jest-axe';
import { renderComProviders, screen } from '@/test-utils';
import { ComoFuncionaBloco } from './ComoFuncionaBloco';
import type { Bloco } from '@/lib/cms/adapters';

type BlocoComoFunciona = Extract<Bloco, { __component: 'blocos.como-funciona' }>;

const blocoCompleto: BlocoComoFunciona = {
  __component: 'blocos.como-funciona',
  titulo: 'Monte seu orçamento em quatro etapas',
  aviso: null,
  passos: [
    { titulo: 'Escolha os produtos', texto: 'Navegue pelo catálogo e encontre os itens.' },
    { titulo: 'Adicione ao orçamento', texto: 'Escolha a quantidade, a cor ou a configuração.' },
    { titulo: 'Envie os dados do evento', texto: 'Informe a data, o endereço e o tipo de evento.' },
    { titulo: 'Receba sua proposta', texto: 'Nossa equipe enviará um orçamento personalizado.' },
  ],
};

describe('ComoFuncionaBloco', () => {
  it('com 4 passos, os 4 títulos aparecem e a numeração vai de 1 a 4', () => {
    renderComProviders(<ComoFuncionaBloco bloco={blocoCompleto} />);

    blocoCompleto.passos!.forEach((passo) => {
      expect(screen.getByText(passo.titulo)).toBeInTheDocument();
    });
    ['1', '2', '3', '4'].forEach((numero) => {
      expect(screen.getByText(numero)).toBeInTheDocument();
    });
  });

  it('sem aviso no CMS, o texto de fallback exato aparece dentro de um Notice', () => {
    renderComProviders(<ComoFuncionaBloco bloco={{ ...blocoCompleto, aviso: null }} />);

    expect(screen.getByText('AVISO')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Os produtos não ficam reservados ao serem adicionados ao carrinho. A disponibilidade será confirmada pela equipe.',
      ),
    ).toBeInTheDocument();
  });

  it('com aviso do CMS, o texto do CMS vence', () => {
    renderComProviders(
      <ComoFuncionaBloco
        bloco={{ ...blocoCompleto, aviso: 'Aviso customizado publicado no CMS.' }}
      />,
    );

    expect(screen.getByText('Aviso customizado publicado no CMS.')).toBeInTheDocument();
    expect(
      screen.queryByText(
        'Os produtos não ficam reservados ao serem adicionados ao carrinho. A disponibilidade será confirmada pela equipe.',
      ),
    ).not.toBeInTheDocument();
  });

  it('sem passos, não lança e o H2 continua', () => {
    expect(() =>
      renderComProviders(<ComoFuncionaBloco bloco={{ ...blocoCompleto, passos: null }} />),
    ).not.toThrow();
    expect(
      screen.getByRole('heading', { level: 2, name: 'Monte seu orçamento em quatro etapas' }),
    ).toBeInTheDocument();
  });

  it('sem violações de acessibilidade', async () => {
    const { container } = renderComProviders(<ComoFuncionaBloco bloco={blocoCompleto} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
