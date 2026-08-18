'use client';

import Image from 'next/image';
import styled from 'styled-components';
import { Container } from '@/components/primitives/Container';
import { SectionDivider } from '@/components/feedback/SectionDivider';
import { Eyebrow, Heading } from '@/components/primitives/Typography';
import { Button } from '@/components/primitives/Button';
import { ImagePlaceholder } from '@/components/media/ImagePlaceholder';
import type { Bloco } from '@/lib/cms/adapters';
import type { Locale } from '@/i18n/config';

/**
 * Bloco 5 da Home — Painéis de LED. Sem estado local próprio: só recebe props e monta a seção.
 * Mesma família visual do Hero (04-03) — seção escura com `Eyebrow $sobreEscuro`.
 *
 * `'use client'` (correção ao plano de execução, 04-07): rationale completo em HeroBloco.tsx —
 * `theme` de styled-components só resolve via Context dentro da árvore de Client Components.
 */

export interface DestaqueLedBlocoProps {
  bloco: Extract<Bloco, { __component: 'blocos.destaque-led' }>;
  locale: Locale;
}

const Secao = styled.section`
  background: ${({ theme }) => theme.cor.tinta900};
  color: ${({ theme }) => theme.cor.fundo};
`;

const Wrapper = styled(Container)`
  padding-block: clamp(72px, 10vw, 144px);
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: clamp(32px, 5vw, 64px);
  align-items: start;
`;

const ColunaTexto = styled.div``;

const EyebrowEl = styled(Eyebrow)`
  margin-bottom: 16px;
`;

const TituloEl = styled(Heading)`
  margin-bottom: 20px;
`;

/* Cor e margem alternam pelo índice do parágrafo — é assim no layout-fonte, não é estética
   inventada: o primeiro parágrafo é mais claro (superficie200) e os seguintes usam o cinza
   secundário (textoMutedClaro), com espaçamento maior entre eles. */
const Paragrafo = styled.p<{ $primeiro?: boolean }>`
  margin: 0 0 ${({ $primeiro }) => ($primeiro ? '16px' : '32px')};
  font-size: ${({ theme }) => theme.tamanho[17]};
  line-height: 1.55;
  max-width: 52ch;
  color: ${({ theme, $primeiro }) =>
    $primeiro ? theme.cor.superficie200 : theme.cor.textoMutedClaro};
`;

const GridPixelPitch = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 16px;
  margin-bottom: 32px;
`;

const CardPixelPitch = styled.div`
  border: 1px solid ${({ theme }) => theme.cor.teal};
  background: ${({ theme }) => theme.cor.tinta800};
  padding: 20px;
  border-radius: ${({ theme }) => theme.raio.base};
`;

const RotuloPixelPitch = styled.p`
  margin: 0 0 8px;
  font-family: ${({ theme }) => theme.fonte.mono};
  font-weight: ${({ theme }) => theme.peso.medio};
  font-size: ${({ theme }) => theme.tamanho[12]};
  line-height: 1;
  letter-spacing: ${({ theme }) => theme.tracking.rotuloForte};
  color: ${({ theme }) => theme.cor.teal};
`;

const ValorPixelPitch = styled.p`
  margin: 0 0 6px;
  font-family: ${({ theme }) => theme.fonte.display};
  font-variation-settings: 'wdth' 75;
  font-weight: ${({ theme }) => theme.peso.display};
  font-size: 34px;
  line-height: 1;
`;

const SufixoMm = styled.span`
  font-size: ${({ theme }) => theme.tamanho[20]};
`;

const LegendaPixelPitch = styled.p`
  margin: 0;
  font-size: ${({ theme }) => theme.tamanho[15]};
  line-height: 1.4;
  color: ${({ theme }) => theme.cor.textoMutedClaro};
`;

/* Conteúdo de design, não do CMS: `blocos.destaque-led` não tem campo de pixel pitch no schema
   (confirmado em `src/lib/cms/schemas.ts`). Os dois valores são fixos, como no layout-fonte. */
const PIXEL_PITCH = [
  { valor: 'P1.9', legenda: 'Painéis P1.9mm' },
  { valor: 'P3.9', legenda: 'Painéis P3.9mm' },
] as const;

const GridListas = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 24px 32px;
  margin-bottom: 40px;
`;

const RotuloColuna = styled.p`
  margin: 0 0 12px;
  font-family: ${({ theme }) => theme.fonte.mono};
  font-size: ${({ theme }) => theme.tamanho[12]};
  line-height: 1;
  letter-spacing: ${({ theme }) => theme.tracking.rotuloForte};
  color: ${({ theme }) => theme.cor.textoMutedClaro};
  border-bottom: 1px solid ${({ theme }) => theme.cor.tinta700};
  padding-bottom: 8px;
`;

const Lista = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 10px;
`;

const ItemLista = styled.li`
  display: flex;
  gap: 10px;
  align-items: baseline;
  font-size: ${({ theme }) => theme.tamanho[17]};
  line-height: 1.4;
  color: ${({ theme }) => theme.cor.superficie200};
`;

const Marcador = styled.span`
  flex: none;
  width: 6px;
  height: 6px;
  background: ${({ theme }) => theme.cor.teal};
