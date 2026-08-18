import styled from 'styled-components';
import { Container } from '@/components/primitives/Container';
import { Heading, Eyebrow } from '@/components/primitives/Typography';
import { Button } from '@/components/primitives/Button';
import { SectionDivider } from '@/components/feedback/SectionDivider';
import { SkeletonBar } from '@/components/feedback/Skeleton';
import type { Bloco, Avaliacao } from '@/lib/cms/adapters';
import type { Locale } from '@/i18n/config';

/**
 * Bloco 8 da Home — Avaliações, com os estados "cheio" e "vazio".
 * Server Component: só recebe props e renderiza, sem estado local.
 *
 * Regra inviolável: nunca semear nem renderizar depoimento fictício. Com o CMS recém-instalado
 * e sem avaliação publicada, o estado vazio é o que o visitante vê de fato — por isso recebe a
 * mesma especificação detalhada do estado cheio, não um tratamento secundário.
 */

type BlocoAvaliacoes = Extract<Bloco, { __component: 'blocos.avaliacoes' }>;

// ---------------------------------------------------------------------------
// Cabeçalho comum aos dois estados
// ---------------------------------------------------------------------------

const Secao = styled.section`
  background: ${({ theme }) => theme.cor.fundo};
`;

const Miolo = styled(Container)`
  padding-block: clamp(56px, 7vw, 96px);
`;

const EyebrowSecao = styled(Eyebrow)`
  margin-bottom: ${({ theme }) => theme.espaco[16]};
`;

const TituloSecao = styled(Heading)`
  margin-bottom: ${({ theme }) => theme.espaco[12]};
`;

const Subtitulo = styled.p`
  margin: 0 0 32px;
  font-family: ${({ theme }) => theme.fonte.corpo};
  font-size: ${({ theme }) => theme.tamanho[17]};
  line-height: 1.55;
  color: ${({ theme }) => theme.cor.tinta600};
  max-width: 58ch;
`;

// ---------------------------------------------------------------------------
// Estado cheio
// ---------------------------------------------------------------------------

const Grade = styled.div`
  display: grid;
  /*
    Decisão Q1 (04-UI-SPEC.md), aplicada aqui igual ao Bloco 3: o layout-fonte usava uma grade de
    4 colunas calculada em JS a partir da largura da janela; substituída por auto-fit, sem media
    query nova e sem JS baseado em viewport. Custo de ±1 coluna em larguras intermediárias,
    registrado como divergência D3 no plano 04-07.
  */
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: ${({ theme }) => theme.espaco[24]};
`;

const Card = styled.figure`
  margin: 0;
  background: ${({ theme }) => theme.cor.branco};
  border: 1px solid ${({ theme }) => theme.cor.borda};
  border-radius: ${({ theme }) => theme.raio.base};
  padding: ${({ theme }) => theme.espaco[24]};
  display: flex;
  flex-direction: column;
  gap: 14px;
`;

const LinhaNota = styled.div`
  display: flex;
  align-items: baseline;
  gap: 10px;
`;

const ValorNota = styled.span`
  font-family: ${({ theme }) => theme.fonte.display};
  font-variation-settings: 'wdth' 75;
  font-weight: ${({ theme }) => theme.peso.display};
  font-size: 28px;
  line-height: 1;
  color: ${({ theme }) => theme.cor.tinta900};
`;

const SufixoNota = styled.span`
  font-family: ${({ theme }) => theme.fonte.mono};
  font-weight: ${({ theme }) => theme.peso.medio};
  font-size: ${({ theme }) => theme.tamanho[12]};
  line-height: 1;
  letter-spacing: ${({ theme }) => theme.tracking.rotuloForte};
  color: ${({ theme }) => theme.cor.tealLink};
`;

const Citacao = styled.blockquote`
  margin: 0;
  font-family: ${({ theme }) => theme.fonte.corpo};
  font-size: ${({ theme }) => theme.tamanho[15]};
  line-height: 1.55;
  color: ${({ theme }) => theme.cor.tinta750};
  flex: 1;
  text-wrap: pretty;
`;

const Rodape = styled.figcaption`
  border-top: 1px solid ${({ theme }) => theme.cor.borda};
  padding-top: 14px;
`;

const Nome = styled.p`
  margin: 0 0 2px;
  font-family: ${({ theme }) => theme.fonte.corpo};
  font-size: ${({ theme }) => theme.tamanho[17]};
  line-height: 1.3;
  font-weight: ${({ theme }) => theme.peso.medio};
  color: ${({ theme }) => theme.cor.tinta900};
`;

const Empresa = styled.p`
  margin: 0 0 8px;
  font-family: ${({ theme }) => theme.fonte.corpo};
  font-size: ${({ theme }) => theme.tamanho[15]};
  line-height: 1.4;
  color: ${({ theme }) => theme.cor.tinta600};
`;

