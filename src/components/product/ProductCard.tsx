'use client';

import { useState } from 'react';
import styled from 'styled-components';
import { Button } from '@/components/primitives/Button';
import { QuantityStepper } from '@/components/primitives/QuantityStepper';
import { ColorSwatches } from '@/components/primitives/ColorSwatches';
import { ImagePlaceholder } from '@/components/media/ImagePlaceholder';

export interface ProdutoResumo {
  nome: string;
  categoria: string;
  spec: string;
  descricao: string;
  fotoSrc?: string;
  fotoHoverSrc?: string;
  placeholderLegenda?: string;
  ehServico?: boolean;
  escopo?: string;
  cores?: string[];
  botaoPrimario?: string;
  botaoSecundario?: string;
  href?: string;
}

const Article = styled.article`
  display: flex;
  flex-direction: column;
  min-width: 0;
  background: ${({ theme }) => theme.cor.branco};
  border: 1px solid ${({ theme }) => theme.cor.borda};
  border-radius: ${({ theme }) => theme.raio.base};
  transition: border-color 0.15s;
  &:hover {
    border-color: ${({ theme }) => theme.cor.tinta900};
  }
`;

const Figura = styled.div`
  position: relative;
  aspect-ratio: 4 / 3;
  background: ${({ theme }) => theme.cor.superficie150};
  overflow: hidden;
`;

const Foto = styled.div<{ $src: string }>`
  position: absolute;
  inset: 0;
  background-image: url(${({ $src }) => $src});
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
`;

const BadgeServico = styled.span`
  position: absolute;
  top: 12px;
  left: 12px;
  background: ${({ theme }) => theme.cor.tinta900};
  color: ${({ theme }) => theme.cor.teal};
  padding: ${({ theme }) => `${theme.espaco[6]} ${theme.espaco[10]}`};
  border-radius: ${({ theme }) => theme.raio.base};
  font-family: ${({ theme }) => theme.fonte.mono};
  font-weight: ${({ theme }) => theme.peso.medio};
  font-size: ${({ theme }) => theme.tamanho[12]};
  letter-spacing: ${({ theme }) => theme.tracking.rotuloForte};
`;

const SpecBar = styled.div<{ $visivel: boolean }>`
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  background: ${({ theme }) => theme.cor.tinta900};
  color: ${({ theme }) => theme.cor.fundo};
  padding: ${({ theme }) => `${theme.espaco[10]} ${theme.espaco[12]}`};
  font-family: ${({ theme }) => theme.fonte.mono};
  font-weight: ${({ theme }) => theme.peso.medio};
  font-size: ${({ theme }) => theme.tamanho[13]};
  letter-spacing: ${({ theme }) => theme.tracking.rotulo};
  transform: ${({ $visivel }) => ($visivel ? 'translateY(0)' : 'translateY(101%)')};
  transition: transform ${({ theme }) => theme.motion.padrao} ${({ theme }) => theme.motion.easing};
`;

const Corpo = styled.div`
  padding: ${({ theme }) => theme.espaco[20]};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.espaco[12]};
  flex: 1;
`;

const Categoria = styled.p`
  margin: 0;
  font-family: ${({ theme }) => theme.fonte.mono};
  font-weight: ${({ theme }) => theme.peso.medio};
  font-size: ${({ theme }) => theme.tamanho[12]};
  letter-spacing: ${({ theme }) => theme.tracking.rotuloForte};
  color: ${({ theme }) => theme.cor.tealLink};
`;

const Nome = styled.h3`
  margin: 0;
  font-family: ${({ theme }) => theme.fonte.corpo};
  font-weight: ${({ theme }) => theme.peso.medio};
  font-size: ${({ theme }) => theme.tamanho[22]};
  line-height: 1.3;
  color: ${({ theme }) => theme.cor.tinta900};
`;

const Descricao = styled.p`
  margin: 0;
  flex: 1;
  font-family: ${({ theme }) => theme.fonte.corpo};
  font-size: ${({ theme }) => theme.tamanho[15]};
  line-height: ${({ theme }) => theme.leading.corpo};
  color: ${({ theme }) => theme.cor.tinta600};
`;

