import {
  parseFiltrosDaUrl,
  serializarFiltros,
  alternarValor,
  descreverChips,
  contarFiltrosAtivos,
  GRUPOS_DE_FILTRO,
  ORDENACOES_UI,
  type FiltroCatalogo,
} from './filtros';
import { coresProduto } from '@/lib/site/navigation';

const ALLOWLISTS = {
  categorias: ['estruturas', 'telas-de-led', 'luz-e-som', 'tendas', 'moveis'],
  tiposDeEvento: ['casamento', 'aniversario', 'show'],
  // 05-04 passa a paleta inteira, não a lista exibida — ver contrato documentado em filtros.ts.
  cores: Object.keys(coresProduto),
};

function filtroVazio(): FiltroCatalogo {
  return {
    q: null,
    categorias: [],
    tiposDeItem: [],
    cores: [],
    tiposDeEvento: [],
    ambientes: [],
    ordenar: null,
  };
}

describe('GRUPOS_DE_FILTRO e ORDENACOES_UI — descrição declarativa', () => {
  it('tem os 5 grupos na ordem do layout, com o estado aberto correto', () => {
    expect(GRUPOS_DE_FILTRO.map((g) => g.id)).toEqual([
      'categoria',
      'tipo',
      'cor',
      'evento',
      'ambiente',
    ]);
    expect(GRUPOS_DE_FILTRO.map((g) => g.abertoPorPadrao)).toEqual([
      true,
      true,
      true,
      false,
      false,
    ]);
  });

  it('não contém lista literal de cores, categorias ou tipos de evento (opções dinâmicas)', () => {
    const dinamicos = GRUPOS_DE_FILTRO.filter((g) => ['categoria', 'cor', 'evento'].includes(g.id));
    dinamicos.forEach((g) => expect(g.opcoes).toEqual([]));
  });

  it('tem as 5 opções de ordenação, nenhuma monetária', () => {
    expect(ORDENACOES_UI).toHaveLength(5);
    expect(ORDENACOES_UI.map((o) => o.chave)).toEqual([
      'destaque',
      'solicitados',
      'recentes',
      'nome-asc',
      'nome-desc',
    ]);
  });
});

describe('parseFiltrosDaUrl — allowlist única antes de virar filtro', () => {
  it('descarta valor de `tipo` fora da allowlist do enum (incl. tentativa de injeção)', () => {
    const filtro = parseFiltrosDaUrl({ tipo: 'DROP TABLE' }, ALLOWLISTS);
    expect(filtro.tiposDeItem).toEqual([]);
  });

  it('descarta valor de `ambiente` fora da allowlist do enum', () => {
    const filtro = parseFiltrosDaUrl({ ambiente: 'subterraneo' }, ALLOWLISTS);
    expect(filtro.ambientes).toEqual([]);
  });

  it('descarta valor de `categoria` fora das categorias reais recebidas', () => {
    const filtro = parseFiltrosDaUrl({ categoria: 'subcategoria-inventada' }, ALLOWLISTS);
    expect(filtro.categorias).toEqual([]);
  });

  it('aceita valor válido de `tipo`', () => {
    const filtro = parseFiltrosDaUrl({ tipo: 'pacote' }, ALLOWLISTS);
    expect(filtro.tiposDeItem).toEqual(['pacote']);
  });

  it('uma chave desconhecida (`?admin=1`) não aparece no FiltroCatalogo resultante', () => {
    const filtro = parseFiltrosDaUrl({ admin: '1', categoria: 'moveis' }, ALLOWLISTS);
    expect(filtro).not.toHaveProperty('admin');
    expect(filtro.categorias).toEqual(['moveis']);
  });

  it('uma chave de operador Strapi (`filters[$or][0]`) é descartada em silêncio', () => {
    const filtro = parseFiltrosDaUrl({ 'filters[$or][0]': 'x', categoria: 'moveis' }, ALLOWLISTS);
    expect(filtro).not.toHaveProperty('filters[$or][0]');
    expect(filtro.categorias).toEqual(['moveis']);
  });

  it('`q` só com espaços vira ausente (null)', () => {
    const filtro = parseFiltrosDaUrl({ q: '     ' }, ALLOWLISTS);
    expect(filtro.q).toBeNull();
  });

  it('`q` com 500 caracteres é truncado em 100', () => {
    const termoLongo = 'a'.repeat(500);
    const filtro = parseFiltrosDaUrl({ q: termoLongo }, ALLOWLISTS);
    expect(filtro.q).toHaveLength(100);
  });

  it('valores duplicados de um mesmo grupo são deduplicados', () => {
    const filtro = parseFiltrosDaUrl({ cor: ['Bege', 'Bege', 'Preto'] }, ALLOWLISTS);
    expect(filtro.cores).toEqual(['Bege', 'Preto']);
  });

  it('`ordenar` fora das 5 chaves conhecidas vira null', () => {
    const filtro = parseFiltrosDaUrl({ ordenar: 'preco-asc' }, ALLOWLISTS);
    expect(filtro.ordenar).toBeNull();
  });

  it('`ordenar` com chave válida é aceito', () => {
    const filtro = parseFiltrosDaUrl({ ordenar: 'nome-asc' }, ALLOWLISTS);
    expect(filtro.ordenar).toBe('nome-asc');
  });

  it('nunca lança para entrada arbitrária', () => {
    expect(() =>
      parseFiltrosDaUrl(
        { categoria: ['a', 'b'], tipo: undefined, ambiente: '', q: undefined },
        ALLOWLISTS,
      ),
    ).not.toThrow();
  });

  describe('contrato da allowlist de cor (05-02/05-04)', () => {
    it('`?cor=Bordô` é ACEITO quando a allowlist é a paleta inteira (superconjunto do exibido)', () => {
      const filtro = parseFiltrosDaUrl({ cor: 'Bordô' }, ALLOWLISTS);
      expect(filtro.cores).toEqual(['Bordô']);
    });

    it('`?cor=Verde` (fora da paleta) é descartado mesmo com a allowlist completa', () => {
      const filtro = parseFiltrosDaUrl({ cor: 'Verde' }, ALLOWLISTS);
      expect(filtro.cores).toEqual([]);
    });
  });
});

