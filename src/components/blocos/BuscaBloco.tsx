import styled from 'styled-components';
import { Container } from '@/components/primitives/Container';
import { SectionDivider } from '@/components/feedback/SectionDivider';
import { Heading } from '@/components/primitives/Typography';
import { SearchBarGrande } from './SearchBarGrande';
import type { Bloco } from '@/lib/cms/adapters';
import type { Locale } from '@/i18n/config';

/** Bloco 2 da Home — Busca grande. Server Component: só compõe cabeçalho + SearchBarGrande. */
export interface BuscaBlocoProps {
  bloco: Extract<Bloco, { __component: 'blocos.busca' }>;
  locale: Locale;
}

const Secao = styled.section`
  background: ${({ theme }) => theme.cor.fundo};
`;

const ConteudoWrapper = styled(Container)`
  padding-block: clamp(48px, 6vw, 64px);
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 32px;
  align-items: end;
`;

const TituloEl = styled(Heading)`
  margin-bottom: 12px;
`;

const Subtitulo = styled.p`
  margin: 0;
  font-size: ${({ theme }) => theme.tamanho[17]};
  line-height: 1.55;
  /* Nota de fidelidade (04-UI-SPEC.md): cor explícita tinta600, não o primitivo de corpo com
     variante intermediária (que aponta para textoMid, um cinza diferente do usado aqui). */
  color: ${({ theme }) => theme.cor.tinta600};
  max-width: 52ch;
`;

const GridComMargem = styled(Grid)`
  margin-bottom: 48px;
`;

export function BuscaBloco({ bloco, locale }: BuscaBlocoProps) {
  return (
    <Secao>
      <ConteudoWrapper>
        <GridComMargem>
          <div>
            <TituloEl as="h2" $nivel="h2">
              {bloco.titulo ?? 'Encontre o que seu evento precisa'}
            </TituloEl>
            {bloco.subtitulo && <Subtitulo>{bloco.subtitulo}</Subtitulo>}
          </div>
          <SearchBarGrande locale={locale} placeholder={bloco.placeholder} />
        </GridComMargem>
        <SectionDivider $claro />
      </ConteudoWrapper>
    </Secao>
  );
}
