'use client';

import { useEffect } from 'react';
import styled from 'styled-components';

/**
 * Toast do layout (role="status"): cartão escuro com borda teal, sombra dura e animação amrToast.
 * Componente de apresentação; o gerenciamento de fila entra com o carrinho (Fase 08).
 */
const Camada = styled.div<{ $offsetBarra?: boolean }>`
  position: fixed;
  left: ${({ theme }) => theme.espaco[20]};
  right: ${({ theme }) => theme.espaco[20]};
  bottom: ${({ theme, $offsetBarra }) => ($offsetBarra ? '96px' : theme.espaco[20])};
  z-index: ${({ theme }) => theme.z.toast};
  display: flex;
  justify-content: center;
  pointer-events: none;
`;

const Cartao = styled.div`
  pointer-events: auto;
  max-width: 520px;
  width: 100%;
  background: ${({ theme }) => theme.cor.tinta900};
  color: ${({ theme }) => theme.cor.fundo};
  border: 1px solid ${({ theme }) => theme.cor.teal};
  border-radius: ${({ theme }) => theme.raio.base};
  box-shadow: ${({ theme }) => theme.sombra.duraDiagonal};
  padding: ${({ theme }) => theme.espaco[20]};
  display: grid;
  gap: ${({ theme }) => theme.espaco[14]};
  animation: amrToast ${({ theme }) => theme.motion.padrao} ${({ theme }) => theme.motion.easing}
    both;
`;

const Linha = styled.div`
  display: flex;
  align-items: flex-start;
  gap: ${({ theme }) => theme.espaco[12]};
`;

const Ponto = styled.span.attrs({ 'aria-hidden': true })`
  flex: none;
  width: 10px;
  height: 10px;
  margin-top: 7px;
  background: ${({ theme }) => theme.cor.teal};
`;

const Titulo = styled.p`
  margin: 0;
  font-family: ${({ theme }) => theme.fonte.corpo};
  font-weight: ${({ theme }) => theme.peso.medio};
  font-size: ${({ theme }) => theme.tamanho[17]};
  line-height: 1.4;
`;

const Sub = styled.p`
  margin: 0;
  font-family: ${({ theme }) => theme.fonte.mono};
  font-size: ${({ theme }) => theme.tamanho[13]};
  color: ${({ theme }) => theme.cor.textoMutedClaro};
`;

const Fechar = styled.button`
  margin-left: auto;
  flex: none;
  width: 32px;
  height: 32px;
  background: transparent;
  border: 1px solid ${({ theme }) => theme.cor.tinta700};
  border-radius: ${({ theme }) => theme.raio.base};
  color: ${({ theme }) => theme.cor.fundo};
  cursor: pointer;
  &:hover {
    border-color: ${({ theme }) => theme.cor.teal};
    color: ${({ theme }) => theme.cor.teal};
  }
  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.cor.teal};
    outline-offset: 2px;
  }
`;

const Nota = styled.p`
  margin: 0;
  font-family: ${({ theme }) => theme.fonte.corpo};
  font-size: ${({ theme }) => theme.tamanho[13]};
  line-height: 1.45;
  color: ${({ theme }) => theme.cor.textoMuted};
`;

const Acoes = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.espaco[8]};
`;

export interface ToastProps {
  titulo: string;
  sub?: string;
  nota?: string;
  offsetBarra?: boolean;
  duracaoMs?: number;
  onFechar?: () => void;
  acoes?: React.ReactNode;
}

export function Toast({
  titulo,
  sub,
  nota,
  offsetBarra,
  duracaoMs = 7000,
  onFechar,
  acoes,
}: ToastProps) {
  useEffect(() => {
    if (!onFechar) return;
    const t = setTimeout(onFechar, duracaoMs);
    return () => clearTimeout(t);
  }, [onFechar, duracaoMs]);

  return (
    <Camada $offsetBarra={offsetBarra}>
      <Cartao role="status">
        <Linha>
          <Ponto />
          <div>
            <Titulo>{titulo}</Titulo>
            {sub && <Sub>{sub}</Sub>}
          </div>
          {onFechar && (
            <Fechar type="button" aria-label="Fechar aviso" onClick={onFechar}>
              ×
            </Fechar>
          )}
        </Linha>
        {acoes && <Acoes>{acoes}</Acoes>}
        {nota && <Nota>{nota}</Nota>}
      </Cartao>
    </Camada>
  );
}
