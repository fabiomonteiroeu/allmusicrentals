'use client';

import { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { ProductCard } from '@/components/product/ProductCard';
import { EmissorViewItemList } from '@/components/analytics/EmissorViewItemList';
import { mapearParaProductCard } from '@/lib/product/mapearParaProductCard';
import type { ItemDeListaGA4 } from '@/lib/analytics/dataLayer';
import type { Produto } from '@/lib/cms/adapters';
import type { Locale } from '@/i18n/config';

/**
 * Bloco 4 da Home — faixa de produtos em destaque com `scroll-snap` nativo (sem biblioteca).
 * `'use client'` porque há estado local (posição das setas, contador) e efeitos (scroll,
 * `IntersectionObserver`).
 *
 * Recebe `subtitulo` (e não só a lista de produtos) porque, no layout-fonte, o parágrafo de
 * introdução e os controles do slider (contador + setas) ficam na mesma linha, e os controles
 * precisam de `ref` para a faixa — por isso o cabeçalho inteiro vive aqui, não no Server
 * Component pai (`ProdutosEmDestaqueBloco`).
 */

export interface SliderDeProdutosProps {
  produtos: Produto[];
  locale: Locale;
  subtitulo?: string | null;
}

const Cabecalho = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
  align-items: flex-end;
  justify-content: space-between;
  margin-bottom: 40px;
`;

const Introducao = styled.p`
  margin: 0;
  font-size: ${({ theme }) => theme.tamanho[17]};
  line-height: 1.55;
  color: ${({ theme }) => theme.cor.tinta600};
  max-width: 58ch;
`;

const Controles = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const Contador = styled.span`
  font-family: ${({ theme }) => theme.fonte.mono};
  font-size: ${({ theme }) => theme.tamanho[13]};
  letter-spacing: ${({ theme }) => theme.tracking.rotulo};
  color: ${({ theme }) => theme.cor.textoMuted};
`;

const Seta = styled.button`
  width: 48px;
  height: 48px;
  flex: none;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid ${({ theme }) => theme.cor.tinta900};
  border-radius: ${({ theme }) => theme.raio.base};
  background: transparent;
  color: ${({ theme }) => theme.cor.tinta900};
  cursor: pointer;
  &:hover {
    background: ${({ theme }) => theme.cor.tinta900};
    color: ${({ theme }) => theme.cor.fundo};
  }
  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.cor.tealLink};
    outline-offset: 3px;
  }
  &:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }
`;

/* Faixa com rolagem nativa e encaixe (CSS `scroll-snap`) — substitui o cálculo de cards por
   viewport e o deslocamento via `transform` do layout-fonte (que lia a largura da janela, o
   mesmo problema que D1 já rejeitou no chrome). Não há dots: só as duas setas e o contador,
   como no layout-fonte. */
const Faixa = styled.div`
  overflow-x: auto;
  overflow-y: hidden;
  scroll-snap-type: x mandatory;
  display: flex;
  gap: 24px;
`;

const Item = styled.div`
  flex: 0 0 clamp(260px, 26vw, 300px);
  scroll-snap-align: start;
  min-width: 0;
