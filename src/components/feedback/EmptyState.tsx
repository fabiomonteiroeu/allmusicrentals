'use client';

import styled from 'styled-components';
import { Eyebrow, Heading, Body } from '@/components/primitives/Typography';

/**
 * Estado vazio / sem resultado (do layout): eyebrow + título + texto + ações.
 * Usado no catálogo, categoria e avaliações. Título com nível $nivel (default h3).
 */
const Caixa = styled.div`
  border: 1px solid ${({ theme }) => theme.cor.borda};
  background: ${({ theme }) => theme.cor.branco};
  border-radius: ${({ theme }) => theme.raio.base};
  padding: clamp(28px, 4vw, 48px);
  display: grid;
  gap: ${({ theme }) => theme.espaco[24]};
  max-width: 720px;
`;

const Bloco = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.espaco[12]};
`;

const Acoes = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.espaco[8]};
  align-items: center;
`;

export interface EmptyStateProps {
  eyebrow: string;
  titulo: string;
  texto: string;
  children?: React.ReactNode;
}

export function EmptyState({ eyebrow, titulo, texto, children }: EmptyStateProps) {
  return (
    <Caixa>
      <Bloco>
        <Eyebrow>{eyebrow}</Eyebrow>
        <Heading as="h3" $nivel="h3">
          {titulo}
        </Heading>
        <Body $mid>{texto}</Body>
      </Bloco>
      {children && <Acoes>{children}</Acoes>}
    </Caixa>
  );
}
