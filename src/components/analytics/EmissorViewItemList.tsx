'use client';

import { useEffect, useRef } from 'react';
import { emitirEvento, type ItemDeListaGA4 } from '@/lib/analytics/dataLayer';

/**
 * Emite `view_item_list` uma vez por montagem da lista. Existe porque os blocos de
 * listagem são Server Components e a fila de eventos só existe no navegador.
 */
export interface EmissorViewItemListProps {
  listaId: string;
  listaNome: string;
  itens: ItemDeListaGA4[];
}

export function EmissorViewItemList({ listaId, listaNome, itens }: EmissorViewItemListProps) {
  const jaEmitiu = useRef(false);

  useEffect(() => {
    // Trava por montagem, não por conteúdo: `itens` é um array novo a cada render
    // do pai (Server Component) e reemitiria o evento a cada re-render se entrasse
    // no array de dependências. O UI-SPEC exige "uma vez por montagem da lista,
    // não a cada scroll/hover".
    if (jaEmitiu.current) return;
    jaEmitiu.current = true;
    emitirEvento({
      event: 'view_item_list',
      item_list_id: listaId,
      item_list_name: listaNome,
      items: itens,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
