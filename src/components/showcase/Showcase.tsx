'use client';

import { useState } from 'react';
import styled from 'styled-components';
import { TopBar } from '@/components/chrome/TopBar';
import { Header } from '@/components/chrome/Header';
import { Footer } from '@/components/chrome/Footer';
import { Container } from '@/components/primitives/Container';
import { Heading, Eyebrow, Body } from '@/components/primitives/Typography';
import { Button } from '@/components/primitives/Button';
import { ChipFiltro } from '@/components/primitives/Chip';
import {
  CampoWrap,
  Input,
  Select,
  Textarea,
  RotuloMono,
  MensagemErro,
} from '@/components/primitives/Field';
import { Notice } from '@/components/feedback/Notice';
import { Toast } from '@/components/feedback/Toast';
import { SectionDivider } from '@/components/feedback/SectionDivider';
import { ProductCardSkeleton } from '@/components/feedback/Skeleton';
import { EmptyState } from '@/components/feedback/EmptyState';
import { Spinner } from '@/components/feedback/Spinner';
import { ImagePlaceholder } from '@/components/media/ImagePlaceholder';
import { ProductCard, type ProdutoResumo } from '@/components/product/ProductCard';

const Secao = styled.section`
  padding: ${({ theme }) => `${theme.espaco[40]} 0`};
  border-bottom: 1px solid ${({ theme }) => theme.cor.borda};
  display: grid;
  gap: ${({ theme }) => theme.espaco[24]};
`;

const Linha = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.espaco[16]};
  align-items: center;
`;

const GridCards = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: ${({ theme }) => theme.espaco[24]};
`;

const Painel = styled.div<{ $escuro?: boolean }>`
  padding: ${({ theme }) => theme.espaco[24]};
  border-radius: ${({ theme }) => theme.raio.base};
  background: ${({ theme, $escuro }) => ($escuro ? theme.cor.tinta900 : theme.cor.branco)};
  border: 1px solid ${({ theme }) => theme.cor.borda};
`;

const CARDS: ProdutoResumo[] = [
  {
    nome: 'Guarda-sol Externo Bege de 10 Pés',
    categoria: 'ÁREA EXTERNA',
    spec: '10 PÉS · BASE SOB CONSULTA',
    descricao: 'Cobertura para áreas externas, recepções e eventos ao ar livre.',
    fotoSrc: '/uploads/UMBRELLA4.jpg',
    href: '#produto',
  },
  {
    nome: 'Capa de Spandex para Mesa de Coquetel',
    categoria: 'CAPAS DE MESA',
    spec: 'SPANDEX · 3 CORES CADASTRADAS',
    descricao: 'Escolha a cor antes de adicionar (variação obrigatória).',
    fotoSrc: '/uploads/covers-high-table.jpg',
    cores: ['Preto', 'Branco', 'Bege'],
    href: '#produto',
  },
  {
    nome: 'Operação Técnica de Painel de LED',
    categoria: 'PAINÉIS DE LED',
    spec: 'SERVIÇO · POR DIÁRIA DE EVENTO',
    descricao: 'Operação e suporte técnico durante o evento.',
    ehServico: true,
    escopo: 'Informe a duração do evento e o número de diárias na etapa de dados.',
    botaoPrimario: 'VER DETALHES DO SERVIÇO',
    href: '#produto',
  },
];

