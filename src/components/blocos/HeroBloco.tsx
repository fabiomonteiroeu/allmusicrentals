'use client';

import styled from 'styled-components';
import { Container } from '@/components/primitives/Container';
import { SectionDivider } from '@/components/feedback/SectionDivider';
import { Eyebrow, Heading } from '@/components/primitives/Typography';
import { Button } from '@/components/primitives/Button';
import type { Bloco } from '@/lib/cms/adapters';
import type { Locale } from '@/i18n/config';

/**
 * Bloco 1 da Home — Hero. Sem estado local (nenhum `useState`/efeito próprio): o mosaico
 * decorativo é 100% CSS, a contagem de células é fixa (12×6, não depende de viewport) e o
 * `prefers-reduced-motion` global (GlobalStyle.ts) já zera a duração e o atraso de qualquer
 * animação — por isso não há checagem de preferência de movimento agendando nada em tempo de
 * execução aqui.
 *
 * `'use client'` (correção ao plano de execução, 04-07): styled-components resolve `theme` via
 * React Context, e Context só existe na árvore de Client Components — em Server Component puro,
 * `useContext` do ThemeContext devolve `undefined` (confirmado em runtime: `theme.cor` lançava
 * "Cannot read properties of undefined"). Nenhum dos 9 blocos que definem `styled.*` diretamente
 * pode ficar sem esta diretiva enquanto usar styled-components — ver docs/adr/001-styled-components.md
 * regra 3 ("componentes estilizados ficam nas folhas", ou seja, em Client Components).
 */

const COLUNAS = 12;
const LINHAS = 6;

interface CelulaMosaico {
  chave: string;
  posX: number;
  posY: number;
  delay: string;
}

/** Gera as 72 células do mosaico (12×6), com posição e atraso em cascata do layout-fonte. */
function gerarCelulas(): CelulaMosaico[] {
  const celulas: CelulaMosaico[] = [];
  for (let r = 0; r < LINHAS; r++) {
    for (let c = 0; c < COLUNAS; c++) {
      const posX = (c / (COLUNAS - 1)) * 100;
      const posY = (r / (LINHAS - 1)) * 100;
      const delay = ((r + c) * 0.045 + 0.15).toFixed(3);
      celulas.push({ chave: `${r}-${c}`, posX, posY, delay });
    }
  }
  return celulas;
}

export interface HeroBlocoProps {
  bloco: Extract<Bloco, { __component: 'blocos.hero' }>;
  locale: Locale;
}

const Secao = styled.section`
  position: relative;
  overflow: hidden;
  background: ${({ theme }) => theme.cor.tinta900};
  color: ${({ theme }) => theme.cor.fundo};
`;

/** Grade decorativa do mosaico — contagem fixa 12×6, nunca calculada a partir da largura da tela. */
const Mosaico = styled.div`
  position: absolute;
  inset: 0;
  z-index: 0;
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  grid-template-rows: repeat(6, 1fr);
  gap: 2px;
  background: ${({ theme }) => theme.cor.tinta900};
`;

const Celula = styled.div<{ $src: string; $posX: number; $posY: number; $delay: string }>`
  background-image: url(${({ $src }) => $src});
  background-size: 1200% 600%;
  background-position: ${({ $posX, $posY }) => `${$posX}% ${$posY}%`};
  animation: amrMod 0.34s ease-out both;
  animation-delay: ${({ $delay }) => $delay}s;
`;

const Scrim = styled.div`
  position: absolute;
  inset: 0;
  z-index: 0;
  background: linear-gradient(
    100deg,
    rgba(11, 12, 13, 0.96) 0%,
    rgba(11, 12, 13, 0.88) 40%,
    rgba(11, 12, 13, 0.66) 62%,
    rgba(11, 12, 13, 0.4) 80%,
    rgba(11, 12, 13, 0.12) 100%
  );
`;

const ConteudoWrapper = styled(Container)`
  position: relative;
  z-index: 1;
  padding-block: clamp(64px, 9vw, 144px);
`;

const ColunaConteudo = styled.div`
  max-width: 640px;
`;

const EyebrowEl = styled(Eyebrow)`
  margin-bottom: 20px;
`;

const TituloEl = styled(Heading)`
  margin-bottom: 24px;
  text-wrap: balance;
`;

const Subtitulo = styled.p`
  margin: 0 0 20px;
  font-size: ${({ theme }) => theme.fluido.corpoGrande};
  line-height: 1.55;
  color: ${({ theme }) => theme.cor.navInativo};
  max-width: 52ch;
`;

const Citacao = styled.p`
  margin: 0 0 32px;
  border-left: 2px solid ${({ theme }) => theme.cor.teal};
  padding-left: 16px;
  font-size: ${({ theme }) => theme.tamanho[15]};
  line-height: 1.5;
  color: ${({ theme }) => theme.cor.navInativo};
  max-width: 52ch;
`;

const CtaGrupo = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
`;

const LegendaVideo = styled.p`
  margin: 32px 0 0;
  font-family: ${({ theme }) => theme.fonte.mono};
  font-size: ${({ theme }) => theme.tamanho[13]};
  line-height: 1.4;
  letter-spacing: ${({ theme }) => theme.tracking.rotulo};
  color: ${({ theme }) => theme.cor.textoMutedClaro};
`;

export function HeroBloco({ bloco, locale }: HeroBlocoProps) {
  const imagemUrl = bloco.imagem?.url;
  const celulas = imagemUrl ? gerarCelulas() : [];

  const hrefPrimario = bloco.ctaPrimarioUrl ?? `/${locale}/catalogo`;
  const hrefSecundario = bloco.ctaSecundarioUrl ?? `/${locale}/solicitar-orcamento`;

  return (
    <Secao>
      {imagemUrl && (
        <>
          <Mosaico aria-hidden="true">
            {celulas.map((celula) => (
              <Celula
                key={celula.chave}
                data-testid="mosaico-celula"
                $src={imagemUrl}
                $posX={celula.posX}
                $posY={celula.posY}
                $delay={celula.delay}
              />
            ))}
          </Mosaico>
          <Scrim aria-hidden="true" />
        </>
      )}
      <ConteudoWrapper>
        <ColunaConteudo>
          {bloco.eyebrow && <EyebrowEl $sobreEscuro>{bloco.eyebrow}</EyebrowEl>}
          <TituloEl as="h1" $nivel="h1" $sobreEscuro>
            {bloco.titulo}
          </TituloEl>
          {bloco.subtitulo && <Subtitulo>{bloco.subtitulo}</Subtitulo>}
          {bloco.citacao && <Citacao>{bloco.citacao}</Citacao>}
          <CtaGrupo>
            <Button as="a" href={hrefPrimario} $variante="primario" $tamanho="lg">
              {bloco.ctaPrimarioRotulo ?? 'EXPLORAR CATÁLOGO'}
            </Button>
            <Button as="a" href={hrefSecundario} $variante="outlineClaro" $tamanho="lg">
              {bloco.ctaSecundarioRotulo ?? 'SOLICITAR ORÇAMENTO'}
            </Button>
          </CtaGrupo>
          <LegendaVideo>VÍDEO · PALCO COM PAINEL DE LED · 16:9</LegendaVideo>
        </ColunaConteudo>
      </ConteudoWrapper>
      <SectionDivider />
    </Secao>
  );
}
