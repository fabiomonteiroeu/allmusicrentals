'use client';

/**
 * `loading.tsx` do segmento `/[locale]/catalogo` — o primeiro `loading.tsx` alcançável em
 * produção do projeto. A rota é dinâmica porque `page.tsx` acessa `searchParams` (Next 16), ao
 * contrário da Home (SSG), onde o fallback de `<Suspense>` resolvia inteiramente no prerender e
 * o visitante nunca o via de fato. Aqui, cada consulta ao CMS que o servidor faz antes de
 * responder deixa esta grade de esqueletos visível de verdade, no navegador real.
 *
 * `'use client'` é necessário porque o arquivo usa `styled-components` para o grid — a
 * documentação instalada (`loading.md`) permite explicitamente que `loading` seja Client
 * Component, embora o padrão seja Server Component. O componente não recebe nenhum parâmetro,
 * conforme a mesma documentação.
 *
 * `prefers-reduced-motion` não é duplicado aqui: a regra global de
 * `src/lib/theme/GlobalStyle.ts` já zera duração e delay de toda animação (inclusive o pulso do
 * `ProductCardSkeleton`) sob essa preferência.
 */

import styled from 'styled-components';
import { ProductCardSkeleton } from '@/components/feedback/Skeleton';
import { Container } from '@/components/primitives/Container';

const ConteudoWrapper = styled(Container)`
  padding-block: clamp(32px, 4vw, 64px);
`;

const TextoAcessivel = styled.p`
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
`;

const GradeDeEsqueletos = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: ${({ theme }) => theme.espaco[24]};
`;

const INDICES = [0, 1, 2, 3, 4, 5, 6, 7];

export default function CarregandoCatalogo() {
  return (
    <ConteudoWrapper>
      <TextoAcessivel>CARREGANDO PRODUTOS</TextoAcessivel>
      <GradeDeEsqueletos aria-busy="true">
        {INDICES.map((indice) => (
          <ProductCardSkeleton key={indice} indice={indice} />
        ))}
      </GradeDeEsqueletos>
    </ConteudoWrapper>
  );
}
