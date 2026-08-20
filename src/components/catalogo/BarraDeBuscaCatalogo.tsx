'use client';

import { useState, useTransition, type ChangeEvent, type FormEvent } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import styled from 'styled-components';
import { Input, MensagemErro } from '@/components/primitives/Field';
import { Button } from '@/components/primitives/Button';
import { Spinner } from '@/components/feedback/Spinner';

/**
 * Bloco 2 do UI-SPEC — busca do catálogo. Variação de `SearchBarGrande` (E5, Home), não um
 * clone: `SearchBarGrande` navega para `/[locale]/catalogo?q=...`; esta busca já ESTÁ na rota
 * do catálogo e por isso reescreve a própria URL, preservando os demais filtros ativos
 * (categoria, tipo, cor, evento, ambiente, ordenar) via `useSearchParams()` — é o que os chips
 * e o painel de filtros (05-05/05-06) exigem para sobreviver a uma nova busca.
 *
 * `action`/`method` nativos cobrem o caminho sem JS (GET com `?q=` na própria rota); com JS,
 * o submit é interceptado para validar e usar o estado `pendente` real (`useTransition`).
 */

const MENSAGEM_ERRO = 'Digite um produto, equipamento ou solução para buscar.';

const RotuloCampo = styled.label`
  display: block;
  margin-bottom: 10px;
  font-family: ${({ theme }) => theme.fonte.mono};
  font-weight: ${({ theme }) => theme.peso.medio};
  font-size: ${({ theme }) => theme.tamanho[12]};
  letter-spacing: ${({ theme }) => theme.tracking.rotuloForte};
  color: ${({ theme }) => theme.cor.navInativo};
`;

const Caixa = styled.div`
  display: flex;
  border: 1px solid ${({ theme }) => theme.cor.tinta700};
  background: ${({ theme }) => theme.cor.tinta800};
  border-radius: ${({ theme }) => theme.raio.base};
`;

const CampoBusca = styled(Input)`
  flex: 1;
  min-width: 200px;
  padding: 15px;
  background: transparent;
  border: none;
  border-radius: 0;
  color: ${({ theme }) => theme.cor.fundo};
  &::placeholder {
    color: ${({ theme }) => theme.cor.textoMutedClaro};
  }
  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.cor.teal};
    outline-offset: -2px;
  }
`;

const BotaoBuscar = styled(Button)`
  border-left: 1px solid ${({ theme }) => theme.cor.tinta700};
  padding: 0 24px;
  border-radius: 0;
`;

const RotuloComSpinner = styled.span`
  display: inline-flex;
  gap: 8px;
  align-items: center;
`;

const ErroWrapper = styled.div`
  margin-top: 10px;
`;

export interface BarraDeBuscaCatalogoProps {
  /** O `q` já saneado pelo servidor (`parseFiltrosDaUrl`) — evita a caixa vazia quando o
   * visitante chega da Home com `?q=`. */
  termoInicial: string;
}

export function BarraDeBuscaCatalogo({ termoInicial }: BarraDeBuscaCatalogoProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [termo, setTermo] = useState(termoInicial);
  const [erro, setErro] = useState(false);
  const [pendente, iniciarTransicao] = useTransition();

  function aoDigitar(evento: ChangeEvent<HTMLInputElement>) {
    setTermo(evento.target.value);
  }

  function aoSubmeter(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    const termoLimpo = termo.trim();
    if (termoLimpo === '') {
      setErro(true);
      return;
    }
    setErro(false);
    const params = new URLSearchParams(searchParams.toString());
    params.set('q', termoLimpo);
    iniciarTransicao(() => {
      router.push(`?${params.toString()}`);
    });
  }

  return (
    <form noValidate action={pathname} method="get" onSubmit={aoSubmeter}>
      <RotuloCampo htmlFor="busca-catalogo">BUSCAR PRODUTOS NO CATÁLOGO</RotuloCampo>
      <Caixa>
        <CampoBusca
          type="search"
          id="busca-catalogo"
          name="q"
          value={termo}
          onChange={aoDigitar}
          placeholder="Busque por mesa, capa, guarda-sol, painel de LED..."
          aria-invalid={erro}
          aria-describedby={erro ? 'erro-busca-catalogo' : undefined}
        />
        <BotaoBuscar type="submit" $variante="pretoSolido" disabled={pendente}>
          {pendente ? (
            <RotuloComSpinner>
              <Spinner />
              BUSCANDO
            </RotuloComSpinner>
          ) : (
            'BUSCAR'
          )}
        </BotaoBuscar>
      </Caixa>
      {erro && (
        <ErroWrapper>
          <MensagemErro id="erro-busca-catalogo">{MENSAGEM_ERRO}</MensagemErro>
        </ErroWrapper>
      )}
    </form>
  );
}
