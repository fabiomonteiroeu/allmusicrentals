'use client';

import { useEffect, useRef } from 'react';
import { emitirEvento } from '@/lib/analytics/dataLayer';

/**
 * Emite `search` quando o catálogo processa `?q=` — RESEARCH §5: é o catálogo quem emite,
 * nunca a Home (`SearchBarGrande` só navega para cá), porque é aqui que o resultado da busca
 * existe. Se as duas emitissem, o evento duplicaria a cada busca feita a partir da Home.
 *
 * A trava é por TERMO, não só por montagem (ao contrário de `EmissorViewItemList`): a rota é
 * dinâmica e este componente remonta a cada mudança de filtro, então uma trava só de montagem
 * emitiria `search` de novo toda vez que o visitante marcasse um checkbox de filtro com `?q=`
 * já ativo — um evento fantasma por clique que não tem nada a ver com busca.
 */
export interface EmissorSearchProps {
  termo: string;
}

export function EmissorSearch({ termo }: EmissorSearchProps) {
  const ultimoTermoEmitido = useRef<string | null>(null);

  useEffect(() => {
    if (termo === '') return;
    if (ultimoTermoEmitido.current === termo) return;
    ultimoTermoEmitido.current = termo;
    emitirEvento({ event: 'search', search_term: termo });
  }, [termo]);

  return null;
}
