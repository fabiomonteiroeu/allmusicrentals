import 'server-only';
import { fetchStrapi } from './client';
import {
  menuItemColecao,
  rodapeColunaColecao,
  settingsGlobaisUnico,
  produtoColecao,
  categoriaColecao,
  faqItemColecao,
  avaliacaoColecao,
  paginaColecao,
} from './schemas';
import type {
  ProdutoCms,
  CategoriaCms,
  FaqItemCms,
  PaginaCms,
  BlocoCms,
  SeoCms,
} from './schemas';
import { sanitizarRichText, type HtmlSeguro } from './sanitize';
import type { ItemNav, ColunaRodape, DadosContato } from '@/lib/site/navigation';
import type { Locale } from '@/i18n/config';

/**
 * Camada de adaptação CMS → props (servidor).
 * As páginas buscam aqui no servidor e passam props aos componentes-folha.
 * Tags de cache permitem revalidação sob demanda por webhook do Strapi
 * (as chaves espelham `MODELO_TAG` em `src/app/api/revalidate/route.ts`).
 *
 * Regra: todo campo `richtext` sai daqui já sanitizado (`HtmlSeguro`).
 */

const TAG = {
  menu: 'cms:menu',
  rodape: 'cms:rodape',
  settings: 'cms:settings',
  pages: 'cms:pages',
  products: 'cms:products',
  categories: 'cms:categories',
  faq: 'cms:faq',
  avaliacoes: 'cms:avaliacoes',
} as const;

/** Base pública dos uploads do Strapi (o front nunca usa a URL interna do container). */
const MEDIA_BASE = process.env.NEXT_PUBLIC_STRAPI_MEDIA_URL ?? '';

export interface Imagem {
  url: string;
  alt: string;
  largura?: number;
  altura?: number;
}

interface MidiaCms {
  url: string;
  alternativeText?: string | null;
  width?: number | null;
  height?: number | null;
}

/** Resolve URL relativa do upload para absoluta e normaliza o alt. */
function adaptarImagem(m: MidiaCms | null | undefined, altPadrao = ''): Imagem | null {
  if (!m?.url) return null;
  const url = /^https?:\/\//i.test(m.url) ? m.url : `${MEDIA_BASE}${m.url}`;
  return {
    url,
    alt: m.alternativeText ?? altPadrao,
    ...(m.width ? { largura: m.width } : {}),
    ...(m.height ? { altura: m.height } : {}),
  };
}

function adaptarImagens(lista: (MidiaCms | null)[] | null | undefined, altPadrao = ''): Imagem[] {
  return (lista ?? []).map((m) => adaptarImagem(m, altPadrao)).filter((i): i is Imagem => i !== null);
}

// ---------------------------------------------------------------------------
// Navegação e configurações globais
// ---------------------------------------------------------------------------

/** Itens do menu de cabeçalho, ordenados, já no formato do componente Header. */
export async function getNavPrincipal(locale: Locale): Promise<ItemNav[]> {
  const res = await fetchStrapi('menu-items', menuItemColecao, {
    params: {
      locale,
      'filters[local][$eq]': 'cabecalho',
      'filters[visivel][$eq]': true,
      'sort[0]': 'ordem:asc',
      'pagination[pageSize]': 100,
    },
    tags: [TAG.menu],
  });
  return res.data.map((item): ItemNav => ({ rotulo: item.rotulo, href: item.url }));
}

/** Colunas do rodapé com seus itens, no formato do componente Footer. */
export async function getColunasRodape(locale: Locale): Promise<ColunaRodape[]> {
  const res = await fetchStrapi('rodape-colunas', rodapeColunaColecao, {
    params: {
      locale,
      populate: 'itens',
      'sort[0]': 'ordem:asc',
      'pagination[pageSize]': 100,
    },
    tags: [TAG.rodape],
  });
  return res.data.map(
    (col): ColunaRodape => ({
      titulo: col.titulo,
      itens: [...col.itens]
        .sort((a, b) => (a.ordem ?? 0) - (b.ordem ?? 0))
        .map((i): ItemNav => ({ rotulo: i.rotulo, href: i.url })),
    }),
  );
}

export interface SettingsGlobais {
  nomeSite: string;
  tagline: string;
  contato: DadosContato;
}

