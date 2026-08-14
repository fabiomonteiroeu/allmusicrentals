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
  color: ${({ theme, $variante }) =>
    $variante === 'neutro' ? theme.cor.textoMuted : theme.cor.tealLink};
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
