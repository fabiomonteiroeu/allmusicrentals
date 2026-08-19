import { z } from 'zod';

/**
 * Schemas Zod das respostas do Strapi 5 (formato achatado: campos no topo da entrada).
 * Validam o contrato do CMS na borda. Campos não essenciais ficam opcionais/nuláveis
 * para tolerar populate ausente sem quebrar a página.
 */

/** Envelope de coleção: { data: [...], meta }. */
export const colecao = <T extends z.ZodTypeAny>(item: T) =>
  z.object({ data: z.array(item), meta: z.unknown().optional() });

/** Envelope de item único (single type): { data: {...}|null, meta }. */
export const unico = <T extends z.ZodTypeAny>(item: T) =>
  z.object({ data: item.nullable(), meta: z.unknown().optional() });

/** Campo de mídia populado do Strapi 5. */
export const midiaSchema = z
  .object({
    url: z.string(),
    alternativeText: z.string().nullable().optional(),
    width: z.number().nullable().optional(),
    height: z.number().nullable().optional(),
  })
  .nullable();

export const localMenuEnum = z.enum([
  'cabecalho',
  'rodape-produtos',
  'rodape-empresa',
  'rodape-informacoes',
]);

export const menuItemSchema = z.object({
  id: z.number(),
  documentId: z.string().optional(),
  rotulo: z.string(),
  url: z.string(),
  ordem: z.number().nullable().optional(),
  visivel: z.boolean().nullable().optional(),
  abrirEmNovaAba: z.boolean().nullable().optional(),
  local: localMenuEnum.nullable().optional(),
});

export const rodapeColunaSchema = z.object({
  id: z.number(),
  documentId: z.string().optional(),
  titulo: z.string(),
  ordem: z.number().nullable().optional(),
  itens: z.array(menuItemSchema).default([]),
});

export const settingsGlobaisSchema = z.object({
  id: z.number(),
  documentId: z.string().optional(),
  nomeSite: z.string().nullable().optional(),
  telefone: z.string().nullable().optional(),
  email: z.string().nullable().optional(),
  endereco: z.string().nullable().optional(),
  tagline: z.string().nullable().optional(),
  gtmId: z.string().nullable().optional(),
  pixelId: z.string().nullable().optional(),
  imagemOG: midiaSchema.optional(),
  redesSociais: z.unknown().optional(),
});

// ---------------------------------------------------------------------------
// Componentes compartilhados (shared.*)
// ---------------------------------------------------------------------------

export const seoSchema = z.object({
  title: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  canonical: z.string().nullable().optional(),
  noindex: z.boolean().nullable().optional(),
  imagemOG: midiaSchema.optional(),
  tipoSchema: z
    .enum(['Organization', 'LocalBusiness', 'Product', 'Service', 'FAQPage', 'WebPage', 'ItemList'])
    .nullable()
    .optional(),
  jsonLdExtra: z.unknown().optional(),
});

export const caracteristicaSchema = z.object({ texto: z.string() });
export const medidaSchema = z.object({ rotulo: z.string(), valor: z.string() });
export const subcategoriaSchema = z.object({
  nome: z.string(),
  descricao: z.string().nullable().optional(),
});
export const variacaoSchema = z.object({
  tipo: z.string(),
  nome: z.string(),
  valorExibido: z.string().nullable().optional(),
});
export const perguntaRespostaSchema = z.object({
  pergunta: z.string(),
  resposta: z.string(),
});

// ---------------------------------------------------------------------------
// Coleções de conteúdo
// ---------------------------------------------------------------------------

export const tipoDeItemEnum = z.enum(['fisico', 'com-variacao', 'servico-tecnico', 'pacote']);
export const ambienteEnum = z.enum(['interno', 'externo', 'interno-ou-externo']);

/**
 * Taxonomia `tipo-de-evento` — travada pelo plano 05-01 (11 valores: `evento-corporativo`,
 * `casamento`, `aniversario`, `festa-privada`, `show`, `festival`, `feira`, `ativacao-de-marca`,
 * `formatura`, `evento-ao-ar-livre`, `outro`). Alimenta o filtro "Tipo de evento" do catálogo
 * (Fase 5) e o select do formulário de orçamento (Fase 9) a partir da mesma fonte no CMS.
 * `exibirNoFiltroDoCatalogo` (default `true`) permite ocultar valores do painel de filtros
 * (`outro`) sem excluí-los da taxonomia usada pelo formulário.
 */
export const tipoDeEventoSchema = z.object({
  id: z.number(),
  documentId: z.string().optional(),
  nome: z.string(),
  slug: z.string(),
  ordem: z.number().nullable().optional(),
  exibirNoFiltroDoCatalogo: z.boolean().nullable().optional(),
  locale: z.string().nullable().optional(),
});
export const tipoDeEventoColecao = colecao(tipoDeEventoSchema);
export type TipoDeEventoCms = z.infer<typeof tipoDeEventoSchema>;