/** Configurações globais (contato, tagline) no formato dos componentes. */
export async function getSettingsGlobais(locale: Locale): Promise<SettingsGlobais | null> {
  const res = await fetchStrapi('settings-globais', settingsGlobaisUnico, {
    params: { locale, populate: 'imagemOG' },
    tags: [TAG.settings],
  });
  const s = res.data;
  if (!s) return null;
  const telefone = s.telefone ?? '';
  return {
    nomeSite: s.nomeSite ?? 'All Music Rentals',
    tagline: s.tagline ?? '',
    contato: {
      telefone,
      telefoneHref: `tel:${telefone.replace(/[^\d+]/g, '')}`,
      email: s.email ?? '',
    },
  };
}

// ---------------------------------------------------------------------------
// SEO
// ---------------------------------------------------------------------------

export interface Seo {
  titulo: string | null;
  descricao: string | null;
  canonica: string | null;
  noindex: boolean;
  imagemOG: Imagem | null;
  tipoSchema: NonNullable<SeoCms['tipoSchema']> | null;
  jsonLdExtra: unknown;
}

export function adaptarSeo(seo: SeoCms | null | undefined): Seo | null {
  if (!seo) return null;
  return {
    titulo: seo.title ?? null,
    descricao: seo.description ?? null,
    canonica: seo.canonical ?? null,
    noindex: seo.noindex ?? false,
    imagemOG: adaptarImagem(seo.imagemOG, seo.title ?? ''),
    tipoSchema: seo.tipoSchema ?? null,
    jsonLdExtra: seo.jsonLdExtra ?? null,
  };
}

// ---------------------------------------------------------------------------
// Produtos
// ---------------------------------------------------------------------------

export interface PerguntaResposta {
  pergunta: string;
  respostaHtml: HtmlSeguro;
}

export interface Produto {
  id: number;
  slug: string;
  nome: string;
  codigo: string | null;
  descricaoCurta: string | null;
  descricaoHtml: HtmlSeguro;
  caracteristicas: string[];
  medidas: { rotulo: string; valor: string }[];
  material: string | null;
  aplicacoes: string[];
  variacoes: { tipo: string; nome: string; valorExibido: string | null }[];
  tipoDeItem: ProdutoCms['tipoDeItem'];
  ambiente: NonNullable<ProdutoCms['ambiente']> | null;
  imagens: Imagem[];
  destaque: boolean;
  faq: PerguntaResposta[];
  seo: Seo | null;
}

export function adaptarProduto(p: ProdutoCms): Produto {
  return {
    id: p.id,
    slug: p.slug,
    nome: p.nome,
    codigo: p.codigo ?? null,
    descricaoCurta: p.descricaoCurta ?? null,
    descricaoHtml: sanitizarRichText(p.descricaoCompleta),
    caracteristicas: (p.caracteristicas ?? []).map((c) => c.texto),
    medidas: (p.medidas ?? []).map((m) => ({ rotulo: m.rotulo, valor: m.valor })),
    material: p.material ?? null,
    aplicacoes: p.aplicacoes ?? [],
    variacoes: (p.variacoes ?? []).map((v) => ({
      tipo: v.tipo,
      nome: v.nome,
      valorExibido: v.valorExibido ?? null,
    })),
    tipoDeItem: p.tipoDeItem,
    ambiente: p.ambiente ?? null,
    imagens: adaptarImagens(p.imagens, p.nome),
    destaque: p.destaque ?? false,
    faq: (p.faq ?? []).map(adaptarPerguntaResposta),
    seo: adaptarSeo(p.seo),
  };
}

function adaptarPerguntaResposta(item: { pergunta: string; resposta: string }): PerguntaResposta {
  return { pergunta: item.pergunta, respostaHtml: sanitizarRichText(item.resposta) };
}

const POPULATE_PRODUTO_LISTA = 'imagens,variacoes';
const POPULATE_PRODUTO_DETALHE = 'imagens,variacoes,caracteristicas,medidas,faq,seo,seo.imagemOG';

export interface FiltroProdutos {
  categoria?: string;
  destaque?: boolean;
  busca?: string;
  pagina?: number;
  porPagina?: number;
}

