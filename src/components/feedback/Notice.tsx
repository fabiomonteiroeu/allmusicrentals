'use client';

import styled, { css } from 'styled-components';

/**
 * Bloco de aviso do layout: rótulo mono + texto, com marcador teal à esquerda.
 * Variantes: 'padrao' (faixa clara, borda teal), 'neutro' (contorno, "NÃO INCLUÍDO"),
 * 'escuro' (sobre hero, "SOBRE OS VALORES").
 */
export type VarianteAviso = 'padrao' | 'neutro' | 'escuro';

const Caixa = styled.div<{ $variante: VarianteAviso }>`
  display: flex;
  gap: ${({ theme }) => theme.espaco[16]};
  align-items: flex-start;
  border-radius: ${({ theme }) => theme.raio.base};
  padding: ${({ theme }) => `${theme.espaco[20]} ${theme.espaco[24]}`};

  ${({ theme, $variante }) => {
    switch ($variante) {
      case 'neutro':
        return css`
          border: 1px solid ${theme.cor.borda};
        `;
      case 'escuro':
        return css`
          border: 1px solid ${theme.cor.tinta700};
          background: ${theme.cor.tinta800};
        `;
      default:
        return css`
          background: ${theme.cor.superficie150};
          border-left: 2px solid ${theme.cor.tealLink};
        `;
    }
  }}
`;

const Rotulo = styled.span<{ $variante: VarianteAviso }>`
  flex: none;
  padding-top: ${({ theme }) => theme.espaco[4]};
  font-family: ${({ theme }) => theme.fonte.mono};
  font-weight: ${({ theme }) => theme.peso.medio};
  font-size: ${({ theme }) => theme.tamanho[12]};
  letter-spacing: ${({ theme }) => theme.tracking.rotuloForte};
  /*
   * Cor por variante porque cada uma pousa numa superfície diferente, e contraste se mede
   * contra a superfície real — não contra branco. Medido com axe em navegador real:
   *   neutro  (bg fundo #F1F2F2)         -> textoMuted  4.54:1
   *   escuro  (bg tinta800 #1C1E20)      -> teal        6.78:1
   *   default (bg superficie150 #E4E6E6) -> tealHover   4.85:1
   * O tealLink que valia para as duas últimas dava 4.08 e 3.27 — reprovado nas duas.
   * (Sem crases neste comentário: crase encerra o template literal do styled-components.)
   */
  color: ${({ theme, $variante }) => {
    if ($variante === 'neutro') return theme.cor.textoMuted;
    if ($variante === 'escuro') return theme.cor.teal;
    return theme.cor.tealHover;
  }};
`;

const Texto = styled.p<{ $variante: VarianteAviso }>`
  margin: 0;
  font-family: ${({ theme }) => theme.fonte.corpo};
  font-size: ${({ theme }) => theme.tamanho[15]};
  line-height: ${({ theme }) => theme.leading.corpo};
  color: ${({ theme, $variante }) =>
    $variante === 'escuro' ? theme.cor.rodapeLink : theme.cor.tinta750};
`;

export interface NoticeProps {
  rotulo: string;
  children: React.ReactNode;
  variante?: VarianteAviso;
  className?: string;
}

export function Notice({ rotulo, children, variante = 'padrao', className }: NoticeProps) {
  return (
    <Caixa $variante={variante} className={className}>
      <Rotulo $variante={variante}>{rotulo}</Rotulo>
      <Texto $variante={variante}>{children}</Texto>
    </Caixa>
  );
}
