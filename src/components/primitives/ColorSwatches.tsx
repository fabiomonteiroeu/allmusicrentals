'use client';

import styled from 'styled-components';
import { coresProduto } from '@/lib/site/navigation';

const Wrap = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.espaco[8]};
`;

const Rotulo = styled.p<{ $erro?: boolean }>`
  margin: 0;
  font-family: ${({ theme }) => theme.fonte.mono};
  font-weight: ${({ theme }) => theme.peso.medio};
  font-size: ${({ theme }) => theme.tamanho[12]};
  letter-spacing: ${({ theme }) => theme.tracking.rotuloForte};
  color: ${({ theme, $erro }) => ($erro ? theme.cor.erro : theme.cor.textoMuted)};
`;

const Linha = styled.div<{ $erro?: boolean }>`
  display: flex;
  gap: ${({ theme }) => theme.espaco[8]};
  padding: ${({ theme }) => theme.espaco[2]};
  border-radius: ${({ theme }) => theme.raio.base};
  ${({ theme, $erro }) => $erro && `outline: 1px solid ${theme.cor.erro};`}
`;

const Swatch = styled.button<{ $hex: string; $selecionado: boolean; $erro?: boolean }>`
  width: 32px;
  height: 32px;
  padding: 0;
  border-radius: ${({ theme }) => theme.raio.base};
  cursor: pointer;
  background: ${({ $hex }) => $hex};
  border: 1px solid
    ${({ theme, $hex, $erro }) =>
      $erro
        ? theme.cor.erro
        : $hex.toUpperCase() === '#FFFFFF'
          ? theme.cor.borda
          : 'rgba(11,12,13,0.25)'};
  box-shadow: ${({ theme, $selecionado }) =>
    $selecionado ? `0 0 0 2px ${theme.cor.teal}` : 'none'};
  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.cor.tealLink};
    outline-offset: 3px;
  }
`;

export interface ColorSwatchesProps {
  cores: string[];
  selecionada?: string;
  onSelecionar: (cor: string) => void;
  erro?: boolean;
}

/** Seleção de cor por swatches (do layout). Rótulo "COR · {selecionada|OBRIGATÓRIO}". */
export function ColorSwatches({ cores, selecionada, onSelecionar, erro }: ColorSwatchesProps) {
  return (
    <Wrap>
      <Rotulo $erro={erro}>COR · {selecionada ? selecionada.toUpperCase() : 'OBRIGATÓRIO'}</Rotulo>
      <Linha $erro={erro}>
        {cores.map((cor) => (
          <Swatch
            key={cor}
            type="button"
            $hex={coresProduto[cor] ?? '#CCCCCC'}
            $selecionado={cor === selecionada}
            $erro={erro}
            aria-label={cor}
            aria-pressed={cor === selecionada}
            onClick={() => onSelecionar(cor)}
          />
        ))}
      </Linha>
    </Wrap>
  );
}
