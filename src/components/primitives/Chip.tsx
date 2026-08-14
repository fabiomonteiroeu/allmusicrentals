'use client';

import styled from 'styled-components';

const ChipBotao = styled.button`
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.espaco[8]};
  min-height: 32px;
  padding: 0 10px;
  border: 1px solid ${({ theme }) => theme.cor.tinta900};
  background: ${({ theme }) => theme.cor.branco};
  border-radius: ${({ theme }) => theme.raio.base};
  cursor: pointer;
  font-family: ${({ theme }) => theme.fonte.corpo};
  font-size: ${({ theme }) => theme.tamanho[13]};
  color: ${({ theme }) => theme.cor.tinta900};
  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.cor.tealLink};
    outline-offset: 2px;
  }
`;

const ChipRotulo = styled.span`
  font-family: ${({ theme }) => theme.fonte.mono};
  font-weight: ${({ theme }) => theme.peso.medio};
  font-size: 11px;
  letter-spacing: ${({ theme }) => theme.tracking.rotuloForte};
  text-transform: uppercase;
  color: ${({ theme }) => theme.cor.textoMuted};
`;

const ChipX = styled.span.attrs({ 'aria-hidden': true })`
  color: ${({ theme }) => theme.cor.textoMuted};
  font-size: ${({ theme }) => theme.tamanho[15]};
`;

export interface ChipFiltroProps {
  rotulo: string;
  valor: string;
  onRemover: () => void;
}

/** Chip de filtro ativo: rótulo mono + valor + × (remove ao clicar). */
export function ChipFiltro({ rotulo, valor, onRemover }: ChipFiltroProps) {
  return (
    <ChipBotao type="button" onClick={onRemover} aria-label={`Remover filtro ${rotulo}: ${valor}`}>
      <ChipRotulo>{rotulo}</ChipRotulo>
      {valor}
      <ChipX>×</ChipX>
    </ChipBotao>
  );
}