`;

const Galeria = styled.div`
  display: grid;
  gap: 2px;
  grid-template-columns: 1fr 1fr;
  background: ${({ theme }) => theme.cor.tinta900};
`;

const PosicaoLarga = styled.div`
  position: relative;
  overflow: hidden;
  grid-column: span 2;
  aspect-ratio: 16 / 10;
`;

const PosicaoQuadrada = styled.div`
  position: relative;
  overflow: hidden;
  aspect-ratio: 1 / 1;
`;

export function DestaqueLedBloco({ bloco, locale }: DestaqueLedBlocoProps) {
  const textos = bloco.textos ?? [];
  const instalamos = bloco.instalamos ?? [];
  const exibimos = bloco.exibimos ?? [];
  const colunas = [
    { titulo: 'O QUE INSTALAMOS', itens: instalamos },
    { titulo: 'O QUE EXIBIMOS', itens: exibimos },
  ].filter((coluna) => coluna.itens.length > 0);

  // Sempre 3 posições na galeria: as 3 primeiras imagens do bloco, nesta ordem exata (larga,
  // quadrada, quadrada). Sem imagem cadastrada, cada posição vira um placeholder — nunca reduz
  // a grade nem inventa foto.
  const imagens = bloco.imagens ?? [];
  const imagemLarga = imagens[0];
  const imagemQuadrada1 = imagens[1];
  const imagemQuadrada2 = imagens[2];

  // No layout-fonte o CTA aponta para uma âncora interna que não existe em nenhum lugar da
  // página (link morto já no original). Decisão: usar a rota real de categoria em vez de
  // reproduzir o link morto.
  const hrefCta = bloco.ctaUrl ?? `/${locale}/categoria/telas-de-led`;

  return (
    <Secao>
      <SectionDivider />
      <Wrapper>
        <Grid>
          <ColunaTexto>
            <EyebrowEl $sobreEscuro>{bloco.eyebrow ?? 'Painéis de LED'}</EyebrowEl>
            <TituloEl as="h2" $nivel="h2">
              {bloco.titulo ?? 'Painéis de LED para transformar seu evento'}
            </TituloEl>

            {textos.map((texto, i) => (
              <Paragrafo key={i} $primeiro={i === 0}>
                {texto}
              </Paragrafo>
            ))}

            <GridPixelPitch>
              {PIXEL_PITCH.map((pp) => (
                <CardPixelPitch key={pp.valor}>
                  <RotuloPixelPitch>PIXEL PITCH</RotuloPixelPitch>
                  <ValorPixelPitch>
                    {pp.valor}
                    <SufixoMm>mm</SufixoMm>
                  </ValorPixelPitch>
                  <LegendaPixelPitch>{pp.legenda}</LegendaPixelPitch>
                </CardPixelPitch>
              ))}
            </GridPixelPitch>

            {colunas.length > 0 && (
              <GridListas>
                {colunas.map((coluna) => (
                  <div key={coluna.titulo}>
                    <RotuloColuna>{coluna.titulo}</RotuloColuna>
                    <Lista>
                      {coluna.itens.map((item) => (
                        <ItemLista key={item}>
                          <Marcador aria-hidden="true" />
                          {item}
                        </ItemLista>
                      ))}
                    </Lista>
                  </div>
                ))}
              </GridListas>
            )}

            <Button as="a" href={hrefCta} $variante="primario" $tamanho="lg">
              {bloco.ctaRotulo ?? 'CONHECER NOSSAS SOLUÇÕES EM LED'}
            </Button>
          </ColunaTexto>

          <Galeria>
            <PosicaoLarga>
              {imagemLarga?.url ? (
                <Image
                  src={imagemLarga.url}
                  alt={imagemLarga.alternativeText ?? 'Painel de LED'}
                  fill
                  style={{ objectFit: 'cover' }}
                  sizes="(max-width: 760px) 100vw, 50vw"
                />
              ) : (
                <ImagePlaceholder legenda="FOTO · PAINEL DE LED" ratio="16 / 10" />
              )}
            </PosicaoLarga>
            <PosicaoQuadrada>
              {imagemQuadrada1?.url ? (
                <Image
                  src={imagemQuadrada1.url}
                  alt={imagemQuadrada1.alternativeText ?? 'Painel de LED'}
                  fill
                  style={{ objectFit: 'cover' }}
                  sizes="(max-width: 760px) 100vw, 50vw"
                />
              ) : (
                <ImagePlaceholder legenda="FOTO · PAINEL DE LED" ratio="1 / 1" />
              )}
            </PosicaoQuadrada>
            <PosicaoQuadrada>
              {imagemQuadrada2?.url ? (
                <Image
                  src={imagemQuadrada2.url}
                  alt={imagemQuadrada2.alternativeText ?? 'Painel de LED'}
                  fill
                  style={{ objectFit: 'cover' }}
                  sizes="(max-width: 760px) 100vw, 50vw"
                />
              ) : (
                <ImagePlaceholder legenda="FOTO · PAINEL DE LED" ratio="1 / 1" />
              )}
            </PosicaoQuadrada>
          </Galeria>
        </Grid>
      </Wrapper>
      <SectionDivider />
    </Secao>
  );
}
