'use client';

import styled from 'styled-components';
import { EmptyState } from '@/components/feedback/EmptyState';
import { Button } from '@/components/primitives/Button';
import type { Locale } from '@/i18n/config';

/**
 * Estado 1 do UI-SPEC (Bloco 8) — nenhum filtro, nenhuma busca, e mesmo assim zero produtos: o
 * catálogo não tem nenhum produto publicado no CMS. É uma tela DISTINTA de
 * `EstadoSemResultados` (que pressupõe filtro/busca ativos e produtos existentes que não
 * casaram) — aqui não há filtro nenhum para remover, então não faz sentido oferecer sugestões
 * de filtro.
 *
 * Cópia registrada como divergência D9 em `docs/divergencias.md`: o layout-fonte não prevê este
 * cenário (o estado sem busca do layout sempre assume a grade cheia), então não há texto-fonte
 * para transcrever — mesmo precedente já aberto por D4 para o estado "CMS indisponível" da Home.
 */
export interface EstadoCatalogoVazioProps {
  locale: Locale;
}

const Rodape = styled.div`
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

const EYEBROW = 'CATÁLOGO EM ATUALIZAÇÃO';
const TITULO = 'Nosso catálogo está sendo montado';
const TEXTO =
  'Ainda não há produtos publicados neste catálogo. A equipe está cadastrando o acervo — ' +
  'volte em breve ou descreva o que você precisa que a gente confirma o que já está ' +
  'disponível.';

export function EstadoCatalogoVazio({ locale }: EstadoCatalogoVazioProps) {
  return (
    <EmptyState eyebrow={EYEBROW} titulo={TITULO} texto={TEXTO}>
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
