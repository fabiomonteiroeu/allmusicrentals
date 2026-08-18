'use client';

import styled from 'styled-components';
import { Container } from '@/components/primitives/Container';
import { Heading } from '@/components/primitives/Typography';
import { SectionDivider } from '@/components/feedback/SectionDivider';
import type { Bloco } from '@/lib/cms/adapters';

/**
 * Bloco 7 da Home — "Estrutura e suporte para seu evento", grade de 5 diferenciais.
 * Só recebe props e renderiza, sem estado local.
 *
 * `'use client'` (correção ao plano de execução, 04-07): rationale completo em HeroBloco.tsx —
 * `theme` de styled-components só resolve via Context dentro da árvore de Client Components.
 */

type BlocoDiferenciais = Extract<Bloco, { __component: 'blocos.diferenciais' }>;

const Secao = styled.section`
  background: ${({ theme }) => theme.cor.fundo};
`;

/*
  Fixo de propósito — o layout-fonte não usa padding fluido neste bloco (é o único da Home sem
  clamp de padding). Não "corrigir" para fluido. `Container` já aplica padding-left/right: 20px;
  aqui só sobrescrevemos o padding-block com o valor fixo de 64px.
*/
const Miolo = styled(Container)`
  padding-block: 64px;
`;

const TituloSecao = styled(Heading)`
  margin-bottom: ${({ theme }) => theme.espaco[32]};
`;

const Grade = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
  gap: 1px;
  background: ${({ theme }) => theme.cor.borda};
  border: 1px solid ${({ theme }) => theme.cor.borda};
  /*
    O efeito de divisórias finas vem do gap de 1px entre células sobre o fundo cinza da grade —
    as células não têm borda individual. Não trocar por border por célula, o resultado visual
    muda (bordas duplas).
  */
`;

const Celula = styled.div`
  background: ${({ theme }) => theme.cor.fundo};
  padding: ${({ theme }) => theme.espaco[24]};
`;

const TituloItem = styled.h3`
  margin: 0 0 8px;
  font-family: ${({ theme }) => theme.fonte.corpo};
  font-weight: ${({ theme }) => theme.peso.medio};
  font-size: ${({ theme }) => theme.tamanho[22]};
  line-height: 1.3;
  color: ${({ theme }) => theme.cor.tinta900};
`;

const TextoItem = styled.p`
  margin: 0;
  font-family: ${({ theme }) => theme.fonte.corpo};
  font-size: ${({ theme }) => theme.tamanho[15]};
  line-height: 1.5;
  color: ${({ theme }) => theme.cor.tinta600};
`;

export interface DiferenciaisBlocoProps {
  bloco: BlocoDiferenciais;
}

export function DiferenciaisBloco({ bloco }: DiferenciaisBlocoProps) {
  const itens = bloco.itens ?? [];

  return (
    <Secao>
      <Miolo>
        <TituloSecao as="h2" $nivel="h2">
          {bloco.titulo ?? 'Estrutura e suporte para seu evento'}
        </TituloSecao>

        <Grade>
          {itens.map((item, indice) => (
            <Celula key={`${indice}-${item.titulo}`}>
              <TituloItem>{item.titulo}</TituloItem>
              {item.texto && <TextoItem>{item.texto}</TextoItem>}
            </Celula>
          ))}
        </Grade>

        <SectionDivider $claro />
      </Miolo>
    </Secao>
  );
}
