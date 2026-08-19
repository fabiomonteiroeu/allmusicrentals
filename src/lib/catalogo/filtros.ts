import { tipoDeItemEnum, ambienteEnum } from '@/lib/cms/schemas';
import type { ChaveDeOrdenacao } from '@/lib/cms/adapters';

/**
 * Contratos de URL do catálogo (Fase 5) — módulo PURO: sem `styled`, sem React, sem nenhuma
 * diretiva de servidor exclusivo. É o único lugar onde entrada do usuário (`searchParams`)
 * vira valor de filtro; nada de `searchParams` cru chega ao adaptador do CMS
 * (`src/lib/cms/adapters.ts`). Importável tanto por Server Component quanto por Client
 * Component (ADR 001) — inclusive no bundle do navegador, sem arrastar segredo (T-05-07).
 *
 * `FiltroCatalogo` usa os mesmos nomes de campo de `FiltroProdutos`
 * (`categorias`/`tiposDeItem`/`cores`/`tiposDeEvento`/`ambientes`/`ordenar`) para que
 * `getProdutos(locale, filtro)` (05-04) possa consumir o resultado diretamente — só `q`
 * mapeia separadamente para `busca`, porque a rota decide se emite `search` ao processá-lo.
 */

// ---------------------------------------------------------------------------
// Grupos de filtro (Bloco 3 do UI-SPEC) e opções de ordenação (Bloco 4)
// ---------------------------------------------------------------------------

export type IdGrupoFiltro = 'categoria' | 'tipo' | 'cor' | 'evento' | 'ambiente';

export interface OpcaoDeFiltro {
  rotulo: string;
  valor: string;
}

export interface GrupoDeFiltro {
  id: IdGrupoFiltro;
  rotulo: string;
  /** Estado inicial do acordeão — extraído do array `GRUPOS` do layout-fonte. */
  abertoPorPadrao: boolean;
  /** Só existe no grupo `cor` — sinaliza que a opção renderiza como swatch, não checkbox. */
  swatch?: true;
  /** Microcopy do layout-fonte, preservada literalmente; só existe em `categoria` e `cor`. */
  nota?: string;
  /**
   * Opções fixas (`tipo`, `ambiente`) já vêm preenchidas aqui. Os grupos com opções
   * DINÂMICAS (`categoria`, `cor`, `evento`) começam com `opcoes: []` — quem renderiza a
   * tela resolve no servidor (`getCategorias`, `getCoresDisponiveis`, `getTiposDeEvento`
   * filtrado por `exibirNoFiltroDoCatalogo`) e passa a lista real por prop. Nenhuma lista
   * literal de categoria, cor ou tipo de evento existe neste arquivo.
   */
  opcoes: OpcaoDeFiltro[];
}

export const GRUPOS_DE_FILTRO: GrupoDeFiltro[] = [
  {
    id: 'categoria',
    rotulo: 'Categoria',
    abertoPorPadrao: true,
    nota: 'Novas categorias entram nesta lista conforme forem cadastradas.',
    opcoes: [],
  },
  {
    id: 'tipo',
    rotulo: 'Tipo de item',
    abertoPorPadrao: true,
    opcoes: [
      { rotulo: 'Produto físico', valor: 'fisico' },
      { rotulo: 'Produto com variação', valor: 'com-variacao' },
      { rotulo: 'Serviço técnico', valor: 'servico-tecnico' },
      { rotulo: 'Pacote', valor: 'pacote' },
    ],
  },
  {
    id: 'cor',
    rotulo: 'Cor',
    abertoPorPadrao: true,
    swatch: true,
    nota: 'Outras cores cadastradas aparecem aqui.',
    opcoes: [],
  },
  {
    id: 'evento',
    rotulo: 'Tipo de evento',
    abertoPorPadrao: false,
    opcoes: [],
  },
  {
    id: 'ambiente',
    rotulo: 'Ambiente',
    abertoPorPadrao: false,
    opcoes: [
      { rotulo: 'Interno', valor: 'interno' },
      { rotulo: 'Externo', valor: 'externo' },
      { rotulo: 'Interno ou externo', valor: 'interno-ou-externo' },
    ],
  },
];

export interface OpcaoDeOrdenacao {
  chave: ChaveDeOrdenacao;
  rotulo: string;
}

