'use client';

/**
 * Error boundary do segmento `/[locale]/catalogo` — a partir de `src/app/[locale]/error.tsx`,
 * mesma assinatura (`{ error, retry }`) e mesmo padrão de `Notice`/`Button`. `retry` é a prop
 * estável desde o Next 16.3 (a versão deste projeto) e a recomendada pela documentação
 * instalada (`error.md`) — tenta buscar e renderizar o segmento de novo; a alternativa mais
 * antiga, que só limpa o estado sem refazer a busca, não é usada aqui.
 *
 * A cópia é genérica de falha de carregamento e não repete o convite a ampliar a busca que
 * pertence ao estado "sem resultados" (05-07) — telas distintas por CATA-04. Por T-05-16, nenhum
 * campo da instância de erro recebida (mensagem original ou hash de diagnóstico) é interpolado
 * na tela: nenhum detalhe interno de erro chega ao visitante, mesmo padrão já estabelecido na
 * Fase 4.
 */

import styled from 'styled-components';
import { Container } from '@/components/primitives/Container';
import { Notice } from '@/components/feedback/Notice';
import { Button } from '@/components/primitives/Button';

const Envolucro = styled.div`
  padding-block: clamp(64px, 9vw, 144px);
`;

export default function ErroDoCatalogo({
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return (
    <Envolucro>
      <Container>
        <Notice rotulo="ERRO" variante="escuro">
          Não foi possível carregar o catálogo agora.
        </Notice>
        <div style={{ marginTop: 16 }}>
          <Button $variante="primario" type="button" onClick={() => retry()}>
            TENTAR NOVAMENTE
          </Button>
        </div>
      </Container>
    </Envolucro>
  );
}
