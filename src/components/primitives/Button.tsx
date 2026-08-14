'use client';

import styled, { css } from 'styled-components';

/**
 * Botão do design system (Fase 02), fiel ao layout.
 * Variantes reais do HTML:
 *  - primario: teal sólido. Em fundo claro (padrão) hover→tealLink; sobre escuro hover→fundo.
 *  - outlinePreto: contorno tinta900 sobre fundo claro.
 *  - outlineClaro: contorno claro sobre fundo escuro.
 *  - ghost: link mono sublinhado (ex.: "LIMPAR").
 */
export type VarianteBotao = 'primario' | 'outlinePreto' | 'outlineClaro' | 'ghost';
export type TamanhoBotao = 'sm' | 'md' | 'lg';

const paddingPorTamanho = {
  sm: '0 16px',
  md: '14px 20px',
  lg: '17px 26px',
} as const;

const alturaPorTamanho = {
  sm: '44px',
  md: '44px',
  lg: '52px',
} as const;

const baseArchivo = css`
  font-family: ${({ theme }) => theme.fonte.display};
  font-variation-settings: 'wdth' 75;
  font-weight: ${({ theme }) => theme.peso.display};
  letter-spacing: ${({ theme }) => theme.tracking.apertado};
  text-transform: uppercase;
  text-align: center;
  border-radius: ${({ theme }) => theme.raio.base};
  cursor: pointer;
  white-space: nowrap;
  text-decoration: none;
`;

export const Button = styled.button<{
  $variante?: VarianteBotao;
  $tamanho?: TamanhoBotao;
  $sobreEscuro?: boolean;
  $bloco?: boolean;
}>`
  ${baseArchivo};
  display: ${({ $bloco }) => ($bloco ? 'block' : 'inline-flex')};
  width: ${({ $bloco }) => ($bloco ? '100%' : 'auto')};
  align-items: center;
  justify-content: center;
  font-size: ${({ theme }) => theme.tamanho[14]};

  ${({ theme, $variante = 'primario', $tamanho = 'md' }) => {
    if ($variante === 'ghost') {
      return css`
        min-height: 32px;
        padding: 4px 0;
        border: 0;
        background: transparent;
        font-family: ${theme.fonte.mono};
        font-variation-settings: normal;
        font-weight: ${theme.peso.medio};
        font-size: ${theme.tamanho[13]};
        letter-spacing: ${theme.tracking.rotulo};
        text-transform: none;
        text-decoration: underline;
        color: ${theme.cor.tealLink};
        &:hover {
          color: ${theme.cor.tinta900};
        }
        &:focus-visible {
          outline: 2px solid ${theme.cor.tealLink};
          outline-offset: 3px;
        }
      `;
    }
    return css`
      min-height: ${alturaPorTamanho[$tamanho]};
      padding: ${paddingPorTamanho[$tamanho]};
    `;
  }}

  ${({ theme, $variante = 'primario', $sobreEscuro }) => {
    switch ($variante) {
      case 'primario':
        return css`
          border: 0;
          background: ${theme.cor.teal};
          color: ${theme.cor.tinta900};
          &:hover {
            background: ${$sobreEscuro ? theme.cor.fundo : theme.cor.tealLink};
            color: ${$sobreEscuro ? theme.cor.tinta900 : theme.cor.fundo};
          }
          &:active {
            background: ${theme.cor.tinta900};
            color: ${theme.cor.fundo};
          }
          &:focus-visible {
            outline: 2px solid ${$sobreEscuro ? theme.cor.fundo : theme.cor.tinta900};
            outline-offset: 3px;
          }
        `;
      case 'outlinePreto':
        return css`
          background: transparent;
          border: 1px solid ${theme.cor.tinta900};
          color: ${theme.cor.tinta900};
          &:hover {
            background: ${theme.cor.tinta900};
            color: ${theme.cor.fundo};
          }
          &:focus-visible {
            outline: 2px solid ${theme.cor.tealLink};
            outline-offset: 3px;
          }
        `;
      case 'outlineClaro':
        return css`
          background: transparent;
          border: 1px solid ${theme.cor.fundo};
          color: ${theme.cor.fundo};
          &:hover {
            background: ${theme.cor.fundo};
            color: ${theme.cor.tinta900};
          }
          &:focus-visible {
            outline: 2px solid ${theme.cor.teal};
            outline-offset: 3px;
          }
        `;
      default:
        return '';
    }
  }}

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;
