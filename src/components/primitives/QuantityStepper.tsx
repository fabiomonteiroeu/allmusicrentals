'use client';

import styled from 'styled-components';

/** Controle de quantidade −/input/+ do layout. Alvo de toque 44px (52px na variante produto). */
const Wrap = styled.div<{ $grande?: boolean }>`
  display: inline-flex;
  border: 1px solid ${({ theme }) => theme.cor.borda};
  border-radius: ${({ theme }) => theme.raio.base};
  overflow: hidden;
`;

const Passo = styled.button<{ $grande?: boolean; $lado: 'esq' | 'dir' }>`
  width: ${({ $grande }) => ($grande ? '48px' : '40px')};
  min-height: ${({ $grande }) => ($grande ? '52px' : '44px')};
  border: 0;
  ${({ theme, $lado }) =>
    $lado === 'esq'
      ? `border-right: 1px solid ${theme.cor.borda};`
      : `border-left: 1px solid ${theme.cor.borda};`}
  background: ${({ theme }) => theme.cor.fundo};
  color: ${({ theme }) => theme.cor.tinta900};
  font-size: ${({ theme, $grande }) => ($grande ? theme.tamanho[20] : theme.tamanho[18])};
  cursor: pointer;
  &:hover {
    background: ${({ theme }) => theme.cor.superficie150};
  }
  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.cor.tealLink};
    outline-offset: -2px;
  }
`;

const Campo = styled.input<{ $grande?: boolean }>`
  width: ${({ $grande }) => ($grande ? '64px' : '52px')};
  border: 0;
  text-align: center;
  font-family: ${({ theme }) => theme.fonte.mono};
  font-weight: ${({ theme }) => theme.peso.medio};
  font-size: ${({ theme, $grande }) => ($grande ? theme.tamanho[17] : theme.tamanho[15])};
  background: ${({ theme }) => theme.cor.branco};
  color: ${({ theme }) => theme.cor.tinta900};
  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.cor.tealLink};
    outline-offset: -2px;
  }
`;

export interface QuantityStepperProps {
  valor: number;
  onChange: (valor: number) => void;
  grande?: boolean;
  id?: string;
  rotuloAcessivel?: string;
}

export function QuantityStepper({
  valor,
  onChange,
  grande,
  id,
  rotuloAcessivel = 'Quantidade',
}: QuantityStepperProps) {
  const definir = (n: number) => onChange(Math.max(1, n));
  return (
    <Wrap $grande={grande}>
      <Passo
        type="button"
        $grande={grande}
        $lado="esq"
        aria-label={`Diminuir ${rotuloAcessivel}`}
        onClick={() => definir(valor - 1)}
      >
        −
      </Passo>
      <Campo
        id={id}
        $grande={grande}
        type="text"
        inputMode="numeric"
        aria-label={rotuloAcessivel}
        value={valor}
        onChange={(e) => {
          const n = parseInt(e.target.value.replace(/\D/g, ''), 10);
          definir(Number.isNaN(n) ? 1 : n);
        }}
      />
      <Passo
        type="button"
        $grande={grande}
        $lado="dir"
        aria-label={`Aumentar ${rotuloAcessivel}`}
        onClick={() => definir(valor + 1)}
      >
        +
      </Passo>
    </Wrap>
  );
}