const CidadeTipo = styled.p`
  margin: 0;
  font-family: ${({ theme }) => theme.fonte.mono};
  font-size: ${({ theme }) => theme.tamanho[13]};
  line-height: 1.4;
  letter-spacing: ${({ theme }) => theme.tracking.rotulo};
  color: ${({ theme }) => theme.cor.textoMuted};
`;

// ---------------------------------------------------------------------------
// Estado vazio (extensão E6 — rota 2, composição local; NÃO tocar em EmptyState.tsx)
//
// Justificativa: EmptyState de coluna única já é consumido pelas Fases 5–6; adicionar prop de
// layout condicional aumentaria a superfície de teste de um primitivo compartilhado por um caso
// de uso único. A caixa abaixo replica a `Caixa` de EmptyState.tsx (borda, fundo, raio, padding),
// mas com um miolo de 2 colunas que o primitivo não tem.
// ---------------------------------------------------------------------------

const CaixaVazia = styled.div`
  border: 1px solid ${({ theme }) => theme.cor.borda};
  background: ${({ theme }) => theme.cor.branco};
  border-radius: ${({ theme }) => theme.raio.base};
  padding: clamp(28px, 4vw, 48px);
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 32px;
  align-items: center;
`;

const ColunaTexto = styled.div``;

const EyebrowNeutro = styled(Eyebrow)`
  /* Aqui o eyebrow é neutro (textoMuted), não teal/tealLink como o eyebrow padrão de seção —
     override local via styled(Eyebrow), sem adicionar prop ao primitivo. */
  color: ${({ theme }) => theme.cor.textoMuted};
  margin-bottom: 12px;
`;

const TituloVazio = styled.h3`
  margin: 0 0 10px;
  font-family: ${({ theme }) => theme.fonte.corpo};
  font-weight: ${({ theme }) => theme.peso.medio};
  font-size: ${({ theme }) => theme.tamanho[22]};
  line-height: 1.3;
  color: ${({ theme }) => theme.cor.tinta900};
`;

const TextoVazio = styled.p`
  margin: 0;
  font-family: ${({ theme }) => theme.fonte.corpo};
  font-size: ${({ theme }) => theme.tamanho[15]};
  line-height: 1.5;
  color: ${({ theme }) => theme.cor.tinta600};
  max-width: 46ch;
`;

const ColunaEstrutura = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.espaco[16]};
`;

const CaixaTracejada = styled.div`
  border: 1px dashed ${({ theme }) => theme.cor.borda};
  padding: ${({ theme }) => theme.espaco[16]};
  border-radius: ${({ theme }) => theme.raio.base};
  display: grid;
  gap: ${({ theme }) => theme.espaco[8]};
`;

const RotuloEstrutura = styled.p`
  margin: 0;
  font-family: ${({ theme }) => theme.fonte.mono};
  font-size: ${({ theme }) => theme.tamanho[12]};
  letter-spacing: ${({ theme }) => theme.tracking.rotuloForte};
  color: ${({ theme }) => theme.cor.textoMuted};
`;

const LinhaEstrutura = styled.p`
  margin: 0;
  font-family: ${({ theme }) => theme.fonte.mono};
  font-size: ${({ theme }) => theme.tamanho[13]};
  line-height: 1.4;
  color: ${({ theme }) => theme.cor.textoMuted};
