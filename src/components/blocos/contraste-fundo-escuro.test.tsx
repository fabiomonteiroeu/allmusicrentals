import { renderComProviders, screen } from '@/test-utils';
import { HeroBloco, type HeroBlocoProps } from './HeroBloco';
import { DestaqueLedBloco, type DestaqueLedBlocoProps } from './DestaqueLedBloco';
import { ChamadaFinalBloco, type ChamadaFinalBlocoProps } from './ChamadaFinalBloco';
import { GradeDeCategoriasBloco, type GradeDeCategoriasBlocoProps } from './GradeDeCategoriasBloco';
import type { Categoria } from '@/lib/cms/adapters';

jest.mock('@/lib/analytics/dataLayer');

/**
 * Guarda de contraste dos 4 headings sobre seção de fundo escuro (tinta900).
 *
 * Regressão real encontrada no checkpoint de fidelidade do plano 04-07: `Heading` tinha a cor
 * fixa em `theme.cor.tinta900`, então qualquer título renderizado dentro de uma seção com
 * `background: theme.cor.tinta900` (Hero, card-bandeira LED, Painéis de LED, CTA final) ficava
 * com contraste 1.00 — texto literalmente invisível. `jest-axe`/`axe-core` não pega isso em
 * jsdom (a regra `color-contrast` do axe precisa de renderização visual real, que o jsdom não
 * fornece — fica "incomplete", nunca "violation"). Por isso este teste compara a cor computada
 * do heading contra a cor de fundo computada da seção/cartão escuro que o envolve, usando
 * `getComputedStyle` (que resolve o CSS real injetado pelo styled-components mesmo em jsdom).
 *
 * Extensão E7 (04-07-SUMMARY.md): `Heading` ganhou a prop `$sobreEscuro`, no mesmo padrão da
 * E1 (`Eyebrow`) — sem ela nos 4 pontos de uso abaixo, este teste falha.
 */

const FUNDO_CLARO = 'rgb(241, 242, 242)'; // theme.cor.fundo (#F1F2F2)
const TINTA_900 = 'rgb(11, 12, 13)'; // theme.cor.tinta900 (#0B0C0D)

describe('Contraste dos headings sobre seção de fundo escuro', () => {
  it('HeroBloco: o H1 não fica com a mesma cor do fundo da seção', () => {
    const bloco: HeroBlocoProps['bloco'] = {
      __component: 'blocos.hero',
      id: 1,
      titulo: 'O palco é seu. Nós levamos a estrutura.',
    };
    const { container } = renderComProviders(<HeroBloco bloco={bloco} locale="pt-BR" />);

    const titulo = screen.getByRole('heading', { level: 1 });
    const secao = container.querySelector('section');
    expect(secao).not.toBeNull();

    const corTitulo = getComputedStyle(titulo).color;
    const corFundo = getComputedStyle(secao as Element).backgroundColor;

    expect(corFundo).toBe(TINTA_900);
    expect(corTitulo).toBe(FUNDO_CLARO);
    expect(corTitulo).not.toBe(corFundo);
  });

  it('DestaqueLedBloco: o H2 não fica com a mesma cor do fundo da seção', () => {
    const bloco: DestaqueLedBlocoProps['bloco'] = {
      __component: 'blocos.destaque-led',
      id: 1,
      titulo: 'Painéis de LED para transformar seu evento',
    };
    const { container } = renderComProviders(<DestaqueLedBloco bloco={bloco} locale="pt-BR" />);

    const titulo = screen.getByRole('heading', { level: 2 });
    const secao = container.querySelector('section');
    expect(secao).not.toBeNull();

    const corTitulo = getComputedStyle(titulo).color;
    const corFundo = getComputedStyle(secao as Element).backgroundColor;

    expect(corFundo).toBe(TINTA_900);
    expect(corTitulo).toBe(FUNDO_CLARO);
    expect(corTitulo).not.toBe(corFundo);
  });

  it('ChamadaFinalBloco: o H2 não fica com a mesma cor do fundo da seção', () => {
    const bloco: ChamadaFinalBlocoProps['bloco'] = {
      __component: 'blocos.chamada-final',
      id: 1,
      titulo: 'Comece a montar seu evento',
    };
    const { container } = renderComProviders(<ChamadaFinalBloco bloco={bloco} locale="pt-BR" />);

    const titulo = screen.getByRole('heading', { level: 2 });
    const secao = container.querySelector('section');
    expect(secao).not.toBeNull();

    const corTitulo = getComputedStyle(titulo).color;
    const corFundo = getComputedStyle(secao as Element).backgroundColor;

    expect(corFundo).toBe(TINTA_900);
    expect(corTitulo).toBe(FUNDO_CLARO);
    expect(corTitulo).not.toBe(corFundo);
  });

  it('GradeDeCategoriasBloco: o H3 do card-bandeira LED não fica com a mesma cor do próprio card', () => {
    const bloco: GradeDeCategoriasBlocoProps['bloco'] = {
      __component: 'blocos.grade-de-categorias',
      id: 1,
    };
    const bandeira: Categoria = {
      id: 1,
      slug: 'telas-de-led',
      nome: 'Telas de LED',
      descricao: 'Painéis de LED para eventos.',
      subcategorias: [],
      hero: null,
      ordem: 0,
      produtos: [],
      seo: null,
    };
    renderComProviders(
      <GradeDeCategoriasBloco bloco={bloco} locale="pt-BR" categorias={[bandeira]} />,
    );

    const titulo = screen.getByRole('heading', { level: 3, name: 'Telas de LED' });
    // O card-bandeira (`<a>` com `background: theme.cor.tinta900`) é o ancestral mais próximo
    // com cor de fundo própria — não a <section> da grade inteira, que é clara.
    const card = titulo.closest('a');
    expect(card).not.toBeNull();

    const corTitulo = getComputedStyle(titulo).color;
    const corFundo = getComputedStyle(card as Element).backgroundColor;

    expect(corFundo).toBe(TINTA_900);
    expect(corTitulo).toBe(FUNDO_CLARO);
    expect(corTitulo).not.toBe(corFundo);
  });
});