/** `URLSearchParams` → `Record<string, string | string[]>`, preservando multi-valor
 * (o formato real de `searchParams` do Next 16 — `Object.fromEntries` colapsaria em um
 * único valor por chave). */
function paraRecord(params: URLSearchParams): Record<string, string | string[] | undefined> {
  const registro: Record<string, string | string[] | undefined> = {};
  for (const chave of new Set(params.keys())) {
    const valores = params.getAll(chave);
    registro[chave] = valores.length > 1 ? valores : valores[0];
  }
  return registro;
}

describe('serializarFiltros — caminho inverso', () => {
  it('ida e volta é estável', () => {
    const original = parseFiltrosDaUrl(
      { categoria: 'moveis', cor: ['Bege', 'Preto'], ordenar: 'nome-asc' },
      ALLOWLISTS,
    );
    const params = serializarFiltros(original);
    const devolta = parseFiltrosDaUrl(paraRecord(params), ALLOWLISTS);
    expect(devolta).toEqual(original);
  });

  it('omite `ordenar` quando é o padrão "destaque"', () => {
    const filtro = { ...filtroVazio(), ordenar: 'destaque' as const };
    const params = serializarFiltros(filtro);
    expect(params.has('ordenar')).toBe(false);
  });

  it('inclui `ordenar` quando não é o padrão', () => {
    const filtro = { ...filtroVazio(), ordenar: 'recentes' as const };
    const params = serializarFiltros(filtro);
    expect(params.get('ordenar')).toBe('recentes');
  });
});

describe('alternarValor', () => {
  it('acrescenta o valor quando ausente', () => {
    const params = new URLSearchParams();
    const resultado = alternarValor(params, 'cor', 'Bege');
    expect(resultado.getAll('cor')).toEqual(['Bege']);
  });

  it('remove o valor quando já presente', () => {
    const params = new URLSearchParams('cor=Bege&cor=Preto');
    const resultado = alternarValor(params, 'cor', 'Bege');
    expect(resultado.getAll('cor')).toEqual(['Preto']);
  });
});

describe('descreverChips', () => {
  it('devolve um item por valor ativo, na ordem dos grupos', () => {
    const filtro = { ...filtroVazio(), tiposDeItem: ['pacote'], cores: ['Bege'] };
    const chips = descreverChips(filtro);
    expect(chips.map((c) => c.grupo)).toEqual(['tipo', 'cor']);
  });

  it('para o grupo cor, rotuloDoValor é o nome da cor (o swatch fica no painel)', () => {
    const filtro = { ...filtroVazio(), cores: ['Bordô'] };
    const chips = descreverChips(filtro);
    expect(chips[0]).toMatchObject({ grupo: 'cor', valor: 'Bordô', rotuloDoValor: 'Bordô' });
  });

  it('resolve rótulo de opção fixa (grupo tipo)', () => {
    const filtro = { ...filtroVazio(), tiposDeItem: ['servico-tecnico'] };
    const chips = descreverChips(filtro);
    expect(chips[0]?.rotuloDoValor).toBe('Serviço técnico');
  });

  it('resolve rótulo dinâmico de categoria via rotulosDinamicos', () => {
    const filtro = { ...filtroVazio(), categorias: ['moveis'] };
    const chips = descreverChips(filtro, { categoria: { moveis: 'Móveis' } });
    expect(chips[0]?.rotuloDoValor).toBe('Móveis');
  });
});

describe('contarFiltrosAtivos', () => {
  it('conta valores dos 5 grupos, mas não conta `q`', () => {
    const filtro = {
      ...filtroVazio(),
      q: 'mesa',
      tiposDeItem: ['pacote'],
      cores: ['Bege', 'Preto'],
    };
    expect(contarFiltrosAtivos(filtro)).toBe(3);
  });

  it('filtro vazio conta 0', () => {
    expect(contarFiltrosAtivos(filtroVazio())).toBe(0);
  });
});