const Escopo = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.espaco[12]};
  align-items: flex-start;
  background: ${({ theme }) => theme.cor.fundo};
  border-left: 2px solid ${({ theme }) => theme.cor.tealLink};
  padding: ${({ theme }) => `${theme.espaco[12]} ${theme.espaco[14]}`};
  border-radius: ${({ theme }) => theme.raio.base};
`;

const EscopoRotulo = styled.span`
  flex: none;
  padding-top: 3px;
  font-family: ${({ theme }) => theme.fonte.mono};
  font-weight: ${({ theme }) => theme.peso.medio};
  font-size: ${({ theme }) => theme.tamanho[12]};
  letter-spacing: ${({ theme }) => theme.tracking.rotuloForte};
  color: ${({ theme }) => theme.cor.tealLink};
`;

const EscopoTexto = styled.p`
  margin: 0;
  font-family: ${({ theme }) => theme.fonte.corpo};
  font-size: ${({ theme }) => theme.tamanho[13]};
  line-height: 1.45;
  color: ${({ theme }) => theme.cor.tinta600};
`;

const LinhaQtd = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.espaco[12]};
`;

const RotuloQtd = styled.label`
  font-family: ${({ theme }) => theme.fonte.corpo};
  font-size: ${({ theme }) => theme.tamanho[15]};
  color: ${({ theme }) => theme.cor.tinta600};
`;

const Botoes = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.espaco[8]};
`;

export interface ProductCardProps {
  produto: ProdutoResumo;
  onAdicionar?: (dados: { quantidade: number; cor?: string }) => void;
}

export function ProductCard({ produto, onAdicionar }: ProductCardProps) {
  const [hover, setHover] = useState(false);
  const [quantidade, setQuantidade] = useState(1);
  const [cor, setCor] = useState<string | undefined>(undefined);
  const [corErro, setCorErro] = useState(false);

  const temCor = Boolean(produto.cores?.length);
  const precisaCor = temCor && !cor;
  const fotoAtual = hover && produto.fotoHoverSrc ? produto.fotoHoverSrc : produto.fotoSrc;

  const labelSecundario = precisaCor
    ? 'SELECIONAR COR'
    : (produto.botaoSecundario ??
      (produto.ehServico ? 'ADICIONAR SERVIÇO' : 'ADICIONAR AO ORÇAMENTO'));

  const adicionar = () => {
    if (precisaCor) {
      setCorErro(true);
      return;
    }
    onAdicionar?.({ quantidade, cor });
  };

  return (
    <Article
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onFocus={() => setHover(true)}
      onBlur={() => setHover(false)}
    >
      <Figura>
        {fotoAtual ? (
          <Foto $src={fotoAtual} role="img" aria-label={produto.nome} />
        ) : (
          <ImagePlaceholder legenda={produto.placeholderLegenda ?? `FOTO · ${produto.nome}`} />
        )}
        {produto.ehServico && <BadgeServico>SERVIÇO TÉCNICO</BadgeServico>}
        <SpecBar $visivel={hover}>{produto.spec}</SpecBar>
      </Figura>

      <Corpo>
        <Categoria>{produto.categoria}</Categoria>
        <Nome>{produto.nome}</Nome>
        <Descricao>{produto.descricao}</Descricao>

        {produto.ehServico && produto.escopo && (
          <Escopo>
            <EscopoRotulo>ESCOPO</EscopoRotulo>
            <EscopoTexto>{produto.escopo}</EscopoTexto>
          </Escopo>
        )}

        {temCor && (
          <ColorSwatches
            cores={produto.cores ?? []}
            selecionada={cor}
            erro={corErro}
            onSelecionar={(c) => {
              setCor(c);
              setCorErro(false);
            }}
          />
        )}

        {!produto.ehServico && (
          <LinhaQtd>
            <RotuloQtd htmlFor={`qtd-${produto.nome}`}>Quantidade</RotuloQtd>
            <QuantityStepper
              id={`qtd-${produto.nome}`}
              valor={quantidade}
              onChange={setQuantidade}
            />
          </LinhaQtd>
        )}

        <Botoes>
          <Button as="a" href={produto.href ?? '#produto'} $variante="outlinePreto" $tamanho="sm">
            {produto.botaoPrimario ?? 'VER DETALHES'}
          </Button>
          <Button type="button" $variante="primario" onClick={adicionar}>
            {labelSecundario}
          </Button>
        </Botoes>
      </Corpo>
    </Article>
  );
}
