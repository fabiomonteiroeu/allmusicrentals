'use client';

/**
 * Porta única de saída de eventos de analytics — ÚNICO arquivo autorizado a tocar
 * `window.dataLayer` no projeto (MED-01).
 *
 * Nenhum outro componente deve chamar `window.dataLayer.push`/`dataLayer.push` direto:
 * a regra de lint `no-restricted-properties` (eslint.config.mjs) e a guarda
 * `src/__tests__/guards/dataLayer-porta-unica.test.ts` barram qualquer acesso solto fora
 * deste módulo. Use sempre `emitirEvento`.
 *
 * Fila segura: o GTM só existe a partir da Fase 13. `emitirEvento` enfileira mesmo
 * quando `window.dataLayer` ainda não existe, sem lançar em SSR.
 */

/**
 * Item de uma lista GA4 (`view_item_list`). Campos deliberadamente omitidos —
 * a prevenção é em tempo de compilação (Pitfall 4 do RESEARCH): nenhum campo
 * monetário ou de e-commerce padrão do GA4 é representável aqui, só o essencial
 * para identificar o item na lista.
 */
export interface ItemDeListaGA4 {
  item_id: string;
  item_name: string;
  item_category?: string;
  item_variant?: string;
  index?: number;
}

/**
 * União discriminada por `event`. `search` e `filter_applied` entram na Fase 5 (catálogo):
 * nenhum dos dois membros declara campo monetário — é assim que o TypeScript barra em
 * compilação (`error TS2353` para campo extra não declarado, provado na Fase 4), mitigação
 * de PRECO-04 registrada no modelo de ameaças.
 */
export type EventoDataLayer =
  | {
      event: 'view_item_list';
      item_list_id: string;
      item_list_name: string;
      items: ItemDeListaGA4[];
    }
  | {
      event: 'search';
      search_term: string;
    }
  | {
      event: 'filter_applied';
      filter_type: string;
      filter_value: string;
    };

declare global {
  interface Window {
    dataLayer?: unknown[];
  }
}

/**
 * Única função autorizada a enfileirar eventos no `dataLayer`.
 * Funciona antes do GTM existir (fila segura) e é no-op fora do navegador.
 */
export function emitirEvento(evento: EventoDataLayer): void {
  if (typeof window === 'undefined') return;
  window.dataLayer = window.dataLayer ?? [];
  window.dataLayer.push(evento);
}
