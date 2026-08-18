'use client';

import styled from 'styled-components';
import { Container } from '@/components/primitives/Container';
import { Eyebrow, Heading } from '@/components/primitives/Typography';
import { SliderDeProdutos } from './SliderDeProdutos';
import type { Bloco, Produto } from '@/lib/cms/adapters';
import type { Locale } from '@/i18n/config';

/**
 * Bloco 4 da Home — Produtos em destaque. Só recebe props e monta o cabeçalho da seção; toda a
 * interação do slider (setas, contador, scroll) vive em `SliderDeProdutos`.
 *
 * A lista de produtos vem por prop (`produtos`), não do CMS: `blocoProdutosEmDestaque` só
 * carrega `cabecalhoDeSecao` (eyebrow/titulo/subtitulo) — quem busca os 5 produtos de destaque
 * é a página, via `getProdutos(locale, { destaque: true })`.
 *
 * `'use client'` (correção ao plano de execução, 04-07): rationale completo em HeroBloco.tsx —
 * `theme` de styled-components só resolve via Context dentro da árvore de Client Components.
 */

export interface ProdutosEmDestaqueBlocoProps {
  bloco: Extract<Bloco, { __component: 'blocos.produtos-em-destaque' }>;
  locale: Locale;
  produtos: Produto[];
}

const Secao = styled.section`
  background: ${({ theme }) => theme.cor.fundo};
`;

const Wrapper = styled(Container)`
  padding-block: clamp(56px, 7vw, 96px);
`;

const TituloEl = styled(Heading)`
  margin-bottom: 12px;
`;

export function ProdutosEmDestaqueBloco({ bloco, locale, produtos }: ProdutosEmDestaqueBlocoProps) {
  return (
    <Secao>
      <Wrapper>
        <Eyebrow>{bloco.eyebrow ?? 'Seleção'}</Eyebrow>
        <TituloEl as="h2" $nivel="h2">
          {bloco.titulo ?? 'Produtos em destaque'}
        </TituloEl>
        <SliderDeProdutos produtos={produtos} locale={locale} subtitulo={bloco.subtitulo} />
      </Wrapper>
      {/* Sem SectionDivider aqui: no layout-fonte, o Bloco 5 (painéis de LED) já abre com o
          próprio divisor escuro — um segundo divisor entre os dois seria redundante. */}
    </Secao>
  );
}
