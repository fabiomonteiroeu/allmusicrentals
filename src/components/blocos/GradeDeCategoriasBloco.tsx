import Image from 'next/image';
import Link from 'next/link';
import styled from 'styled-components';
import { Container } from '@/components/primitives/Container';
import { Eyebrow, Heading } from '@/components/primitives/Typography';
import { ImagePlaceholder } from '@/components/media/ImagePlaceholder';
import type { Bloco, Categoria } from '@/lib/cms/adapters';
import type { Locale } from '@/i18n/config';

/**
 * Bloco 3 da Home — Grade de categorias. Server Component puro (sem diretiva de cliente, sem
 * estado local): o CMS só entrega o cabeçalho da seção (`blocoGradeDeCategorias` usa
 * `cabecalhoDeSecao`); as categorias vêm por prop, buscadas por `page.tsx` via
 * `getCategorias(locale)`.
 */
export interface GradeDeCategoriasBlocoProps {
  bloco: Extract<Bloco, { __component: 'blocos.grade-de-categorias' }>;
  locale: Locale;
  categorias: Categoria[];
}

const Secao = styled.section`
  background: ${({ theme }) => theme.cor.fundo};
`;

const ConteudoWrapper = styled(Container)`
  padding-block: clamp(64px, 9vw, 144px);
`;

const TituloEl = styled(Heading)`
  margin-bottom: 12px;
`;

const Subtitulo = styled.p`
  margin: 0 0 40px;
  font-size: ${({ theme }) => theme.tamanho[17]};
  line-height: 1.55;
  color: ${({ theme }) => theme.cor.tinta600};
  max-width: 58ch;
`;

// --- Card-bandeira LED ------------------------------------------------------------------

const CardBandeira = styled(Link)`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  margin-bottom: 24px;
  background: ${({ theme }) => theme.cor.tinta900};
  color: ${({ theme }) => theme.cor.fundo};
  border: 1px solid ${({ theme }) => theme.cor.tinta900};
  border-radius: ${({ theme }) => theme.raio.base};
  overflow: hidden;
  text-decoration: none;
  &:hover {
    border-color: ${({ theme }) => theme.cor.teal};
  }
  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.cor.tealLink};
    outline-offset: 3px;
  }
`;

const FiguraBandeira = styled.div`
  position: relative;
  aspect-ratio: 16 / 9;
`;

const ConteudoBandeira = styled.div`
  padding: clamp(24px, 3vw, 40px);
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const DescricaoBandeira = styled.p`
  margin: 0;
  font-size: ${({ theme }) => theme.tamanho[17]};
  line-height: 1.5;
  color: ${({ theme }) => theme.cor.superficie200};
  max-width: 44ch;
`;

const LinkVerBandeira = styled.span`
  font-family: ${({ theme }) => theme.fonte.display};
  font-weight: ${({ theme }) => theme.peso.display};
  font-size: ${({ theme }) => theme.tamanho[15]};
  text-transform: uppercase;
  color: ${({ theme }) => theme.cor.teal};
  display: inline-flex;
  align-items: center;
  gap: 10px;
`;

export function GradeDeCategoriasBloco({ bloco, locale, categorias }: GradeDeCategoriasBlocoProps) {
  // Identificação por slug: não existe campo `destaque` no schema de categoria
  // (src/lib/cms/schemas.ts). A categoria telas-de-led recebe o tratamento de card-bandeira;
  // se ela não estiver publicada, o bloco renderiza só a grade padrão, sem buraco nem erro.
  const bandeira = categorias.find((c) => c.slug === 'telas-de-led');
  const padrao = categorias.filter((c) => !(c.slug === 'telas-de-led'));

  return (
    <Secao>
      <ConteudoWrapper>
        <Eyebrow>{bloco.eyebrow ?? 'Catálogo'}</Eyebrow>
        <TituloEl as="h2" $nivel="h2">
          {bloco.titulo ?? 'Explore nossas categorias'}
        </TituloEl>
        {bloco.subtitulo && <Subtitulo>{bloco.subtitulo}</Subtitulo>}

        {bandeira && (
          <CardBandeira href={`/${locale}/categoria/${bandeira.slug}`}>
            <FiguraBandeira>
              {bandeira.hero ? (
                <Image
                  src={bandeira.hero.url}
                  alt={bandeira.hero.alt}
                  fill
                  style={{ objectFit: 'cover' }}
                  sizes="(max-width: 760px) 100vw, 50vw"
                />
              ) : (
                <ImagePlaceholder legenda={`FOTO · ${bandeira.nome}`} ratio="16 / 9" />
              )}
            </FiguraBandeira>
            <ConteudoBandeira>
              <Eyebrow $sobreEscuro>Produto-bandeira</Eyebrow>
              {/* Nota de fidelidade (04-UI-SPEC.md): o layout-fonte usa clamp(28px,3vw,40px)
                  para este título; usamos o token h3 do tema (clamp(24px,2.8vw,30px)) em vez
                  de inventar um clamp novo — decisão já registrada na spec. */}
              <Heading as="h3" $nivel="h3">
                {bandeira.nome}
              </Heading>
              {bandeira.descricao && <DescricaoBandeira>{bandeira.descricao}</DescricaoBandeira>}
              <LinkVerBandeira>
                VER {bandeira.nome.toUpperCase()}
                <span aria-hidden="true">→</span>
              </LinkVerBandeira>
            </ConteudoBandeira>
          </CardBandeira>
        )}
      </ConteudoWrapper>
    </Secao>
  );
}