/** Lista de produtos para catálogo/categoria (populate enxuto). */
export async function getProdutos(locale: Locale, filtro: FiltroProdutos = {}): Promise<Produto[]> {
  const params: Record<string, string | number | boolean> = {
    locale,
    populate: POPULATE_PRODUTO_LISTA,
    'sort[0]': 'nome:asc',
    'pagination[page]': filtro.pagina ?? 1,
    'pagination[pageSize]': filtro.porPagina ?? 24,
  };
  if (filtro.categoria) params['filters[categoria][slug][$eq]'] = filtro.categoria;
  if (filtro.destaque !== undefined) params['filters[destaque][$eq]'] = filtro.destaque;
  if (filtro.busca) params['filters[nome][$containsi]'] = filtro.busca;

  const res = await fetchStrapi('products', produtoColecao, { params, tags: [TAG.products] });
  return res.data.map(adaptarProduto);
}

/** Produto único por slug (populate completo). `null` se não publicado/inexistente. */
export async function getProdutoPorSlug(locale: Locale, slug: string): Promise<Produto | null> {
  const res = await fetchStrapi('products', produtoColecao, {
    params: {
      locale,
      'filters[slug][$eq]': slug,
      populate: POPULATE_PRODUTO_DETALHE,
      'pagination[pageSize]': 1,
    },
    tags: [TAG.products],
  });
  const p = res.data[0];
  return p ? adaptarProduto(p) : null;
}

// ---------------------------------------------------------------------------
// Categorias
// ---------------------------------------------------------------------------

export interface Categoria {
  id: number;
  slug: string;
  nome: string;
  descricao: string | null;
  subcategorias: { nome: string; descricao: string | null }[];
  hero: Imagem | null;
  ordem: number;
  produtos: Produto[];
  seo: Seo | null;
}

export function adaptarCategoria(c: CategoriaCms): Categoria {
  return {
    id: c.id,
    slug: c.slug,
    nome: c.nome,
    descricao: c.descricao ?? null,
    subcategorias: (c.subcategorias ?? []).map((s) => ({
      nome: s.nome,
      descricao: s.descricao ?? null,
    })),
    hero: adaptarImagem(c.hero, c.nome),
    ordem: c.ordem ?? 0,
    produtos: (c.produtos ?? []).map(adaptarProduto),
    seo: adaptarSeo(c.seo),
  };
}

/** Todas as categorias ordenadas (grade da home, menu, catálogo). */
export async function getCategorias(locale: Locale): Promise<Categoria[]> {
  const res = await fetchStrapi('categories', categoriaColecao, {
    params: {
      locale,
      populate: 'hero,subcategorias',
      'sort[0]': 'ordem:asc',
      'pagination[pageSize]': 100,
    },
    tags: [TAG.categories],
  });
  return res.data.map(adaptarCategoria);
}

/** Categoria por slug, com produtos populados. */
export async function getCategoriaPorSlug(locale: Locale, slug: string): Promise<Categoria | null> {
  const res = await fetchStrapi('categories', categoriaColecao, {
    params: {
      locale,
      'filters[slug][$eq]': slug,
      populate: 'hero,subcategorias,seo,seo.imagemOG,produtos,produtos.imagens',
      'pagination[pageSize]': 1,
    },
    tags: [TAG.categories, TAG.products],
  });
  const c = res.data[0];
  return c ? adaptarCategoria(c) : null;
}

// ---------------------------------------------------------------------------
// FAQ e avaliações
// ---------------------------------------------------------------------------

export interface FaqItem extends PerguntaResposta {
  id: number;
  destaque: boolean;
}

export function adaptarFaqItem(f: FaqItemCms): FaqItem {
  return {
    id: f.id,
    pergunta: f.pergunta,
    respostaHtml: sanitizarRichText(f.resposta),
    destaque: f.destaque ?? false,
  };
}

/** FAQ do site; `categoria` filtra o FAQ de uma categoria específica. */
export async function getFaq(
  locale: Locale,
  opcoes: { categoria?: string; apenasDestaque?: boolean } = {},
): Promise<FaqItem[]> {
  const params: Record<string, string | number | boolean> = {
    locale,
    'sort[0]': 'ordem:asc',
    'pagination[pageSize]': 100,
  };
  if (opcoes.categoria) params['filters[categoria][slug][$eq]'] = opcoes.categoria;
  if (opcoes.apenasDestaque) params['filters[destaque][$eq]'] = true;

  const res = await fetchStrapi('faq-items', faqItemColecao, { params, tags: [TAG.faq] });
  return res.data.map(adaptarFaqItem);
}

