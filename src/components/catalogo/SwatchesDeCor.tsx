'use client';

import styled from 'styled-components';
import { coresProduto } from '@/lib/site/navigation';

/**
 * Multi-seleção de cor do painel de filtros (Bloco 3 do UI-SPEC, grupo `cor`). Componente NOVO,
 * local ao catálogo — `src/components/primitives/ColorSwatches.tsx` (seleção única, rótulo
 * "COR · OBRIGATÓRIO" do `ProductCard`) não é tocado aqui: sua semântica pertence ao card em
 * todas as páginas, e uma variante multi-select por cima mudaria esse comportamento.
 *
 * A lista exibida é exatamente a prop `cores` — nenhum array literal de nomes existe neste
 * arquivo. A origem real é `getCoresDisponiveis` (05-02), resolvida no Server Component e
 * descida por prop (D8, `docs/divergencias.md`): cadastrar uma variação nova no CMS faz um
 * swatch novo aparecer sem deploy, e é isso que torna verdadeira a nota do layout abaixo.
 *
 * O mapa de hex é importado com uma única finalidade — resolver a cor de cada nome recebido
 * por índice (`coresProduto[cor]`). Nunca é a fonte da lista de opções. Um nome sem entrada
 * no mapa (o que `getCoresDisponiveis` já impede por construção) é um caso degenerado
 * silencioso: não renderiza swatch para ele, em vez de inventar um hex.
 */

const Wrap = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.espaco[8]};
`;

const Linha = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.espaco[8]};
`;

const Swatch = styled.button<{ $hex: string; $selecionado: boolean }>`
  position: relative;
  width: 44px;
  height: 44px;
  padding: 0;
  cursor: pointer;
  border-radius: ${({ theme }) => theme.raio.base};
  background: ${({ $hex }) => $hex};
  /* Borda neutra fixa (não condicional ao hex) — cobre o caso da cor branca sobre fundo
     claro, que ficaria sem contorno perceptível se a borda dependesse da própria cor. */
  border: 1px solid ${({ theme }) => theme.cor.borda};
  /* Distinção do estado selecionado por estrutura (anel/outline), não só por matiz — a cor
     branca sobre fundo claro é quase invisível se a única pista de seleção for a cor. */
  outline: ${({ theme, $selecionado }) => ($selecionado ? `3px solid ${theme.cor.teal}` : 'none')};
  outline-offset: 2px;

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.cor.tealLink};
    outline-offset: 3px;
  }
`;

const Nota = styled.p`
  margin: 0;
  font-family: ${({ theme }) => theme.fonte.mono};
  font-size: ${({ theme }) => theme.tamanho[12]};
  color: ${({ theme }) => theme.cor.textoHint};
`;

export interface SwatchesDeCorProps {
  /** Nomes já resolvidos e ordenados pelo servidor — nenhuma lista própria neste componente. */
  cores: string[];
  selecionadas: string[];
  onAlternar: (cor: string) => void;
}

export function SwatchesDeCor({ cores, selecionadas, onAlternar }: SwatchesDeCorProps) {
  return (
    <Wrap>
      {cores.length > 0 && (
        <Linha>
          {cores.map((cor) => {
            const hex = coresProduto[cor];
            if (!hex) return null;
            const selecionado = selecionadas.includes(cor);
            return (
              <Swatch
                key={cor}
                type="button"
                $hex={hex}
                $selecionado={selecionado}
                aria-pressed={selecionado}
                aria-label={cor}
                title={cor}
                onClick={() => onAlternar(cor)}
              />
            );
          })}
        </Linha>
      )}
      <Nota>Outras cores cadastradas aparecem aqui.</Nota>
    </Wrap>
  );
}
