'use client';

/**
 * Error boundary do segmento [locale] — o primeiro error.tsx do projeto.
 *
 * Granularidade (Q2 do RESEARCH, decisão travada): um único boundary aqui, e não um por bloco,
 * porque `getPagina` é uma chamada única — a falha é tudo-ou-nada e não há modo de falha
 * independente por bloco a isolar. O chrome sobrevive porque TopBar/Header/Footer vivem em
 * layout.tsx: error.tsx de um segmento envolve o page.tsx daquele segmento, não o layout.tsx
 * acima dele.
 *
 * Usa a prop `retry` — recomendada a partir do Next 16.3 (a versão exata deste projeto) para
 * tentar buscar e renderizar novamente o segmento. A alternativa mais antiga, hoje desencorajada
 * pela documentação, não é usada aqui.
 */

import styled from 'styled-components';
import { Container } from '@/components/primitives/Container';
import { Notice } from '@/components/feedback/Notice';
import { Button } from '@/components/primitives/Button';

const Envolucro = styled.div`
  padding-block: clamp(64px, 9vw, 144px);
`;

export default function ErroDoSegmento({
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return (
    <Envolucro>
      <Container>
        <Notice rotulo="ERRO" variante="escuro">
          Não foi possível carregar o conteúdo desta página agora.
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
