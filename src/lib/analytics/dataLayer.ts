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
 * União discriminada por `event`. Nesta fase só `view_item_list` existe — os demais
 * eventos entram nas fases que os usam (Fase 5+).
 */
export type EventoDataLayer = {
  event: 'view_item_list';
  item_list_id: string;
  item_list_name: string;
  items: ItemDeListaGA4[];
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
