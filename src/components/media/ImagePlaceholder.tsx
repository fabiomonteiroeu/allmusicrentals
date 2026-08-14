'use client';

import styled from 'styled-components';

/**
 * Placeholder de imagem hachurado (do layout) — listras 135° + legenda técnica.
 * Usado onde falta foto real (regra: não inventar imagem, manter placeholder com legenda).
 * `$variante`: 'card' (6/12px, cinzas) ou 'produto' (8/16px, mais claro).
 */
const Caixa = styled.div<{ $variante: 'card' | 'produto'; $ratio: string }>`
  position: relative;
  aspect-ratio: ${({ $ratio }) => $ratio};
  overflow: hidden;
  display: flex;
  align-items: flex-end;
  padding: ${({ theme, $variante }) => ($variante === 'produto' ? theme.espaco[16] : theme.espaco[12])};
  background-image: ${({ theme, $variante }) =>
    $variante === 'produto'
      ? `repeating-linear-gradient(135deg, ${theme.cor.superficie150} 0 8px, ${theme.cor.superficie125} 8px 16px)`
      : `repeating-linear-gradient(135deg, ${theme.cor.hachuraClaro} 0 6px, ${theme.cor.superficie150} 6px 12px)`};
`;

const Legenda = styled.span`
  font-family: ${({ theme }) => theme.fonte.mono};
  font-size: ${({ theme }) => theme.tamanho[13]};
  line-height: 1.4;
  color: ${({ theme }) => theme.cor.textoMuted};
`;

export interface ImagePlaceholderProps {
  legenda: string;
  variante?: 'card' | 'produto';
  ratio?: string;
}

export function ImagePlaceholder({
  legenda,
  variante = 'card',
  ratio = '4 / 3',
}: ImagePlaceholderProps) {
  return (
    <Caixa $variante={variante} $ratio={ratio} role="img" aria-label={legenda}>
      <Legenda>{legenda}</Legenda>
    </Caixa>
  );
}