/** As 5 opções do `<select>` de ordenação, na ordem literal do layout-fonte. */
export const ORDENACOES_UI: OpcaoDeOrdenacao[] = [
  { chave: 'destaque', rotulo: 'Produtos em destaque' },
  { chave: 'solicitados', rotulo: 'Mais solicitados' },
  { chave: 'recentes', rotulo: 'Mais recentes' },
  { chave: 'nome-asc', rotulo: 'Nome de A a Z' },
  { chave: 'nome-desc', rotulo: 'Nome de Z a A' },
];

const CHAVES_DE_ORDENACAO = ORDENACOES_UI.map((o) => o.chave) as readonly string[];

// ---------------------------------------------------------------------------
// FiltroCatalogo — o valor saneado, e o único formato que os componentes consomem
// ---------------------------------------------------------------------------

export interface FiltroCatalogo {
  q: string | null;
  categorias: string[];
  tiposDeItem: string[];
  cores: string[];
  tiposDeEvento: string[];
  ambientes: string[];
  ordenar: ChaveDeOrdenacao | null;
}

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

/** Mapa id do grupo (chave curta de URL) → campo correspondente de `FiltroCatalogo`. */
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

const CHAVES_ACEITAS = ['q', 'categoria', 'tipo', 'cor', 'evento', 'ambiente', 'ordenar'] as const;
type ChaveAceita = (typeof CHAVES_ACEITAS)[number];

function paraArray(valor: string | string[] | undefined): string[] {
  if (valor === undefined) return [];
  return Array.isArray(valor) ? valor : [valor];
}

function dedup(valores: string[]): string[] {
  return [...new Set(valores)];
}

/**
 * Allowlists resolvidas no servidor para os 3 grupos dinâmicos. Quem chama decide o que
 * passar — é o único lugar do sistema em que uma decisão de produto (o que está cadastrado
 * no CMS) intersecciona com uma barreira de segurança (o que é aceito na URL). Nota de
 * contrato sobre `cores`: **05-04 passa deliberadamente `Object.keys(coresProduto)`** (a
 * paleta inteira, um superconjunto do que `getCoresDisponiveis` exibe no painel) — a
 * allowlist de parse precisa ser estável e não pode encolher conforme o conteúdo do CMS.
 * Um `?cor=Bordô` digitado à mão é aceito e simplesmente não casa com produto nenhum: cai
 * no estado "sem resultados" (uma tela projetada), não em erro.
 */
export interface AllowlistDinamica {
  categorias: string[];
  tiposDeEvento: string[];
  cores: string[];
}

/**
 * Entrada do usuário (`searchParams` da rota) → `FiltroCatalogo` saneado. Nunca lança —
 * entrada inválida devolve filtro vazio (ou campo vazio), nunca erro. Regras:
 * - só as 7 chaves de `CHAVES_ACEITAS` são conhecidas; qualquer outra é descartada em
 *   silêncio (T-05-03/T-05-04 — nenhum valor de `searchParams` vira nome de chave de query);
 * - valor multi-valor chega como parâmetro repetido e vira array;
 * - cada valor é testado contra a allowlist do seu grupo e descartado se não pertencer;
 * - `q` é `.trim()`ado, truncado em 100 caracteres (T-05-05) e vira `null` se ficar vazio;
 * - valores duplicados são deduplicados.
 */
export function parseFiltrosDaUrl(
  sp: Record<string, string | string[] | undefined>,
  allowlists: AllowlistDinamica,
): FiltroCatalogo {
  const filtro = filtroVazio();

  for (const chaveBruta of Object.keys(sp)) {
    if (!(CHAVES_ACEITAS as readonly string[]).includes(chaveBruta)) continue;
    const chave = chaveBruta as ChaveAceita;
    const valoresBrutos = paraArray(sp[chaveBruta]);
    if (valoresBrutos.length === 0) continue;

    switch (chave) {
      case 'q': {
        const termo = (valoresBrutos[0] ?? '').trim().slice(0, 100);
        filtro.q = termo === '' ? null : termo;
        break;
      }
      case 'categoria':
        filtro.categorias = dedup(valoresBrutos.filter((v) => allowlists.categorias.includes(v)));
        break;
      case 'tipo':
        filtro.tiposDeItem = dedup(
          valoresBrutos.filter((v) => (tipoDeItemEnum.options as readonly string[]).includes(v)),
        );
        break;
      case 'cor':
        filtro.cores = dedup(valoresBrutos.filter((v) => allowlists.cores.includes(v)));
        break;
      case 'evento':
        filtro.tiposDeEvento = dedup(
          valoresBrutos.filter((v) => allowlists.tiposDeEvento.includes(v)),
        );
        break;
      case 'ambiente':
        filtro.ambientes = dedup(
          valoresBrutos.filter((v) => (ambienteEnum.options as readonly string[]).includes(v)),
        );
        break;
      case 'ordenar': {
        const valor = valoresBrutos[0] ?? '';
        filtro.ordenar = CHAVES_DE_ORDENACAO.includes(valor) ? (valor as ChaveDeOrdenacao) : null;
        break;
      }
    }
  }

  return filtro;
}