`;

export interface AvaliacoesBlocoProps {
  bloco: BlocoAvaliacoes;
  locale: Locale;
  avaliacoes: Avaliacao[];
}

export function AvaliacoesBloco({ bloco, locale, avaliacoes }: AvaliacoesBlocoProps) {
  const vazio = avaliacoes.length === 0;
  // Formatador criado uma vez por render do bloco (T-04-25) — não por avaliação. Instanciá-lo
  // em laço seria caro. Dá "5,0" em pt-BR e "5.0" em en/es, sem fixar a vírgula no código.
  const formatadorNota = new Intl.NumberFormat(locale, {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });

  return (
    <Secao>
      <Miolo>
        <EyebrowSecao>{bloco.eyebrow ?? 'Avaliações'}</EyebrowSecao>
        <TituloSecao as="h2" $nivel="h2">
          {bloco.titulo ?? 'A confiança de quem já realizou eventos conosco'}
        </TituloSecao>
        {bloco.subtitulo && <Subtitulo>{bloco.subtitulo}</Subtitulo>}

        {vazio ? (
          <CaixaVazia>
            <ColunaTexto>
              <EyebrowNeutro>NENHUMA AVALIAÇÃO PUBLICADA</EyebrowNeutro>
              <TituloVazio>Publicamos apenas avaliações reais de clientes.</TituloVazio>
              <TextoVazio>
                Assim que os primeiros eventos forem entregues, as avaliações verificadas aparecem
                aqui, com cidade, tipo de evento e nota.
              </TextoVazio>
            </ColunaTexto>

            <ColunaEstrutura>
              {/*
                Bloco decorativo/explicativo — mostra a "forma" de uma avaliação, não dados
                reais. Reproduzir literalmente, inclusive o "0,0" com vírgula (rótulo de
                exemplo, não um valor formatado dinamicamente). É informação útil ao leitor de
                tela sobre o que será publicado — não marcar como aria-hidden.
              */}
              <CaixaTracejada>
                <RotuloEstrutura>ESTRUTURA DA AVALIAÇÃO</RotuloEstrutura>
                <LinhaEstrutura>NOME · EMPRESA</LinhaEstrutura>
                <LinhaEstrutura>CIDADE · TIPO DE EVENTO</LinhaEstrutura>
                <LinhaEstrutura>NOTA · 0,0 / 5</LinhaEstrutura>
                <LinhaEstrutura>TEXTO COMPLETO DA AVALIAÇÃO</LinhaEstrutura>
              </CaixaTracejada>
              <Button
                as="a"
                $variante="outlinePreto"
                $tamanho="sm"
                href={`/${locale}/solicitar-orcamento`}
              >
                SOLICITAR ORÇAMENTO
              </Button>
            </ColunaEstrutura>
          </CaixaVazia>
        ) : (
          <Grade>
            {avaliacoes.map((avaliacao) => (
              <Card key={avaliacao.id}>
                {avaliacao.nota !== null && (
                  <LinhaNota>
                    <ValorNota>{formatadorNota.format(avaliacao.nota)}</ValorNota>
                    <SufixoNota>{`/ ${formatadorNota.format(5)}`}</SufixoNota>
                  </LinhaNota>
                )}
                <Citacao>{avaliacao.texto}</Citacao>
                <Rodape>
                  <Nome>{avaliacao.nome}</Nome>
                  {avaliacao.empresa && <Empresa>{avaliacao.empresa}</Empresa>}
                  {(avaliacao.cidade || avaliacao.tipoDeEvento) && (
                    <CidadeTipo>
                      {avaliacao.cidade}
                      {avaliacao.cidade && avaliacao.tipoDeEvento && <br />}
                      {avaliacao.tipoDeEvento}
                    </CidadeTipo>
                  )}
                </Rodape>
              </Card>
            ))}
          </Grade>
        )}

        <SectionDivider $claro />
      </Miolo>
    </Secao>
  );
}

// ---------------------------------------------------------------------------
// Estado "carregando" (skeleton) — componente testável, não garantia de produção.
//
// Sem cacheComponents habilitado e com busca em Server Component, um limite de streaming ao
// redor de um bloco assíncrono é resolvido no próprio prerender — o visitante de uma rota
// estática nunca vê o estado de carregamento. Habilitar cacheComponents é decisão de
// arquitetura da Fase 14 (afeta as Fases 5–17) e está explicitamente fora do escopo desta fase.
// Por isso o componente é exportado (a showcase precisa importá-lo) mas nunca é renderizado
// dentro de AvaliacoesBloco na Home, nem envolvido em qualquer mecanismo de streaming aqui.
// ---------------------------------------------------------------------------

const GradeEsqueleto = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: ${({ theme }) => theme.espaco[24]};
`;

const CardEsqueleto = styled.div<{ $indice: number }>`
  border: 1px solid ${({ theme }) => theme.cor.borda};
  background: ${({ theme }) => theme.cor.branco};
  padding: ${({ theme }) => theme.espaco[24]};
  border-radius: ${({ theme }) => theme.raio.base};
  display: grid;
  gap: ${({ theme }) => theme.espaco[12]};
  animation: amrPulse 1.3s ease-in-out infinite;
  animation-delay: ${({ $indice }) => `${$indice * 0.09}s`};
`;

const ALTURAS_BARRA = ['14px', '12px', '12px', '12px'] as const;

// Larguras exatas do layout-fonte por card. 3 cards, não 4 — é a contagem do HTML-fonte, mesmo
// o estado cheio mostrando 4 por linha. Não completar para 4 "para bater" com o outro estado.
// Card 1: alturas 14/12/12/12px, larguras 40%/60%/100%/85%.
// Card 2: alturas 14/12/12/12px, larguras 35%/55%/100%/70%.
// Card 3: alturas 14/12/12/12px, larguras 45%/50%/95%/80%.
const ESQUELETOS = [
  { larguras: ['40%', '60%', '100%', '85%'] },
  { larguras: ['35%', '55%', '100%', '70%'] },
  { larguras: ['45%', '50%', '95%', '80%'] },
] as const;

export function AvaliacaoSkeleton() {
  return (
    <GradeEsqueleto aria-hidden="true">
      {ESQUELETOS.map((esqueleto, indice) => (
        <CardEsqueleto key={indice} $indice={indice}>
          {esqueleto.larguras.map((largura, i) => (
            <SkeletonBar key={i} $altura={ALTURAS_BARRA[i]} $largura={largura} />
          ))}
        </CardEsqueleto>
      ))}
    </GradeEsqueleto>
  );
}
