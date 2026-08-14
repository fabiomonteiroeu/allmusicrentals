'use client';

import styled, { css } from 'styled-components';

/**
 * Primitivos de formulário (Fase 02), fiéis ao layout.
 * Rótulo real (nunca só placeholder), foco visível, erro com role="alert" e ícone quadrado.
 */

const campoBase = css<{ $erro?: boolean }>`
  width: 100%;
  border: 1px solid ${({ theme, $erro }) => ($erro ? theme.cor.erro : theme.cor.borda)};
  border-radius: ${({ theme }) => theme.raio.base};
  background: ${({ theme }) => theme.cor.branco};
  color: ${({ theme }) => theme.cor.tinta900};
  font-family: ${({ theme }) => theme.fonte.corpo};
  font-size: ${({ theme }) => theme.tamanho[16]};
  min-height: 44px;
  padding: 12px 14px;
  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.cor.tealLink};
    outline-offset: 2px;
  }
  &:disabled {
    background: ${({ theme }) => theme.cor.fundo};
    color: ${({ theme }) => theme.cor.textoHint};
    cursor: not-allowed;
  }
`;

export const Input = styled.input<{ $erro?: boolean }>`
  ${campoBase};
`;

export const Select = styled.select<{ $erro?: boolean }>`
  ${campoBase};
  padding: 0 14px;
`;

export const Textarea = styled.textarea<{ $erro?: boolean }>`
  ${campoBase};
  min-height: auto;
  padding: 12px;
  resize: vertical;
  line-height: ${({ theme }) => theme.leading.corpo};
`;

/** Wrapper label+controle: empilha com gap 6px. */
export const CampoWrap = styled.label`
  display: grid;
  gap: ${({ theme }) => theme.espaco[6]};
`;

/** Rótulo mono em caixa-alta (campos técnicos/busca). */
export const RotuloMono = styled.span`
  font-family: ${({ theme }) => theme.fonte.mono};
  font-weight: ${({ theme }) => theme.peso.medio};
  font-size: ${({ theme }) => theme.tamanho[12]};
  letter-spacing: ${({ theme }) => theme.tracking.rotuloForte};
  text-transform: uppercase;
  color: ${({ theme }) => theme.cor.textoMuted};
`;

/** Rótulo em corpo (Public Sans) para campos de leitura comum. */
export const RotuloCorpo = styled.span`
  font-family: ${({ theme }) => theme.fonte.corpo};
  font-size: ${({ theme }) => theme.tamanho[15]};
  color: ${({ theme }) => theme.cor.textoMid};
`;

/** Asterisco de obrigatório. */
export const Obrigatorio = styled.span.attrs({ 'aria-hidden': true })`
  color: ${({ theme }) => theme.cor.erro};
`;

const ErroTexto = styled.p`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.espaco[8]};
  margin: 0;
  font-family: ${({ theme }) => theme.fonte.corpo};
  font-weight: ${({ theme }) => theme.peso.medio};
  font-size: ${({ theme }) => theme.tamanho[15]};
  color: ${({ theme }) => theme.cor.erro};
`;

const ErroIcone = styled.span.attrs({ 'aria-hidden': true })`
  display: block;
  width: 14px;
  height: 14px;
  flex: none;
  background: ${({ theme }) => theme.cor.erro};
`;

/** Mensagem de erro do campo — role="alert" e ícone quadrado (do layout). */
export function MensagemErro({ children, id }: { children: React.ReactNode; id?: string }) {
  return (
    <ErroTexto role="alert" id={id}>
      <ErroIcone />
      {children}
    </ErroTexto>
  );
}
