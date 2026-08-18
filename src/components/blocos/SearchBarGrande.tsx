'use client';

import { useState, useTransition, type ChangeEvent, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import styled from 'styled-components';
import { Input, MensagemErro } from '@/components/primitives/Field';
import { Button } from '@/components/primitives/Button';
import { Spinner } from '@/components/feedback/Spinner';
import type { Locale } from '@/i18n/config';

/**
 * E5 — composto da busca grande (Bloco 2 da Home). Vive em `blocos/`, não em `primitives/`:
 * é composição de primitivos existentes (Input, Button, Spinner, MensagemErro), não um
 * primitivo novo. `pendente` vem do hook de transição do React (estado real de navegação) —
 * nunca uma simulação de tempo fixo como no layout-fonte.
 */
export interface SearchBarGrandeProps {
  locale: Locale;
  placeholder?: string | null;
}

const Caixa = styled.div`
  display: flex;
  border: 1px solid ${({ theme }) => theme.cor.tinta900};
  background: ${({ theme }) => theme.cor.branco};
  border-radius: ${({ theme }) => theme.raio.base};
`;

const CampoBusca = styled(Input)`
  flex: 1;
  min-width: 200px;
  padding: 16px;
  font-size: ${({ theme }) => theme.tamanho[16]};
  /* campoBase traz border 1px solid borda — sem este override ficaria borda dentro
     de borda, já que a borda desta composição pertence à Caixa, não ao input. */
  border: none;
  border-radius: 0;
  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.cor.teal};
    outline-offset: -2px;
  }
`;

const BotaoBuscar = styled(Button)`
  border-left: 1px solid ${({ theme }) => theme.cor.tinta900};
  padding: 16px 28px;
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

export function SearchBarGrande({ locale, placeholder }: SearchBarGrandeProps) {
  const router = useRouter();
  const [termo, setTermo] = useState('');
  const [erro, setErro] = useState(false);
  const [pendente, iniciarTransicao] = useTransition();

  function aoDigitar(evento: ChangeEvent<HTMLInputElement>) {
    setTermo(evento.target.value);
  }

  function aoSubmeter(evento: FormEvent<HTMLFormElement>) {
    // `action`/`method` nativos cobrem o caminho sem JS (navegação GET com `?q=`);
    // com JS, assumimos aqui para validar e usar o estado pendente real.
    evento.preventDefault();
    const termoLimpo = termo.trim();
    if (termoLimpo === '') {
      setErro(true);
      return;
    }
    setErro(false);
    iniciarTransicao(() => {
      router.push(`/${locale}/catalogo?q=${encodeURIComponent(termoLimpo)}`);
    });
  }

  return (
    <form noValidate action={`/${locale}/catalogo`} method="get" onSubmit={aoSubmeter}>
      <Caixa>
        <CampoBusca
          type="search"
          name="q"
          value={termo}
          onChange={aoDigitar}
          placeholder={placeholder ?? 'Busque por mesa, capa, guarda-sol, painel de LED...'}
          aria-invalid={erro}
          aria-describedby={erro ? 'erro-busca-home' : undefined}
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
          <MensagemErro id="erro-busca-home">
            Digite um produto, equipamento ou solução para buscar.
          </MensagemErro>
        </ErroWrapper>
      )}
    </form>
  );
}