/**
 * Caminho inverso de `parseFiltrosDaUrl`. Devolve `URLSearchParams` com as chaves na ordem
 * de `GRUPOS_DE_FILTRO` (URL estável e comparável); omite `ordenar` quando é `destaque`
 * (o padrão) para manter a URL limpa.
 */
export function serializarFiltros(filtro: FiltroCatalogo): URLSearchParams {
  const sp = new URLSearchParams();
  if (filtro.q) sp.set('q', filtro.q);
  for (const grupo of GRUPOS_DE_FILTRO) {
    for (const valor of filtro[CAMPO_POR_GRUPO[grupo.id]]) sp.append(grupo.id, valor);
  }
  if (filtro.ordenar && filtro.ordenar !== 'destaque') sp.set('ordenar', filtro.ordenar);
  return sp;
}

/**
 * Devolve um `URLSearchParams` novo com `valor` acrescentado ao grupo `chave` se ausente, e
 * removido se presente. É o que os checkboxes, os swatches e o botão de remover do chip
 * usam — existe aqui, e não dentro dos componentes, para que chip e painel não possam
 * divergir da URL.
 */
export function alternarValor(
  params: URLSearchParams,
  chave: IdGrupoFiltro,
  valor: string,
): URLSearchParams {
  const novo = new URLSearchParams(params);
  const atuais = novo.getAll(chave);
  novo.delete(chave);
  const proximos = atuais.includes(valor) ? atuais.filter((v) => v !== valor) : [...atuais, valor];
  for (const v of proximos) novo.append(chave, v);
  return novo;
}

export interface ChipAtivo {
  grupo: IdGrupoFiltro;
  rotuloDoGrupo: string;
  valor: string;
  rotuloDoValor: string;
}

/**
 * Um item por valor ativo, na ordem dos grupos, para o `ChipFiltro` já existente
 * (`primitives/Chip.tsx`). `rotulosDinamicos` resolve o rótulo amigável dos 3 grupos com
 * opções dinâmicas (ex.: nome da categoria a partir do slug); quando ausente, cai no valor
 * cru — é o caso do grupo `cor`, cujo `rotuloDoValor` já É o nome da cor (o swatch fica no
 * painel, per UI-SPEC Bloco 5).
 */
export function descreverChips(
  filtro: FiltroCatalogo,
  rotulosDinamicos: Partial<Record<IdGrupoFiltro, Record<string, string>>> = {},
): ChipAtivo[] {
  const chips: ChipAtivo[] = [];
  for (const grupo of GRUPOS_DE_FILTRO) {
    for (const valor of filtro[CAMPO_POR_GRUPO[grupo.id]]) {
      const rotuloDoValor =
        grupo.opcoes.find((o) => o.valor === valor)?.rotulo ??
        rotulosDinamicos[grupo.id]?.[valor] ??
        valor;
      chips.push({ grupo: grupo.id, rotuloDoGrupo: grupo.rotulo, valor, rotuloDoValor });
    }
  }
  return chips;
}

/** O número que vai no badge do botão "FILTROS". `q` não conta — é busca, tem campo próprio. */
export function contarFiltrosAtivos(filtro: FiltroCatalogo): number {
  return (
    filtro.categorias.length +
    filtro.tiposDeItem.length +
    filtro.cores.length +
    filtro.tiposDeEvento.length +
    filtro.ambientes.length
  );
}
