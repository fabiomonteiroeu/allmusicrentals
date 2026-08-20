'use client';

import { useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import styled from 'styled-components';
import { media } from '@/lib/theme/media';
import { useAppDispatch } from '@/store/hooks';
import { definirDrawerFiltros } from '@/store/slices/uiSlice';
import { ORDENACOES_UI, contarFiltrosAtivos, type FiltroCatalogo } from '@/lib/catalogo/filtros';

/**
 * Toolbar do catálogo (Bloco 4 do UI-SPEC): botão "FILTROS" (mobile), contagem de resultados e
 * ordenação de 5 opções. A visibilidade do botão usa a única media query aprovada do projeto
 * (`media.mobile`/`media.desktop`, `theme.breakpoint.header` = 1080px, per D7) — nenhum
 * breakpoint novo.
 *
 * A contagem vem do comprimento do MESMO array que a grade recebe (`total={produtos.length}`,
 * passado pelo `page.tsx`), nunca de uma segunda consulta ao CMS — fecha a armadilha 1 do
 * RESEARCH §6. `aria-live="polite"` anuncia a mudança após aplicar um filtro.
 *
 * A ordenação reescreve a chave `ordenar` na URL do mesmo jeito que o painel de filtros
 * reescreve os grupos (`useTransition` + `router.push`) — a URL continua sendo a única fonte
 * de verdade do estado.
 */

const Linha = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.espaco[16]};
  margin-bottom: 20px;
`;

const BotaoFiltros = styled.button`
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.espaco[8]};
  min-height: 44px;
  padding: 0 ${({ theme }) => theme.espaco[16]};
  border: 1px solid ${({ theme }) => theme.cor.tinta900};
  border-radius: ${({ theme }) => theme.raio.base};
  background: transparent;
  color: ${({ theme }) => theme.cor.tinta900};
  font-family: ${({ theme }) => theme.fonte.mono};
  font-weight: ${({ theme }) => theme.peso.medio};
  font-size: ${({ theme }) => theme.tamanho[13]};
  letter-spacing: ${({ theme }) => theme.tracking.rotulo};
  text-transform: uppercase;
  cursor: pointer;

  ${media.desktop} {
    display: none;
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.cor.tealLink};
    outline-offset: 3px;
  }
`;

const Badge = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  border-radius: ${({ theme }) => theme.raio.circulo};
  background: ${({ theme }) => theme.cor.teal};
  color: ${({ theme }) => theme.cor.tinta900};
  font-size: ${({ theme }) => theme.tamanho[12]};
`;

const Contagem = styled.p`
  margin: 0;
  font-family: ${({ theme }) => theme.fonte.mono};
  font-size: ${({ theme }) => theme.tamanho[13]};
  letter-spacing: ${({ theme }) => theme.tracking.rotulo};
  color: ${({ theme }) => theme.cor.textoMuted};
`;

const OrdenacaoLabel = styled.label`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.espaco[8]};
  font-family: ${({ theme }) => theme.fonte.mono};
  font-size: ${({ theme }) => theme.tamanho[13]};
  letter-spacing: ${({ theme }) => theme.tracking.rotulo};
  color: ${({ theme }) => theme.cor.textoMuted};
`;

const Select = styled.select`
  min-height: 44px;
  padding: 0 ${({ theme }) => theme.espaco[8]};
  border: 1px solid ${({ theme }) => theme.cor.borda};
  border-radius: ${({ theme }) => theme.raio.base};
  background: ${({ theme }) => theme.cor.branco};
  color: ${({ theme }) => theme.cor.tinta900};
  font-size: ${({ theme }) => theme.tamanho[14]};
  cursor: pointer;

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.cor.tealLink};
    outline-offset: 3px;
  }
`;

export interface ToolbarDoCatalogoProps {
  /** `produtos.length` do MESMO array que a grade recebe — nunca uma segunda consulta. */
  total: number;
  filtro: FiltroCatalogo;
}

export function ToolbarDoCatalogo({ total, filtro }: ToolbarDoCatalogoProps) {
  const dispatch = useAppDispatch();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [, iniciarTransicao] = useTransition();

  const filtrosAtivos = contarFiltrosAtivos(filtro);
  const ordenacaoAtual = filtro.ordenar ?? 'destaque';

  function aoAbrirDrawer() {
    dispatch(definirDrawerFiltros(true));
  }

  function aoMudarOrdenacao(valor: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (valor === 'destaque') {
      params.delete('ordenar');
    } else {
      params.set('ordenar', valor);
    }
    iniciarTransicao(() => {
      router.push(`?${params.toString()}`);
    });
  }

  return (
    <Linha>
      <BotaoFiltros
        type="button"
        onClick={aoAbrirDrawer}
        aria-label={filtrosAtivos > 0 ? `Filtros, ${filtrosAtivos} ativos` : 'Filtros'}
      >
        FILTROS
        {filtrosAtivos > 0 && <Badge aria-hidden="true">{filtrosAtivos}</Badge>}
      </BotaoFiltros>

      <Contagem aria-live="polite">{total === 1 ? '1 PRODUTO' : `${total} PRODUTOS`}</Contagem>

      <OrdenacaoLabel htmlFor="ordenar-catalogo">
        Ordenar por
        <Select
          id="ordenar-catalogo"
          value={ordenacaoAtual}
          onChange={(evento) => aoMudarOrdenacao(evento.target.value)}
        >
          {ORDENACOES_UI.map((opcao) => (
            <option key={opcao.chave} value={opcao.chave}>
              {opcao.rotulo}
            </option>
          ))}
        </Select>
      </OrdenacaoLabel>
    </Linha>
  );
}
