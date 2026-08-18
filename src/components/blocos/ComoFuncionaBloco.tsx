'use client';

import styled from 'styled-components';
import { Container } from '@/components/primitives/Container';
import { Heading } from '@/components/primitives/Typography';
import { Notice } from '@/components/feedback/Notice';
import { SectionDivider } from '@/components/feedback/SectionDivider';
import type { Bloco } from '@/lib/cms/adapters';

/**
 * Bloco 6 da Home — "Monte seu orçamento em quatro etapas" + aviso de não-reserva.
 * Só recebe props e renderiza, sem estado local.
 *
 * `'use client'` (correção ao plano de execução, 04-07): rationale completo em HeroBloco.tsx —
 * `theme` de styled-components só resolve via Context dentro da árvore de Client Components.
 */

type BlocoComoFunciona = Extract<Bloco, { __component: 'blocos.como-funciona' }>;

const AVISO_PADRAO =
  'Os produtos não ficam reservados ao serem adicionados ao carrinho. A disponibilidade será confirmada pela equipe.';

const Secao = styled.section`
  background: ${({ theme }) => theme.cor.fundo};
`;

const Miolo = styled(Container)`
  padding-block: clamp(64px, 9vw, 144px);
`;

const TituloSecao = styled(Heading)`
  margin-bottom: ${({ theme }) => theme.espaco[40]};
`;

const Lista = styled.ol`
  list-style: none;
  margin: 0 0 40px;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: ${({ theme }) => theme.espaco[24]};
`;

const Passo = styled.li`
  border-top: 2px solid ${({ theme }) => theme.cor.tinta900};
  padding-top: ${({ theme }) => theme.espaco[20]};
`;

const Numero = styled.span`
  display: block;
  font-family: ${({ theme }) => theme.fonte.display};
  font-variation-settings: 'wdth' 75;
  font-weight: ${({ theme }) => theme.peso.display};
  font-size: 44px;
  line-height: 1;
  /* Cor de link sobre fundo claro — não confundir com o teal saturado das seções escuras. */
  color: ${({ theme }) => theme.cor.tealLink};
  margin-bottom: ${({ theme }) => theme.espaco[16]};
`;

const TituloPasso = styled.h3`
  margin: 0 0 8px;
  font-family: ${({ theme }) => theme.fonte.corpo};
  font-weight: ${({ theme }) => theme.peso.medio};
  font-size: ${({ theme }) => theme.tamanho[22]};
  line-height: 1.3;
  color: ${({ theme }) => theme.cor.tinta900};
`;

const TextoPasso = styled.p`
  margin: 0;
  font-family: ${({ theme }) => theme.fonte.corpo};
  font-size: ${({ theme }) => theme.tamanho[15]};
  line-height: 1.5;
  color: ${({ theme }) => theme.cor.tinta600};
`;

const AvisoWrapper = styled.div`
  max-width: 840px;
`;

export interface ComoFuncionaBlocoProps {
  bloco: BlocoComoFunciona;
}

export function ComoFuncionaBloco({ bloco }: ComoFuncionaBlocoProps) {
  const passos = bloco.passos ?? [];

  return (
    <Secao>
      <Miolo>
        <TituloSecao as="h2" $nivel="h2">
          {bloco.titulo ?? 'Monte seu orçamento em quatro etapas'}
        </TituloSecao>

        <Lista>
          {passos.map((passo, indice) => (
            <Passo key={`${indice}-${passo.titulo}`}>
              <Numero>{indice + 1}</Numero>
              <TituloPasso>{passo.titulo}</TituloPasso>
              {passo.texto && <TextoPasso>{passo.texto}</TextoPasso>}
            </Passo>
          ))}
        </Lista>

        {/*
          Nota de correção ao UI-SPEC (04-UI-SPEC.md, seção "Bloco 6"): o documento afirma que este
          aviso vem de `settings-globais`, mas o `settingsGlobaisSchema` real
          (src/lib/cms/schemas.ts linhas 53-65) não tem campo de microcopy legal — quem tem é
          `blocos.como-funciona.aviso` (schemas.ts linha 228, já preenchido no Strapi). A fonte
          correta é `bloco.aviso`, com o texto abaixo como fallback apenas se o CMS não trouxer
          nada. Não inventar campo novo no schema para "obedecer" a spec desatualizada.
        */}
        <AvisoWrapper>
          <Notice rotulo="AVISO" variante="padrao">
            {bloco.aviso ?? AVISO_PADRAO}
          </Notice>
        </AvisoWrapper>

        <SectionDivider $claro />
      </Miolo>
    </Secao>
  );
}
