'use client';

import styled from 'styled-components';
import { Container } from '@/components/primitives/Container';
import { Heading } from '@/components/primitives/Typography';
import { Notice } from '@/components/feedback/Notice';
import type { ReactNode } from 'react';

/**
 * Bloco 1 do UI-SPEC da Fase 5 (hero + card "SOBRE OS VALORES"). `'use client'` obrigatório
 * (D-06): declara `styled`, e `ThemeContext` só existe em Client Component (mesma lição da
 * Fase 4, `HeroBloco.tsx`).
 *
 * D5: `heroCols` do layout-fonte era calculado por JS de viewport
 * (`vw < 900 ? '1fr' : 'minmax(0,1.35fr) minmax(280px,0.9fr)'`) — vira `repeat(auto-fit,
 * minmax(280px, 1fr))` fixo em CSS, sem mismatch de hidratação nem CLS.
 *
 * O card "SOBRE OS VALORES" é a cópia literal do layout-fonte que justifica a ausência de
 * preço do produto (D-04) — não parafrasear, não encurtar.
 */

const TEXTO_SOBRE_VALORES =
  'Os preços não são exibidos online. Os valores dependem da quantidade, data, endereço, entrega, montagem e necessidades do evento.';

const Secao = styled.section`
  background: ${({ theme }) => theme.cor.tinta900};
  color: ${({ theme }) => theme.cor.fundo};
  padding-block: clamp(40px, 5vw, 72px);
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: clamp(24px, 3vw, 48px);
  align-items: start;
`;

const TituloEl = styled(Heading)`
  margin: 0 0 20px;
  text-wrap: balance;
`;

const Subtitulo = styled.p`
  margin: 0;
  font-size: ${({ theme }) => theme.fluido.corpoGrande};
  line-height: 1.55;
  color: ${({ theme }) => theme.cor.navInativo};
  max-width: 56ch;
`;

const BuscaWrapper = styled.div`
  margin-top: clamp(24px, 3vw, 40px);
  max-width: 640px;
`;

export interface HeroCatalogoProps {
  /**
   * O composto de busca (`BarraDeBuscaCatalogo`) entra como filho — este componente não
   * conhece `next/navigation`, só monta a árvore visual do hero.
   */
  busca: ReactNode;
}

export function HeroCatalogo({ busca }: HeroCatalogoProps) {
  return (
    <Secao>
      <Container>
        <Grid>
          <div>
            <TituloEl as="h1" $nivel="h1" $sobreEscuro>
              Catálogo de Produtos para Eventos
            </TituloEl>
            <Subtitulo>
              Navegue pelo catálogo, escolha os produtos e adicione os itens desejados ao seu
              orçamento.
            </Subtitulo>
          </div>
          <Notice rotulo="SOBRE OS VALORES" variante="escuro">
            {TEXTO_SOBRE_VALORES}
          </Notice>
        </Grid>
        <BuscaWrapper>{busca}</BuscaWrapper>
      </Container>
    </Secao>
  );
}
