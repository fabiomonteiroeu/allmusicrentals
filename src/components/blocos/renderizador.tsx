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
            return <HeroBloco key={bloco.id ?? i} bloco={bloco} locale={locale} />;
          case 'blocos.busca':
            return <BuscaBloco key={bloco.id ?? i} bloco={bloco} locale={locale} />;
          case 'blocos.grade-de-categorias':
            return (
              <GradeDeCategoriasBloco
                key={bloco.id ?? i}
                bloco={bloco}
                locale={locale}
                categorias={categorias}
              />
            );
          case 'blocos.produtos-em-destaque':
            return (
              <ProdutosEmDestaqueBloco
                key={bloco.id ?? i}
                bloco={bloco}
                locale={locale}
                produtos={produtosDestaque}
              />
            );
          case 'blocos.destaque-led':
            return <DestaqueLedBloco key={bloco.id ?? i} bloco={bloco} locale={locale} />;
          case 'blocos.como-funciona':
            return <ComoFuncionaBloco key={bloco.id ?? i} bloco={bloco} />;
          case 'blocos.diferenciais':
            return <DiferenciaisBloco key={bloco.id ?? i} bloco={bloco} />;
          case 'blocos.avaliacoes':
            return (
              <AvaliacoesBloco
                key={bloco.id ?? i}
                bloco={bloco}
                locale={locale}
                avaliacoes={avaliacoes}
              />
            );
          case 'blocos.chamada-final':
            return <ChamadaFinalBloco key={bloco.id ?? i} bloco={bloco} locale={locale} />;
          default:
            // Bloco de outra página (texto-rico/faq/formulario-contato/comparativo-led) ou
            // tipo desconhecido: nunca quebra a Home.
            return null;
        }
      })}
    </>
  );
}
