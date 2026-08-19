import { emitirEvento, type EventoDataLayer } from './dataLayer';

/**
 * Único teste da fase autorizado a mencionar `window.dataLayer` — todos os demais
 * testes de componente mockam `@/lib/analytics/dataLayer` (ver guarda
 * `src/__tests__/guards/dataLayer-porta-unica.test.ts`).
 */
describe('dataLayer — porta única de eventos (emitirEvento)', () => {
  beforeEach(() => {
    delete (window as unknown as Record<string, unknown>).dataLayer;
  });

  it('cria a fila e enfileira o evento quando window.dataLayer ainda não existe', () => {
    const evento: EventoDataLayer = {
      event: 'view_item_list',
      item_list_id: 'destaques',
      item_list_name: 'Produtos em destaque',
      items: [{ item_id: '1', item_name: 'Estrutura Q30' }],
    };

    emitirEvento(evento);

    expect(window.dataLayer).toHaveLength(1);
  });

  it('acrescenta o evento sem substituir a fila já existente', () => {
    window.dataLayer = [{ event: 'algum_evento_anterior' }];

    emitirEvento({
      event: 'view_item_list',
      item_list_id: 'destaques',
      item_list_name: 'Produtos em destaque',
      items: [],
    });

    expect(window.dataLayer).toHaveLength(2);
  });

  it('enfileira exatamente o objeto recebido, sem nenhum campo monetário nos items', () => {
    const evento: EventoDataLayer = {
      event: 'view_item_list',
      item_list_id: 'painel-led',
      item_list_name: 'Painéis de LED',
      items: [
        { item_id: '10', item_name: 'Painel P1.9', item_category: 'led', index: 0 },
        { item_id: '11', item_name: 'Painel P3.9', item_category: 'led', index: 1 },
      ],
    };

    emitirEvento(evento);

    expect(window.dataLayer?.[0]).toEqual(evento);
    expect(Object.keys(evento.items[0] ?? {})).not.toEqual(
      expect.arrayContaining(['price', 'value', 'currency', 'revenue', 'quantity', 'discount']),
    );
  });

  it('enfileira o evento `search` (Fase 5 — catálogo)', () => {
    const evento: EventoDataLayer = { event: 'search', search_term: 'painel de led' };

    emitirEvento(evento);

    expect(window.dataLayer?.[0]).toEqual(evento);
  });

  it('enfileira o evento `filter_applied` (Fase 5 — catálogo)', () => {
    const evento: EventoDataLayer = {
      event: 'filter_applied',
      filter_type: 'cor',
      filter_value: 'Bege',
    };

    emitirEvento(evento);

    expect(window.dataLayer?.[0]).toEqual(evento);
    expect(Object.keys(evento)).not.toEqual(
      expect.arrayContaining(['price', 'value', 'currency', 'revenue']),
    );
  });
});