/** Produto — nenhum campo monetário existe no modelo (regra inviolável). */
export const produtoSchema = z.object({
  id: z.number(),
  documentId: z.string().optional(),
  nome: z.string(),
  codigo: z.string().nullable().optional(),
  slug: z.string(),
  descricaoCurta: z.string().nullable().optional(),
  descricaoCompleta: z.string().nullable().optional(),
  caracteristicas: z.array(caracteristicaSchema).nullable().optional(),
  medidas: z.array(medidaSchema).nullable().optional(),
  material: z.string().nullable().optional(),
  aplicacoes: z.array(z.string()).nullable().optional(),
  variacoes: z.array(variacaoSchema).nullable().optional(),
  tipoDeItem: tipoDeItemEnum.catch('fisico'),
  ambiente: ambienteEnum.nullable().optional(),
  imagens: z.array(midiaSchema.unwrap()).nullable().optional(),
  destaque: z.boolean().nullable().optional(),
  faq: z.array(perguntaRespostaSchema).nullable().optional(),
  seo: seoSchema.nullable().optional(),
  locale: z.string().nullable().optional(),
  // Aditivo e opcional: relação `categoria` (manyToOne → api::category.category) já existe no
  // content-type do Strapi. Nenhuma resposta atual do Strapi quebra sem ela populada.
  categoria: z.object({ nome: z.string(), slug: z.string() }).nullable().optional(),
  // Aditivo e opcional, mesmo padrão de `categoria`: relação manyToMany com a taxonomia
  // `tipo-de-evento` (05-01/05-03). Nenhuma resposta atual do Strapi quebra sem ela populada.
  tiposDeEvento: z.array(z.object({ nome: z.string(), slug: z.string() })).nullable().optional(),
  // Aditivo e opcional: base do sort "Mais solicitados" (D6, `docs/divergencias.md`).
  contagemSolicitacoes: z.number().nullable().optional(),
});

/** Categoria. `produtos` só vem quando o populate pede. */
export const categoriaSchema = z.object({
  id: z.number(),
  documentId: z.string().optional(),
  nome: z.string(),
  slug: z.string(),
  descricao: z.string().nullable().optional(),
  subcategorias: z.array(subcategoriaSchema).nullable().optional(),
  hero: midiaSchema.optional(),
  ordem: z.number().nullable().optional(),
  produtos: z.array(produtoSchema).nullable().optional(),
  seo: seoSchema.nullable().optional(),
  locale: z.string().nullable().optional(),
});

export const faqItemSchema = z.object({
  id: z.number(),
  documentId: z.string().optional(),
  pergunta: z.string(),
  resposta: z.string(),
  ordem: z.number().nullable().optional(),
  destaque: z.boolean().nullable().optional(),
});

export const avaliacaoSchema = z.object({
  id: z.number(),
  documentId: z.string().optional(),
  nome: z.string(),
  empresa: z.string().nullable().optional(),
  cidade: z.string().nullable().optional(),
  tipoDeEvento: z.string().nullable().optional(),
  nota: z.number().nullable().optional(),
  texto: z.string(),
  verificada: z.boolean().nullable().optional(),
  publicada: z.boolean().nullable().optional(),
});

// ---------------------------------------------------------------------------
// Dynamic Zone `blocos` — união discriminada por `__component`
// ---------------------------------------------------------------------------

const bloco = <N extends string, T extends z.ZodRawShape>(nome: N, shape: T) =>
  z.object({ __component: z.literal(nome), id: z.number().optional(), ...shape });

const cta = {
  ctaPrimarioRotulo: z.string().nullable().optional(),
  ctaPrimarioUrl: z.string().nullable().optional(),
  ctaSecundarioRotulo: z.string().nullable().optional(),
  ctaSecundarioUrl: z.string().nullable().optional(),
};

const cabecalhoDeSecao = {
  eyebrow: z.string().nullable().optional(),
  titulo: z.string().nullable().optional(),
  subtitulo: z.string().nullable().optional(),
};

export const blocoHero = bloco('blocos.hero', {
  eyebrow: z.string().nullable().optional(),
  titulo: z.string(),
  subtitulo: z.string().nullable().optional(),
  citacao: z.string().nullable().optional(),
  imagem: midiaSchema.optional(),
  ...cta,
});

export const blocoBusca = bloco('blocos.busca', {
  titulo: z.string().nullable().optional(),
  subtitulo: z.string().nullable().optional(),
  placeholder: z.string().nullable().optional(),
});

export const blocoGradeDeCategorias = bloco('blocos.grade-de-categorias', cabecalhoDeSecao);
export const blocoProdutosEmDestaque = bloco('blocos.produtos-em-destaque', cabecalhoDeSecao);
export const blocoAvaliacoes = bloco('blocos.avaliacoes', cabecalhoDeSecao);

