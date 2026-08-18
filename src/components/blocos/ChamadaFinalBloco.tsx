import styled from 'styled-components';
import { Container } from '@/components/primitives/Container';
import { SectionDivider } from '@/components/feedback/SectionDivider';
import { Heading } from '@/components/primitives/Typography';
import { Button } from '@/components/primitives/Button';
import type { Bloco } from '@/lib/cms/adapters';
import type { Locale } from '@/i18n/config';

/**
 * Bloco 9 da Home — Chamada final. Server Component puro, mesma família visual do
 * HeroBloco (seção escura, mesmo contrato de props `{ bloco, locale }`).
 *
 * Este bloco NÃO fecha com divisor de rodapé: o `Footer` que vem logo em seguida já abre
 * com a própria borda superior (chrome da Fase 2) — não duplicar o divisor aqui.
 */

export interface ChamadaFinalBlocoProps {
  bloco: Extract<Bloco, { __component: 'blocos.chamada-final' }>;
  locale: Locale;
}

const Secao = styled.section`
  background: ${({ theme }) => theme.cor.tinta900};
  color: ${({ theme }) => theme.cor.fundo};
`;

const ConteudoWrapper = styled(Container)`
  padding-block: clamp(64px, 9vw, 144px);
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 40px;
  align-items: end;
`;

const TituloEl = styled(Heading)`
  margin-bottom: 16px;
`;

const Subtitulo = styled.p`
  margin: 0;
  font-size: ${({ theme }) => theme.tamanho[17]};
  line-height: 1.55;
  color: ${({ theme }) => theme.cor.superficie200};
  max-width: 52ch;
`;

const CtaGrupo = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
`;

const TITULO_PADRAO = 'Comece a montar seu evento';
const SUBTITULO_PADRAO =
  'Explore o catálogo, selecione os produtos e envie sua solicitação para nossa equipe.';

export function ChamadaFinalBloco({ bloco, locale }: ChamadaFinalBlocoProps) {
  // CTA 1: no layout-fonte é a âncora #destaques (rola até o slider da própria Home).
  // Decisão travada em 04-CONTEXT.md ("CTAs apontam para as rotas finais, mesmo antes de
  // existirem") manda usar a rota real do catálogo, mesmo antes da Fase 5 existir.
  const hrefPrimario = bloco.ctaPrimarioUrl ?? `/${locale}/catalogo`;
  const hrefSecundario = bloco.ctaSecundarioUrl ?? `/${locale}/solicitar-orcamento`;

  return (
    <Secao>
      <SectionDivider />
      <ConteudoWrapper>
        <Grid>
          <div>
            <TituloEl as="h2" $nivel="h2">
              {bloco.titulo ?? TITULO_PADRAO}
            </TituloEl>
            <Subtitulo>{bloco.subtitulo ?? SUBTITULO_PADRAO}</Subtitulo>
          </div>
          <CtaGrupo>
            <Button as="a" href={hrefPrimario} $variante="outlineClaro" $tamanho="lg">
              {bloco.ctaPrimarioRotulo ?? 'VER TODOS OS PRODUTOS'}
            </Button>
            <Button as="a" href={hrefSecundario} $variante="primario" $tamanho="lg">
              {bloco.ctaSecundarioRotulo ?? 'SOLICITAR ORÇAMENTO'}
            </Button>
          </CtaGrupo>
        </Grid>
      </ConteudoWrapper>
    </Secao>
  );
}