`;

/** Checa `prefers-reduced-motion` de forma defensiva: alguns ambientes (jsdom) não implementam
    `window.matchMedia`, então o padrão seguro sem a API é "reduzir" (salto instantâneo). */
function preferemReduzirMovimento(): boolean {
  return typeof window.matchMedia === 'function'
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false;
}

export function SliderDeProdutos({ produtos, locale, subtitulo }: SliderDeProdutosProps) {
  const faixaRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [podeVoltar, setPodeVoltar] = useState(false);
  const [podeAvancar, setPodeAvancar] = useState(produtos.length > 1);
  // Estado inicial já cobre a degradação sem IntersectionObserver (ambiente de teste antigo) —
  // evita chamar setState de forma síncrona no corpo do efeito de montagem.
  const [visiveis, setVisiveis] = useState(() => {
    if (produtos.length === 0) return { primeiro: 0, ultimo: 0 };
    if (typeof IntersectionObserver === 'undefined') {
      return { primeiro: 1, ultimo: produtos.length };
    }
    return { primeiro: 1, ultimo: 1 };
  });

  /** Lê as 3 propriedades de scroll da faixa e recalcula o estado (habilitado/desabilitado)
      das duas setas, com epsilon de 1px para arredondamento de sub-pixel. */
  function atualizarSetas() {
    const faixa = faixaRef.current;
    if (!faixa) return;
    // jsdom (ambiente de teste) não calcula layout: `scrollWidth`/`clientWidth` ficam sempre 0.
    // Sem esta guarda, o efeito de montagem sempre desabilitaria "Próximos produtos" no teste,
    // mesmo havendo produtos suficientes para rolar.
    if (faixa.scrollWidth === 0 && faixa.clientWidth === 0) return;
    setPodeVoltar(faixa.scrollLeft > 0);
    setPodeAvancar(faixa.scrollLeft + faixa.clientWidth < faixa.scrollWidth - 1);
  }

  useEffect(() => {
    atualizarSetas();
  }, []);

  // Contador via IntersectionObserver — nunca via cronômetro repetido ou leitura de `scroll`.
  // Guarda um conjunto persistente de índices atualmente visíveis (entradas só reportam o que
  // mudou) e recalcula o menor/maior índice (1-based) a cada mudança de interseção.
  useEffect(() => {
    if (produtos.length === 0) return;
    // Sem IntersectionObserver, o estado inicial já cobre a degradação — nada a observar.
    if (typeof IntersectionObserver === 'undefined') return;
    const intersectando = new Set<number>();
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const indice = itemRefs.current.findIndex((el) => el === entry.target);
          if (indice === -1) return;
          if (entry.isIntersecting) intersectando.add(indice);
          else intersectando.delete(indice);
        });
        if (intersectando.size === 0) return;
        const indices = [...intersectando];
        setVisiveis({ primeiro: Math.min(...indices) + 1, ultimo: Math.max(...indices) + 1 });
      },
      { root: faixaRef.current, threshold: 0.6 },
    );
    itemRefs.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, [produtos.length]);

  function mover(direcao: 1 | -1) {
    const faixa = faixaRef.current;
    if (!faixa) return;
    // Nunca assumir largura fixa por breakpoint: mede o card real no DOM — é exatamente o
    // cálculo de cards por largura de janela do layout-fonte que estamos eliminando.
    const primeiroCard = faixa.firstElementChild as HTMLElement | null;
    const largura = primeiroCard?.getBoundingClientRect().width ?? 0;
    const suave = !preferemReduzirMovimento();
    faixa.scrollBy({ left: direcao * (largura + 24), behavior: suave ? 'smooth' : 'auto' });
  }

  const itensDoEvento: ItemDeListaGA4[] = produtos.map((p, i) => ({
    item_id: p.slug,
    item_name: p.nome,
    index: i,
    ...(p.categoria ? { item_category: p.categoria.nome } : {}),
  }));

  return (
    <div>
      <Cabecalho>
        {subtitulo && <Introducao>{subtitulo}</Introducao>}
        <Controles>
          <Contador aria-live="polite">
            {visiveis.primeiro}–{visiveis.ultimo} / {produtos.length}
          </Contador>
          <Seta
            type="button"
            aria-label="Produtos anteriores"
            disabled={!podeVoltar}
            onClick={() => mover(-1)}
          >
            <span aria-hidden="true">←</span>
          </Seta>
          <Seta
            type="button"
            aria-label="Próximos produtos"
            disabled={!podeAvancar}
            onClick={() => mover(1)}
          >
            <span aria-hidden="true">→</span>
          </Seta>
        </Controles>
      </Cabecalho>

      {/* Os 5 cards ficam todos no DOM (sem virtualização): a ordem de foco por Tab é a ordem
          do DOM, e um card fora de vista que recebe foco entra em vista por comportamento
          nativo de contêiner `overflow: auto` — não é necessário `scrollIntoView` manual, nem
          capturar ArrowLeft/ArrowRight (o scroll nativo por teclado já funciona). */}
      <Faixa
        ref={faixaRef}
        role="region"
        aria-label="Produtos em destaque"
        onScroll={atualizarSetas}
      >
        {produtos.map((produto, i) => (
          <Item
            key={produto.id}
            ref={(el) => {
              itemRefs.current[i] = el;
            }}
          >
            {/* Callback de adicionar ao orçamento deliberadamente omitido (decisão Q3): o botão
                "ADICIONAR AO ORÇAMENTO" fica visualmente presente e funcionalmente inerte,
                porque o carrinho é a Fase 8. A validação de cor obrigatória continua
                funcionando por estado local do próprio ProductCard. Não inventar toast de
                "em breve" — cópia inexistente na fonte. */}
            <ProductCard produto={mapearParaProductCard(produto, locale)} />
          </Item>
        ))}
      </Faixa>

      <EmissorViewItemList
        listaId="home_destaques"
        listaNome="Produtos em destaque — Home"
        itens={itensDoEvento}
      />
    </div>
  );
}
