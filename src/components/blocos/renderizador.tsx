import { HeroBloco } from './HeroBloco';
import { BuscaBloco } from './BuscaBloco';
import { GradeDeCategoriasBloco } from './GradeDeCategoriasBloco';
import { ProdutosEmDestaqueBloco } from './ProdutosEmDestaqueBloco';
import { DestaqueLedBloco } from './DestaqueLedBloco';
import { ComoFuncionaBloco } from './ComoFuncionaBloco';
import { DiferenciaisBloco } from './DiferenciaisBloco';
import { AvaliacoesBloco } from './AvaliacoesBloco';
import { ChamadaFinalBloco } from './ChamadaFinalBloco';
import type { Bloco, Categoria, Produto, Avaliacao } from '@/lib/cms/adapters';
import type { Locale } from '@/i18n/config';

/**
 * Dispatcher da Dynamic Zone da Home — Server Component (sem 'use client').
 *
 * `switch`, não um mapa lookup (objeto indexado por string, tipo dicionário de componentes):
 * `tsconfig.json` tem `noUncheckedIndexedAccess: true`, então `mapa[bloco.__component]` seria
 * tipado como "componente ou indefinido" em toda chamada, forçando um `if` de runtime
 * redundante e perdendo o narrowing das props de cada bloco. O `switch` sobre a união
 * discriminada `Bloco` preserva o tipo estreitado em cada `case` — a mesma técnica de
 * `adaptarBloco` em `src/lib/cms/adapters.ts`.
 *
 * Um bloco de tipo desconhecido (ou de outra página — `blocos.texto-rico`, `blocos.faq`,
 * `blocos.formulario-contato`, `blocos.comparativo-led`, reservados às Fases 6 e 11) cai no
 * `default` e nunca quebra a Home. `adaptarBlocos` já descarta blocos verdadeiramente
 * desconhecidos no nível de dados — este `default` é a segunda barreira, para qualquer
 * `__component` que chegue aqui sem ser um dos 9 da Home.
 *
 * Chave de cada elemento: `${i}-${bloco.__component}`, NUNCA só `bloco.id`. Achado no
 * checkpoint HOME-04 (04-07): os ids de componente do Strapi são sequenciais por *tabela* de
 * componente, então colidem entre tipos diferentes na mesma Dynamic Zone (ex.: 8 dos 9 blocos
 * da página `home` real têm `id: 7`). `bloco.id` isolado não é único dentro da zona — React
 * duplicava/descartava filhos. O índice (estável dentro de um render) já bastaria; o
 * `__component` é acrescentado só para ficar legível no DevTools.
 */
export interface RenderizadorDeBlocosProps {
  blocos: Bloco[];
  locale: Locale;
  categorias: Categoria[];
  produtosDestaque: Produto[];
  avaliacoes: Avaliacao[];
}

export function RenderizadorDeBlocos({
  blocos,
  locale,
  categorias,
  produtosDestaque,
  avaliacoes,
}: RenderizadorDeBlocosProps) {
  return (
    <>
      {blocos.map((bloco, i) => {
        switch (bloco.__component) {
          case 'blocos.hero':
            return <HeroBloco key={`${i}-${bloco.__component}`} bloco={bloco} locale={locale} />;
          case 'blocos.busca':
            return <BuscaBloco key={`${i}-${bloco.__component}`} bloco={bloco} locale={locale} />;
          case 'blocos.grade-de-categorias':
            return (
              <GradeDeCategoriasBloco
                key={`${i}-${bloco.__component}`}
                bloco={bloco}
                locale={locale}
                categorias={categorias}
              />
            );
          case 'blocos.produtos-em-destaque':
            return (
              <ProdutosEmDestaqueBloco
                key={`${i}-${bloco.__component}`}
                bloco={bloco}
                locale={locale}
                produtos={produtosDestaque}
              />
            );
          case 'blocos.destaque-led':
            return (
              <DestaqueLedBloco key={`${i}-${bloco.__component}`} bloco={bloco} locale={locale} />
            );
          case 'blocos.como-funciona':
            return <ComoFuncionaBloco key={`${i}-${bloco.__component}`} bloco={bloco} />;
          case 'blocos.diferenciais':
            return <DiferenciaisBloco key={`${i}-${bloco.__component}`} bloco={bloco} />;
          case 'blocos.avaliacoes':
            return (
              <AvaliacoesBloco
                key={`${i}-${bloco.__component}`}
                bloco={bloco}
                locale={locale}
                avaliacoes={avaliacoes}
              />
            );
          case 'blocos.chamada-final':
            return (
              <ChamadaFinalBloco key={`${i}-${bloco.__component}`} bloco={bloco} locale={locale} />
            );
          default:
            // Bloco de outra página (texto-rico/faq/formulario-contato/comparativo-led) ou
            // tipo desconhecido: nunca quebra a Home.
            return null;
        }
      })}
    </>
  );
}
