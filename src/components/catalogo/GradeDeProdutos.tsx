'use client';

import styled from 'styled-components';
import { ProductCard } from '@/components/product/ProductCard';
import { EmissorViewItemList } from '@/components/analytics/EmissorViewItemList';
import { mapearParaProductCard } from '@/lib/product/mapearParaProductCard';
import type { ItemDeListaGA4 } from '@/lib/analytics/dataLayer';
import type { Produto } from '@/lib/cms/adapters';
import type { Locale } from '@/i18n/config';

/**
 * Bloco 7 do UI-SPEC — grade de resultados do catálogo. Recebe `produtos` já filtrados e
 * ordenados pela ÚNICA chamada a `getProdutos` de `page.tsx` (armadilha 1 do RESEARCH §6: a
 * contagem da toolbar e a grade precisam vir do mesmo array de resposta) — este componente não
 * refaz nem refina a consulta, só apresenta o resultado.
 *
 * `mapearParaProductCard` (D-08) é a única ponte `Produto` → `ProdutoResumo`: este componente
 * nunca monta a prop do card à mão, para que o `ProductCard` continue sem conhecimento do
 * modelo do CMS.
 */
export interface GradeDeProdutosProps {
  produtos: Produto[];
  locale: Locale;
}

/* D5/D7 — o `gridProdutos` calculado por JS de viewport no layout-fonte vira `auto-fit` puro,
   sem media query nova e sem estado de largura lido no cliente (mesmo padrão já aceito em
   D1/D3/D5 de docs/divergencias.md). */
const Grade = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
`;

export function GradeDeProdutos({ produtos, locale }: GradeDeProdutosProps) {
  const itensDoEvento: ItemDeListaGA4[] = produtos.map((produto, indice) => ({
    item_id: produto.slug,
    item_name: produto.nome,
    ...(produto.categoria ? { item_category: produto.categoria.slug } : {}),
    index: indice,
  }));

  return (
    <>
      <Grade>
        {produtos.map((produto) => (
          // Callback de adicionar ao orçamento deliberadamente omitido aqui (mesma decisão já
          // aplicada ao slider da Home na Fase 4): o botão fica visualmente presente e
          // funcionalmente inerte, porque o carrinho é a Fase 8. Nada de toast/tooltip de
          // "em breve" — cópia inexistente na fonte. O `href` do card aponta para a rota
          // canônica de produto (Fase 7); até lá, o link dá 404, comportamento já aceito.
          <ProductCard key={produto.slug} produto={mapearParaProductCard(produto, locale)} />
        ))}
      </Grade>

      <EmissorViewItemList
        listaId="catalogo_resultados"
        listaNome="Catálogo — resultados"
        itens={itensDoEvento}
      />
    </>
  );
}
