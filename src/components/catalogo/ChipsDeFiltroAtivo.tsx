'use client';

import { useMemo, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import styled from 'styled-components';
import { ChipFiltro } from '@/components/primitives/Chip';
import {
  alternarValor,
  descreverChips,
  parseFiltrosDaUrl,
  type IdGrupoFiltro,
  type OpcaoDeFiltro,
} from '@/lib/catalogo/filtros';

/**
 * Bloco 5 do UI-SPEC — barra de filtros ativos, acima da grade. Compõe o `ChipFiltro` já
 * existente (`primitives/Chip.tsx`); não recria o chip.
 *
 * Fecha a armadilha 2 do RESEARCH §6 ("chip dessincronizado da URL") por construção: este
 * componente NÃO recebe a lista de chips por prop e NÃO guarda estado próprio. Ele lê
 * `useSearchParams()`, roda o mesmo `parseFiltrosDaUrl` que o servidor usa (com as allowlists
 * recebidas por prop) e chama `descreverChips` — a mesma função que resolveria os mesmos
 * chips em qualquer outro lugar do app. Um chip só existe se o valor estiver na URL agora, e
 * só some quando o valor sai da URL: não há caminho de código em que os dois divirjam.
 *
 * `q` (o termo buscado) nunca vira chip — tem campo próprio no hero (Bloco 2), e transformá-lo
 * em chip criaria dois controles para o mesmo dado.
 */

const Barra = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: ${({ theme }) => theme.espaco[8]};
  padding-bottom: 20px;
  margin-bottom: 20px;
  border-bottom: 1px solid ${({ theme }) => theme.cor.borda};
`;

const RotuloDaBarra = styled.span`
  font-family: ${({ theme }) => theme.fonte.mono};
  font-weight: ${({ theme }) => theme.peso.medio};
  font-size: ${({ theme }) => theme.tamanho[12]};
  letter-spacing: ${({ theme }) => theme.tracking.rotuloForte};
  color: ${({ theme }) => theme.cor.textoMuted};
`;

const BotaoLimparTudo = styled.button`
  display: inline-flex;
  align-items: center;
  min-height: 32px;
  padding: 0;
  border: none;
  background: transparent;
  color: ${({ theme }) => theme.cor.tealLink};
  font-family: ${({ theme }) => theme.fonte.mono};
  font-size: ${({ theme }) => theme.tamanho[13]};
  text-decoration: underline;
  cursor: pointer;

  &:hover {
    color: ${({ theme }) => theme.cor.tealHover};
  }
  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.cor.tealLink};
    outline-offset: 2px;
  }
`;

export interface ChipsDeFiltroAtivoProps {
  /** Mesma allowlist/rótulo que o `PainelDeFiltros` recebe para o grupo `categoria`. */
  categorias: OpcaoDeFiltro[];
  /** Mesma allowlist/rótulo que o `PainelDeFiltros` recebe para o grupo `evento`. */
  tiposDeEvento: OpcaoDeFiltro[];
  /** Allowlist de parse do grupo `cor` (a paleta inteira — D8, ver `page.tsx`). */
  cores: string[];
}

/** `URLSearchParams` → `Record` multi-valor, o formato que `parseFiltrosDaUrl` espera. */
function paraRegistro(sp: URLSearchParams): Record<string, string[]> {
  const registro: Record<string, string[]> = {};
  for (const chave of new Set(sp.keys())) registro[chave] = sp.getAll(chave);
  return registro;
}

function mapaDeRotulos(opcoes: OpcaoDeFiltro[]): Record<string, string> {
  return Object.fromEntries(opcoes.map((o) => [o.valor, o.rotulo]));
}

/**
 * Remove todos os filtros preservando `q` e `ordenar` — limpar filtro não é o mesmo que
 * apagar a busca ou a ordenação escolhida (mesma regra usada pelo `DrawerDeFiltros`, 05-06).
 */
function limparFiltros(params: URLSearchParams): URLSearchParams {
  const novo = new URLSearchParams();
  const q = params.get('q');
  const ordenar = params.get('ordenar');
  if (q) novo.set('q', q);
  if (ordenar) novo.set('ordenar', ordenar);
  return novo;
}

export function ChipsDeFiltroAtivo({ categorias, tiposDeEvento, cores }: ChipsDeFiltroAtivoProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [, iniciarTransicao] = useTransition();

  const filtro = useMemo(
    () =>
      parseFiltrosDaUrl(paraRegistro(searchParams), {
        categorias: categorias.map((c) => c.valor),
        tiposDeEvento: tiposDeEvento.map((t) => t.valor),
        cores,
      }),
    [searchParams, categorias, tiposDeEvento, cores],
  );

  const chips = descreverChips(filtro, {
    categoria: mapaDeRotulos(categorias),
    evento: mapaDeRotulos(tiposDeEvento),
  });

  function aoRemover(grupo: IdGrupoFiltro, valor: string) {
    const novosParams = alternarValor(searchParams, grupo, valor);
    iniciarTransicao(() => {
      router.push(`?${novosParams.toString()}`);
    });
  }

  function aoLimparTudo() {
    const novosParams = limparFiltros(searchParams);
    iniciarTransicao(() => {
      router.push(`?${novosParams.toString()}`);
    });
  }

  if (chips.length === 0) return null;

  return (
    <Barra aria-live="polite">
      <RotuloDaBarra>FILTROS ATIVOS</RotuloDaBarra>
      {chips.map((chip) => (
        <ChipFiltro
          key={`${chip.grupo}-${chip.valor}`}
          rotulo={chip.rotuloDoGrupo}
          valor={chip.rotuloDoValor}
          onRemover={() => aoRemover(chip.grupo, chip.valor)}
        />
      ))}
      <BotaoLimparTudo type="button" onClick={aoLimparTudo}>
        LIMPAR TUDO
      </BotaoLimparTudo>
    </Barra>
  );
}