export function Showcase() {
  const [toastAberto, setToastAberto] = useState(false);
  const [comErro, setComErro] = useState(true);

  return (
    <>
      <TopBar />
      <Header quantidade={4} ativoHref="#inicio" />
      <Container>
        <Secao>
          <Eyebrow>Design System · Fase 02</Eyebrow>
          <Heading $nivel="h1">Componentes e estados</Heading>
          <Body $mid>
            Página interna de conferência. Cada bloco mostra um componente do layout com seus
            estados, para comparação lado a lado com /projeto-base.
          </Body>
        </Secao>

        <Secao>
          <Eyebrow>Tipografia</Eyebrow>
          <Heading $nivel="displayHero">Display hero</Heading>
          <Heading $nivel="h1">Título H1</Heading>
          <Heading $nivel="h2">Título H2</Heading>
          <Heading $nivel="h3">Título H3</Heading>
          <Body>
            Corpo em Public Sans. Locação de equipamentos, mobiliário e painéis de LED para eventos.
          </Body>
          <Body $mid>Corpo secundário (mid).</Body>
        </Secao>

        <Secao>
          <Eyebrow>Botões</Eyebrow>
          <Linha>
            <Button $variante="primario">Primário teal</Button>
            <Button $variante="outlinePreto">Outline preto</Button>
            <Button $variante="ghost">Limpar</Button>
            <Button $variante="primario" disabled>
              Desabilitado
            </Button>
          </Linha>
          <Painel $escuro>
            <Linha>
              <Button $variante="primario" $sobreEscuro>
                Primário sobre escuro
              </Button>
              <Button $variante="outlineClaro">Outline claro</Button>
            </Linha>
          </Painel>
        </Secao>

        <Secao>
          <Eyebrow>Campos</Eyebrow>
          <Painel>
            <div style={{ display: 'grid', gap: 16, maxWidth: 420 }}>
              <CampoWrap>
                <RotuloMono>Nome</RotuloMono>
                <Input placeholder="Seu nome" />
              </CampoWrap>
              <CampoWrap>
                <RotuloMono>Assunto</RotuloMono>
                <Select defaultValue="">
                  <option value="" disabled>
                    Selecionar assunto
                  </option>
                  <option>Dúvida sobre produto</option>
                </Select>
              </CampoWrap>
              <CampoWrap>
                <RotuloMono>E-mail</RotuloMono>
                <Input $erro={comErro} defaultValue="nome@" />
                {comErro && (
                  <MensagemErro>Confira o endereço: falta o @ ou o domínio.</MensagemErro>
                )}
              </CampoWrap>
              <CampoWrap>
                <RotuloMono>Mensagem</RotuloMono>
                <Textarea rows={3} placeholder="Conte o que você precisa saber" />
              </CampoWrap>
              <Button $variante="outlinePreto" $tamanho="sm" onClick={() => setComErro((v) => !v)}>
                Alternar estado de erro
              </Button>
            </div>
          </Painel>
        </Secao>

        <Secao>
          <Eyebrow>Chips de filtro</Eyebrow>
          <Linha>
            <ChipFiltro rotulo="Categoria" valor="Painéis de LED" onRemover={() => {}} />
            <ChipFiltro rotulo="Cor" valor="Preto" onRemover={() => {}} />
            <ChipFiltro rotulo="Ambiente" valor="Externo" onRemover={() => {}} />
          </Linha>
        </Secao>

        <Secao>
          <Eyebrow>Card de produto — 3 variantes</Eyebrow>
          <Body $mid>
            Físico (com quantidade) · com variação obrigatória de cor · serviço técnico.
          </Body>
          <GridCards>
            {CARDS.map((p) => (
              <ProductCard key={p.nome} produto={p} onAdicionar={() => setToastAberto(true)} />
            ))}
          </GridCards>
        </Secao>

        <Secao>
          <Eyebrow>Blocos de aviso</Eyebrow>
          <Notice rotulo="AVISO">
            Os produtos não ficam reservados ao serem adicionados ao carrinho. A disponibilidade
            será confirmada pela equipe.
          </Notice>
          <Notice rotulo="NÃO INCLUÍDO" variante="neutro">
            A mesa não está incluída automaticamente com a capa.
          </Notice>
          <Painel $escuro>
            <Notice rotulo="SOBRE OS VALORES" variante="escuro">
              Os preços não são exibidos online. Os valores dependem da quantidade, data, endereço,
              entrega, montagem e necessidades do evento.
            </Notice>
          </Painel>
        </Secao>

        <Secao>
          <Eyebrow>Placeholder de imagem</Eyebrow>
          <GridCards>
            <ImagePlaceholder legenda="FOTO · LOUNGE EXTERNO · AMBIENTADA · 4:3" />
            <ImagePlaceholder legenda="FOTO · PALCO · ISOLADA · 4:3" variante="produto" />
          </GridCards>
        </Secao>

        <Secao>
          <Eyebrow>Carregando (skeleton)</Eyebrow>
          <GridCards>
            {[0, 1, 2].map((i) => (
              <ProductCardSkeleton key={i} indice={i} />
            ))}
          </GridCards>
        </Secao>

        <Secao>
          <Eyebrow>Estado vazio / sem resultado</Eyebrow>
          <EmptyState
            eyebrow="BUSCA SEM CORRESPONDÊNCIA"
            titulo="Amplie a busca ou fale com a equipe"
            texto="Nenhum produto do catálogo combina com todos os filtros aplicados ao mesmo tempo. Tente remover o filtro mais específico."
          >
            <Button $variante="outlinePreto" $tamanho="sm">
              Remover todos os filtros
            </Button>
            <Button $variante="primario" $tamanho="sm">
              Solicitar Orçamento
            </Button>
          </EmptyState>
        </Secao>

        <Secao>
          <Eyebrow>Extensões E1–E4 (Fase 04)</Eyebrow>
          <Linha>
            <Eyebrow>Eyebrow sobre fundo claro</Eyebrow>
          </Linha>
          <Painel $escuro>
            <Eyebrow $sobreEscuro>Eyebrow sobre fundo escuro</Eyebrow>
          </Painel>
          <Linha>
            <Heading $nivel="h1">Título H1 (leading 0.92)</Heading>
            <Heading $nivel="h2">Título H2 (leading 0.98)</Heading>
          </Linha>
          <Linha>
            <Button $variante="pretoSolido">Buscar</Button>
            <Spinner />
          </Linha>
        </Secao>

        <Secao>
          <Eyebrow>Divisores</Eyebrow>
          <SectionDivider $claro />
          <Painel $escuro>
            <SectionDivider />
          </Painel>
        </Secao>

        <Secao>
          <Eyebrow>Toast</Eyebrow>
          <Button $variante="primario" onClick={() => setToastAberto(true)}>
            Mostrar toast
          </Button>
        </Secao>
      </Container>
      <Footer />

      {toastAberto && (
        <Toast
          titulo="Produto adicionado ao seu orçamento"
          sub="MESA ALTA REDONDA · QTD 1"
          nota="Os produtos não ficam reservados ao serem adicionados ao carrinho. A disponibilidade será confirmada pela equipe."
          onFechar={() => setToastAberto(false)}
          acoes={
            <>
              <Button $variante="outlineClaro" $tamanho="sm" onClick={() => setToastAberto(false)}>
                Continuar navegando
              </Button>
              <Button as="a" href="/meu-orcamento" $variante="primario" $tamanho="sm">
                Ver meu orçamento
              </Button>
            </>
          }
        />
      )}
    </>
  );
}