export interface Avaliacao {
  id: number;
  nome: string;
  empresa: string | null;
  cidade: string | null;
  tipoDeEvento: string | null;
  nota: number | null;
  texto: string;
  verificada: boolean;
}

/**
 * Avaliações REAIS e publicadas. Nunca há seed fictício — se o CMS estiver vazio,
 * a seção correspondente simplesmente não renderiza.
 */
export async function getAvaliacoes(limite = 12): Promise<Avaliacao[]> {
  const res = await fetchStrapi('avaliacoes', avaliacaoColecao, {
    params: {
      'filters[publicada][$eq]': true,
      'sort[0]': 'createdAt:desc',
      'pagination[pageSize]': limite,
    },
    tags: [TAG.avaliacoes],
  });
  return res.data.map(
    (a): Avaliacao => ({
      id: a.id,
      nome: a.nome,
      empresa: a.empresa ?? null,
      cidade: a.cidade ?? null,
      tipoDeEvento: a.tipoDeEvento ?? null,
      nota: a.nota ?? null,
      texto: a.texto,
      verificada: a.verificada ?? false,
    }),
  );
}

// ---------------------------------------------------------------------------
// Páginas e Dynamic Zone
// ---------------------------------------------------------------------------

type BlocoComRichText = Extract<
  BlocoCms,
  { __component: 'blocos.texto-rico' | 'blocos.faq' | 'blocos.comparativo-led' }
>;

/** Blocos prontos para render: rich text já virou `HtmlSeguro`. */
export type Bloco =
  | Exclude<BlocoCms, BlocoComRichText>
  | (Extract<BlocoCms, { __component: 'blocos.texto-rico' }> & { conteudoHtml: HtmlSeguro })
  | (Omit<Extract<BlocoCms, { __component: 'blocos.faq' }>, 'itens'> & {
      itens: PerguntaResposta[];
    })
  | (Extract<BlocoCms, { __component: 'blocos.comparativo-led' }> & {
      introducaoHtml: HtmlSeguro;
    });

/**
 * Sanitiza o rich text de cada bloco. Blocos desconhecidos já chegaram como `null`
 * do schema tolerante e são descartados aqui (deploy do CMS na frente do front).
 */
export function adaptarBlocos(blocos: PaginaCms['blocos']): Bloco[] {
  return (blocos ?? []).filter((b): b is BlocoCms => b !== null).map(adaptarBloco);
}

function adaptarBloco(b: BlocoCms): Bloco {
  switch (b.__component) {
    case 'blocos.texto-rico':
      return { ...b, conteudoHtml: sanitizarRichText(b.conteudo) };
    case 'blocos.faq':
      return { ...b, itens: (b.itens ?? []).map(adaptarPerguntaResposta) };
    case 'blocos.comparativo-led':
      return { ...b, introducaoHtml: sanitizarRichText(b.introducao) };
    default:
      return b;
  }
}

export interface Pagina {
  id: number;
  slug: string;
  titulo: string;
  seo: Seo | null;
  blocos: Bloco[];
}

const POPULATE_BLOCOS =
  'seo,seo.imagemOG,blocos,blocos.imagem,blocos.imagens,blocos.itens,blocos.passos';

/** Página de conteúdo por slug (home = slug `home`), com Dynamic Zone adaptada. */
export async function getPagina(locale: Locale, slug: string): Promise<Pagina | null> {
  const res = await fetchStrapi('pages', paginaColecao, {
    params: {
      locale,
      'filters[slug][$eq]': slug,
      populate: POPULATE_BLOCOS,
      'pagination[pageSize]': 1,
    },
    tags: [TAG.pages],
  });
  const p = res.data[0];
  if (!p) return null;
  return {
    id: p.id,
    slug: p.slug,
    titulo: p.titulo,
    seo: adaptarSeo(p.seo),
    blocos: adaptarBlocos(p.blocos),
  };
}

export const CMS_TAGS = TAG;
