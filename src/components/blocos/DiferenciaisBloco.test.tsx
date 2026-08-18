import { axe } from 'jest-axe';
import { renderComProviders, screen } from '@/test-utils';
import { DiferenciaisBloco } from './DiferenciaisBloco';
import type { Bloco } from '@/lib/cms/adapters';

type BlocoDiferenciais = Extract<Bloco, { __component: 'blocos.diferenciais' }>;

const blocoCompleto: BlocoDiferenciais = {
  __component: 'blocos.diferenciais',
  titulo: 'Estrutura e suporte para seu evento',
  itens: [
    { titulo: 'Produtos e equipamentos', texto: 'Equipamentos selecionados para eventos.' },
    { titulo: 'Atendimento personalizado', texto: 'Cada solicitação é analisada individualmente.' },
    { titulo: 'Entrega e montagem', texto: 'Entrega, instalação, desmontagem e retirada.' },
    { titulo: 'Suporte técnico', texto: 'Soluções técnicas para painéis de LED.' },
    { titulo: 'Atendimento em diferentes regiões', texto: 'Atendimento em cidades selecionadas.' },
  ],
};

describe('DiferenciaisBloco', () => {
  it('com 5 itens, os 5 títulos aparecem', () => {
    renderComProviders(<DiferenciaisBloco bloco={blocoCompleto} />);

    blocoCompleto.itens!.forEach((item) => {
      expect(screen.getByText(item.titulo)).toBeInTheDocument();
    });
  });

  it('sem itens, não lança', () => {
    expect(() =>
      renderComProviders(<DiferenciaisBloco bloco={{ ...blocoCompleto, itens: null }} />),
    ).not.toThrow();
    expect(
      screen.getByRole('heading', { level: 2, name: 'Estrutura e suporte para seu evento' }),
    ).toBeInTheDocument();
  });

  it('sem violações de acessibilidade', async () => {
    const { container } = renderComProviders(<DiferenciaisBloco bloco={blocoCompleto} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
