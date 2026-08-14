'use client';

import styled from 'styled-components';

/** Barra de esqueleto genérica. */
export const SkeletonBar = styled.span<{ $altura?: string; $largura?: string }>`
  display: block;
  height: ${({ $altura = '12px' }) => $altura};
  width: ${({ $largura = '100%' }) => $largura};
  background: ${({ theme }) => theme.cor.superficie150};
  border-radius: ${({ theme }) => theme.raio.base};
`;

const CardEsqueleto = styled.div<{ $indice: number }>`
  border: 1px solid ${({ theme }) => theme.cor.borda};
  background: ${({ theme }) => theme.cor.branco};
  border-radius: ${({ theme }) => theme.raio.base};
  overflow: hidden;
  animation: amrPulse 1.3s ease-in-out infinite;
  animation-delay: ${({ $indice }) => `${$indice * 0.09}s`};
`;

const Foto = styled.div`
  aspect-ratio: 4 / 3;
  background: ${({ theme }) => theme.cor.superficie150};
`;

const Corpo = styled.div`
  padding: ${({ theme }) => theme.espaco[20]};
  display: grid;
  gap: ${({ theme }) => theme.espaco[12]};
`;

/** Esqueleto de card de produto (do layout: stagger por índice). */
export function ProductCardSkeleton({ indice = 0 }: { indice?: number }) {
  return (
    <CardEsqueleto $indice={indice} aria-hidden>
      <Foto />
      <Corpo>
        <SkeletonBar $altura="12px" $largura="38%" />
        <SkeletonBar $altura="18px" $largura="80%" />
        <SkeletonBar $altura="12px" $largura="100%" />
        <SkeletonBar $altura="12px" $largura="62%" />
        <SkeletonBar $altura="44px" $largura="100%" />
      </Corpo>
    </CardEsqueleto>
  );
}
