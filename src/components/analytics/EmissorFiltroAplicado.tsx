'use client';

import { useEffect, useRef } from 'react';
import { emitirEvento } from '@/lib/analytics/dataLayer';
import type { FiltroCatalogo, IdGrupoFiltro } from '@/lib/catalogo/filtros';

/**
 * Emite `filter_applied` por valor recém-acrescentado ao filtro corrente (não por remoção, e
 * não um evento por lista inteira — um por valor). `filter_type`/`filter_value` são as duas
 * únicas chaves de string da união `EventoDataLayer` para este evento: nada monetário é sequer
 * declarável ali, o que é a garantia em tempo de compilação de PRECO-04.
 *
 * Regras (fixadas aqui, não deixadas para quem chama):
 * - não emite na primeira montagem — chegar por URL compartilhada ou recarregar a página não é
 *   o visitante aplicando um filtro; emitir aí produziria evento fantasma a cada refresh.
 * - não emite quando um valor SAI do filtro (o evento se chama "applied", não "removed").
 * - compara, grupo a grupo, o conjunto de valores da renderização anterior com o atual e emite
 *   só a diferença de entrada — marcar dois valores de uma vez emite dois eventos, nunca um só
 *   com lista. Os valores ficam num `Set` por grupo (não concatenados numa única chave) para
 *   não depender de nenhum caractere separador escolhido a dedo.
 */
export interface EmissorFiltroAplicadoProps {
  filtro: FiltroCatalogo;
}

const CAMPO_POR_GRUPO: Record<
  IdGrupoFiltro,
  'categorias' | 'tiposDeItem' | 'cores' | 'tiposDeEvento' | 'ambientes'
> = {
  categoria: 'categorias',
  tipo: 'tiposDeItem',
  cor: 'cores',
  evento: 'tiposDeEvento',
  ambiente: 'ambientes',
};

const GRUPOS = Object.keys(CAMPO_POR_GRUPO) as IdGrupoFiltro[];

function conjuntosPorGrupo(filtro: FiltroCatalogo): Map<IdGrupoFiltro, Set<string>> {
  const mapa = new Map<IdGrupoFiltro, Set<string>>();
  for (const grupo of GRUPOS) {
    mapa.set(grupo, new Set(filtro[CAMPO_POR_GRUPO[grupo]]));
  }
  return mapa;
}

export function EmissorFiltroAplicado({ filtro }: EmissorFiltroAplicadoProps) {
  const gruposAnteriores = useRef<Map<IdGrupoFiltro, Set<string>> | null>(null);

  useEffect(() => {
    const gruposAtuais = conjuntosPorGrupo(filtro);
    const anteriores = gruposAnteriores.current;

    if (anteriores === null) {
      // Primeira montagem: só grava a base de comparação, sem emitir nada.
      gruposAnteriores.current = gruposAtuais;
      return;
    }

    for (const grupo of GRUPOS) {
      const valoresAtuais = gruposAtuais.get(grupo) ?? new Set<string>();
      const valoresAnteriores = anteriores.get(grupo) ?? new Set<string>();
      for (const valor of valoresAtuais) {
        if (valoresAnteriores.has(valor)) continue;
        emitirEvento({ event: 'filter_applied', filter_type: grupo, filter_value: valor });
      }
    }
    gruposAnteriores.current = gruposAtuais;
  }, [filtro]);

  return null;
}
