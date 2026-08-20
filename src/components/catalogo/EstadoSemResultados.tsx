'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import styled from 'styled-components';
import { EmptyState } from '@/components/feedback/EmptyState';
import { Button } from '@/components/primitives/Button';
import type { Locale } from '@/i18n/config';

/**
 * Estado 3 do UI-SPEC (Bloco 8) — há busca ou filtro aplicado e o resultado é zero. Cópia
 * literal do layout-fonte (`projeto-base/All Music Rentals - Catalogo.dc.html`, bloco
 * `estadoVazio`), sem paráfrase.
 *
 * Deliberadamente NÃO recebe o termo buscado por prop: o layout-fonte não ecoa o valor digitado
 * nesta tela, e não aceitar o dado na origem fecha de saída a superfície clássica de refletir
 * entrada do visitante direto na tela (T-05-29 do modelo de ameaças).
 *
 * A primeira sugestão (zerar os grupos de filtro) segue a mesma regra do botão `LIMPAR TUDO` de
 * `ChipsDeFiltroAtivo.tsx` (05-06): preserva `q` e `ordenar`. As duas outras sugestões
 * substituem toda a query por um único parâmetro alvo — não é remover um filtro, é navegar para
 * outro recorte.
 */
export interface EstadoSemResultadosProps {
  locale: Locale;
}

const TEXTO_SEM_CORRESPONDENCIA =
  'Nenhum produto do catálogo combina com todos os filtros aplicados ao mesmo tempo. Tente ' +
  'remover o filtro mais específico, ou envie sua necessidade — trabalhamos com itens que ' +
  'ainda não estão publicados.';

const BlocoSugestoes = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.espaco[12]};
`;

const RotuloSugestoes = styled.p`
  margin: 0;
  font-family: ${({ theme }) => theme.fonte.mono};
  font-weight: ${({ theme }) => theme.peso.medio};
  font-size: ${({ theme }) => theme.tamanho[12]};
  letter-spacing: ${({ theme }) => theme.tracking.rotuloForte};
  color: ${({ theme }) => theme.cor.textoMuted};
`;

const ListaSugestoes = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.espaco[8]};
`;

/* Segunda e terceira sugestão: borda clara em repouso, escurece só no hover — variação do
   `outlinePreto` do primitivo (que já nasce com borda escura). Fidelidade ao layout-fonte, que
   distingue visualmente a primeira ação (zerar os filtros) das duas de navegação. */
const BotaoSugestaoSecundario = styled(Button)`
  border-color: ${({ theme }) => theme.cor.borda};
  background: ${({ theme }) => theme.cor.branco};
  &:hover {
    background: ${({ theme }) => theme.cor.branco};
    border-color: ${({ theme }) => theme.cor.tinta900};
    color: ${({ theme }) => theme.cor.tinta900};
  }
`;

const Rodape = styled.div`
  border-top: 1px solid ${({ theme }) => theme.cor.borda};
  padding-top: ${({ theme }) => theme.espaco[24]};
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.espaco[12]};
  align-items: center;
`;

const TextoApoio = styled.p`
  margin: 0;
  font-family: ${({ theme }) => theme.fonte.corpo};
  font-size: ${({ theme }) => theme.tamanho[15]};
  line-height: 1.5;
  color: ${({ theme }) => theme.cor.tinta600};
`;

export function EstadoSemResultados({ locale }: EstadoSemResultadosProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function removerTodosOsFiltros() {
    // Mesma regra do `limparFiltros` de ChipsDeFiltroAtivo.tsx: `q` e `ordenar` sobrevivem,
    // porque limpar filtro não é o mesmo que apagar a busca ou a ordenação escolhida.
    const params = new URLSearchParams();
    const q = searchParams.get('q');
    const ordenar = searchParams.get('ordenar');
    if (q) params.set('q', q);
    if (ordenar) params.set('ordenar', ordenar);
    router.push(`${pathname}?${params.toString()}`);
  }

  function verPaineisDeLed() {
    router.push(`${pathname}?categoria=telas-de-led`);
  }

  function verMesasDeCoquetel() {
    // "Mesas de coquetel" é subcategoria dentro de Móveis, sem filtro próprio nesta fase
    // (per D-02) — a rota é uma busca textual, não um filtro de categoria/tipo.
    router.push(`${pathname}?q=mesa`);
  }

  return (
    <EmptyState
      eyebrow="BUSCA SEM CORRESPONDÊNCIA"
      titulo="Amplie a busca ou fale com a equipe"
      texto={TEXTO_SEM_CORRESPONDENCIA}
    >
      <BlocoSugestoes>
        <RotuloSugestoes>SUGESTÕES</RotuloSugestoes>
        <ListaSugestoes>
          <Button
            type="button"
            $variante="outlinePreto"
            $tamanho="sm"
            onClick={removerTodosOsFiltros}
          >
            Remover todos os filtros
          </Button>
          <BotaoSugestaoSecundario type="button" $tamanho="sm" onClick={verPaineisDeLed}>
            Ver painéis de LED
          </BotaoSugestaoSecundario>
          <BotaoSugestaoSecundario type="button" $tamanho="sm" onClick={verMesasDeCoquetel}>
            Ver mesas de coquetel
          </BotaoSugestaoSecundario>
        </ListaSugestoes>
      </BlocoSugestoes>

      <Rodape>
        <Button as="a" href={`/${locale}/solicitar-orcamento`} $variante="primario" $tamanho="md">
          SOLICITAR ORÇAMENTO
        </Button>
        <TextoApoio>
          Descreva o item e a data — a equipe responde com o que temos disponível.
        </TextoApoio>
      </Rodape>
    </EmptyState>
  );
}
