import type { Produto } from '@/lib/cms/adapters';
import type { ProdutoResumo } from '@/components/product/ProductCard';
import type { Locale } from '@/i18n/config';

/**
 * Ponte `Produto` (adaptador CMS) → `ProdutoResumo` (prop do `ProductCard`).
 * Módulo puro, sem a diretiva de componente de cliente e sem CSS-in-JS — é transformação de
 * dados, chamada tanto de Server quanto de Client Components.
 *
 * Decisões de mapeamento (fixadas aqui, não deixadas para quem chama):
 * - `categoria`: nome do produto em caixa-alta — o `Categoria` do `ProductCard` é mono/tracking
 *   forte e as fixtures existentes usam caixa-alta (ex. 'MÓVEIS'). Categoria ausente vira string
 *   vazia, e a linha simplesmente não mostra texto (nunca renderizar 'SEM CATEGORIA').
 * - `spec`: primeira medida, senão material, senão a constante abaixo.
 * - `descricao`: sempre a descrição curta — nunca o campo de HTML sanitizado (é `HtmlSeguro` e
 *   o card renderiza texto puro, não HTML).
 * - `cores`: o valor devolvido é o **nome** da cor, porque `ColorSwatches` resolve o hex por
 *   `coresProduto[nome]`; nome fora das 5 chaves conhecidas cai no cinza neutro `#CCCCCC` —
 *   comportamento já existente do primitivo, não tratado aqui.
 * - `href`: rota canônica de produto `/[locale]/[categoria]/[slug]` (decisão travada
 *   2026-08-17), só montada quando `produto.categoria` existe. Sem categoria, melhor um card
 *   sem link que um link para rota inexistente.
 */
export function mapearParaProductCard(produto: Produto, locale: Locale): ProdutoResumo {
  // noUncheckedIndexedAccess: guardar em variável e testar antes de usar.
  const primeiraMedida = produto.medidas[0];
  const spec = primeiraMedida
    ? `${primeiraMedida.rotulo} · ${primeiraMedida.valor}`.toUpperCase()
    : produto.material
      ? produto.material.toUpperCase()
      : 'ESPECIFICAÇÃO SOB CONSULTA';

  const ehServico = produto.tipoDeItem === 'servico-tecnico';
  const escopo = produto.aplicacoes[0] ?? produto.caracteristicas[0];

  const cores = produto.variacoes.filter((v) => v.tipo.toLowerCase() === 'cor').map((v) => v.nome);

  const fotoSrc = produto.imagens[0]?.url;
  const fotoHoverSrc = produto.imagens[1]?.url;

  return {
    nome: produto.nome,
    categoria: (produto.categoria?.nome ?? '').toUpperCase(),
    spec,
    descricao: produto.descricaoCurta ?? '',
    ehServico,
    ...(fotoSrc ? { fotoSrc } : {}),
    ...(fotoHoverSrc ? { fotoHoverSrc } : {}),
    ...(ehServico && escopo ? { escopo } : {}),
    ...(cores.length > 0 ? { cores } : {}),
    ...(produto.categoria ? { href: `/${locale}/${produto.categoria.slug}/${produto.slug}` } : {}),
  };
}