export const blocoDestaqueLed = bloco('blocos.destaque-led', {
  eyebrow: z.string().nullable().optional(),
  titulo: z.string().nullable().optional(),
  textos: z.array(z.string()).nullable().optional(),
  instalamos: z.array(z.string()).nullable().optional(),
  exibimos: z.array(z.string()).nullable().optional(),
  ctaRotulo: z.string().nullable().optional(),
  ctaUrl: z.string().nullable().optional(),
  imagens: z.array(midiaSchema.unwrap()).nullable().optional(),
});

export const blocoComoFunciona = bloco('blocos.como-funciona', {
  titulo: z.string().nullable().optional(),
  passos: z
    .array(
      z.object({
        titulo: z.string(),
        texto: z.string().nullable().optional(),
      }),
    )
    .nullable()
    .optional(),
  aviso: z.string().nullable().optional(),
});

export const blocoDiferenciais = bloco('blocos.diferenciais', {
  titulo: z.string().nullable().optional(),
  itens: z
    .array(
      z.object({
        titulo: z.string(),
        texto: z.string().nullable().optional(),
      }),
    )
    .nullable()
    .optional(),
});

export const blocoChamadaFinal = bloco('blocos.chamada-final', {
  titulo: z.string().nullable().optional(),
  subtitulo: z.string().nullable().optional(),
  ...cta,
});

export const blocoTextoRico = bloco('blocos.texto-rico', {
  titulo: z.string().nullable().optional(),
  conteudo: z.string(),
});

export const blocoFaq = bloco('blocos.faq', {
  eyebrow: z.string().nullable().optional(),
  titulo: z.string().nullable().optional(),
  apoio: z.string().nullable().optional(),
  itens: z.array(perguntaRespostaSchema).nullable().optional(),
});

export const blocoFormularioContato = bloco('blocos.formulario-contato', {
  titulo: z.string().nullable().optional(),
  subtitulo: z.string().nullable().optional(),
  microcopy: z.string().nullable().optional(),
});

export const blocoComparativoLed = bloco('blocos.comparativo-led', {
  eyebrow: z.string().nullable().optional(),
  titulo: z.string().nullable().optional(),
  introducao: z.string().nullable().optional(),
  regraPratica: z.string().nullable().optional(),
  tabela: z
    .object({
      colunas: z.array(z.string()),
      linhas: z.array(z.object({ rotulo: z.string(), valores: z.array(z.string()) })),
    })
    .nullable()
    .optional(),
  ctaRotulo: z.string().nullable().optional(),
  ctaUrl: z.string().nullable().optional(),
});

export const blocoSchema = z.discriminatedUnion('__component', [
  blocoHero,
  blocoBusca,
  blocoGradeDeCategorias,
  blocoProdutosEmDestaque,
  blocoDestaqueLed,
  blocoComoFunciona,
  blocoDiferenciais,
  blocoAvaliacoes,
  blocoChamadaFinal,
  blocoTextoRico,
  blocoFaq,
  blocoFormularioContato,
  blocoComparativoLed,
]);

/**
 * Bloco desconhecido (componente novo publicado antes do deploy do front) não pode
 * derrubar a página: vira `null` e é filtrado no adaptador.
 */
export const blocoTolerante = z.union([blocoSchema, z.unknown().transform(() => null)]);

export const paginaSchema = z.object({
  id: z.number(),
  documentId: z.string().optional(),
  titulo: z.string(),
  slug: z.string(),
  seo: seoSchema.nullable().optional(),
  blocos: z.array(blocoTolerante).nullable().optional(),
  locale: z.string().nullable().optional(),
});

// Envelopes prontos
export const menuItemColecao = colecao(menuItemSchema);
export const rodapeColunaColecao = colecao(rodapeColunaSchema);
export const settingsGlobaisUnico = unico(settingsGlobaisSchema);
export const produtoColecao = colecao(produtoSchema);
export const categoriaColecao = colecao(categoriaSchema);
export const faqItemColecao = colecao(faqItemSchema);
export const avaliacaoColecao = colecao(avaliacaoSchema);
export const paginaColecao = colecao(paginaSchema);

export type MenuItemCms = z.infer<typeof menuItemSchema>;
export type RodapeColunaCms = z.infer<typeof rodapeColunaSchema>;
export type SettingsGlobaisCms = z.infer<typeof settingsGlobaisSchema>;
export type SeoCms = z.infer<typeof seoSchema>;
export type ProdutoCms = z.infer<typeof produtoSchema>;
export type CategoriaCms = z.infer<typeof categoriaSchema>;
export type FaqItemCms = z.infer<typeof faqItemSchema>;
export type AvaliacaoCms = z.infer<typeof avaliacaoSchema>;
export type BlocoCms = z.infer<typeof blocoSchema>;
export type PaginaCms = z.infer<typeof paginaSchema>;
