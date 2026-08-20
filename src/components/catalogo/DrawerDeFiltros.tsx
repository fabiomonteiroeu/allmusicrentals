'use client';

import { useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import styled from 'styled-components';
import * as Dialog from '@radix-ui/react-dialog';
import { media } from '@/lib/theme/media';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { definirDrawerFiltros } from '@/store/slices/uiSlice';
import { PainelDeFiltros, type OpcoesDinamicasDeFiltro } from './PainelDeFiltros';

/**
 * Bloco 6 do UI-SPEC — drawer mobile de filtros. Primeiro consumidor real de
 * `@radix-ui/react-dialog` no projeto: o pacote está instalado desde a Fase 1 mas nunca foi
 * importado em `src/` (confirmado por `grep -rln "from '@radix-ui" src` antes deste plano).
 * `MobileMenu.tsx` (chrome) NÃO é precedente de mecanismo — é `display: none/block` por media
 * query comandado por um booleano do Redux, sem foco preso, sem `Esc`, sem retorno de foco.
 * Este componente usa o Radix em modo controlado e modal (padrão), e por isso os
 * comportamentos de acessibilidade abaixo vêm de graça, sem reimplementação:
 *
 * - foco preso dentro do `Content` (o Radix prende o foco por padrão em modo modal — que é o
 *   padrão — e nenhuma das props de escape hatch de foco/teclado do Radix é passada aqui, então
 *   nenhum comportamento padrão é sobrescrito);
 * - a tecla de saída padrão fecha o diálogo (handler nativo do `DismissableLayer`);
 * - ao fechar, o foco volta para o elemento que estava focado antes da abertura — o botão
 *   `FILTROS` da toolbar (05-05), já que este componente não renderiza `Dialog.Trigger`;
 * - scroll do fundo bloqueado enquanto aberto (`Dialog.Overlay` em modo modal).
 *
 * Abertura/fechamento é comandado pelo `uiSlice` (`drawerFiltrosAberto`/`definirDrawerFiltros`),
 * não por estado local: a toolbar despacha a abertura, este componente só lê o booleano e
 * despacha o fechamento (clique no X, `LIMPAR`, `Esc` ou aplicar).
 *
 * Registro para o SUMMARY: foco preso e retorno de foco não são verificáveis com fidelidade em
 * jsdom (RESEARCH §6 armadilha 3) — o teste unitário cobre montagem, nome acessível, `Esc` e
 * os textos/ações do rodapé; a prova real de foco fica no e2e Playwright de 05-08.
 */

/** Só o Portal (Overlay + Content) some acima de 1080px — nenhum breakpoint novo (D-07/D7). */
const Envelope = styled.div`
  display: contents;

  ${media.desktop} {
    display: none;
  }
`;

const Overlay = styled(Dialog.Overlay)`
  position: fixed;
  inset: 0;
  background: rgba(11, 12, 13, 0.6);
  z-index: ${({ theme }) => theme.z.drawer};
`;

const Painel = styled(Dialog.Content)`
  position: fixed;
  inset-inline: 0;
  bottom: 0;
  max-height: 88vh;
  display: flex;
  flex-direction: column;
  background: ${({ theme }) => theme.cor.branco};
  border-radius: 12px 12px 0 0;
  z-index: ${({ theme }) => theme.z.drawer};
  animation: amrDrawer 0.22s ease-out;

  /* Única media query literal deste arquivo: prefers-reduced-motion é preferência do
     usuário, não breakpoint de largura — D-07 restringe breakpoint, não esta consulta. */
  @media (prefers-reduced-motion: reduce) {
    animation-duration: 0.01ms;
  }

  &:focus {
    outline: none;
  }
`;

const Cabecalho = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${({ theme }) => theme.espaco[20]};
  border-bottom: 1px solid ${({ theme }) => theme.cor.borda};
`;

const Titulo = styled(Dialog.Title)`
  margin: 0;
  font-family: ${({ theme }) => theme.fonte.display};
  font-size: ${({ theme }) => theme.tamanho[20]};
  color: ${({ theme }) => theme.cor.tinta900};
`;

const BotaoFechar = styled(Dialog.Close)`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border: none;
  background: transparent;
  font-size: ${({ theme }) => theme.tamanho[22]};
  color: ${({ theme }) => theme.cor.tinta900};
  cursor: pointer;

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.cor.tealLink};
    outline-offset: 2px;
  }
`;

const Corpo = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: ${({ theme }) => theme.espaco[20]};
`;

const Rodape = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.espaco[12]};
  padding: ${({ theme }) => theme.espaco[20]};
  border-top: 1px solid ${({ theme }) => theme.cor.borda};
`;

const BotaoLimpar = styled.button`
  min-height: 44px;
  padding: 0 ${({ theme }) => theme.espaco[16]};
  border: 1px solid ${({ theme }) => theme.cor.tinta900};
  border-radius: ${({ theme }) => theme.raio.base};
  background: transparent;
  color: ${({ theme }) => theme.cor.tinta900};
  font-family: ${({ theme }) => theme.fonte.mono};
  font-weight: ${({ theme }) => theme.peso.medio};
  letter-spacing: ${({ theme }) => theme.tracking.rotulo};
  text-transform: uppercase;
  cursor: pointer;

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.cor.tealLink};
    outline-offset: 2px;
  }
`;

const BotaoAplicar = styled.button`
  flex: 1;
  min-height: 44px;
  border: none;
  border-radius: ${({ theme }) => theme.raio.base};
  background: ${({ theme }) => theme.cor.tinta900};
  color: ${({ theme }) => theme.cor.branco};
  font-family: ${({ theme }) => theme.fonte.display};
  font-variation-settings: 'wdth' 75;
  font-weight: ${({ theme }) => theme.peso.display};
  text-transform: uppercase;
  cursor: pointer;

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.cor.teal};
    outline-offset: 2px;
  }
`;

/**
 * Remove todos os filtros preservando `q` e `ordenar` — mesma regra do `LIMPAR TUDO` de
 * `ChipsDeFiltroAtivo` (05-06 Task 1): limpar filtro não é o mesmo que apagar a busca ou a
 * ordenação escolhida.
 */
function limparFiltros(params: URLSearchParams): URLSearchParams {
  const novo = new URLSearchParams();
  const q = params.get('q');
  const ordenar = params.get('ordenar');
  if (q) novo.set('q', q);
  if (ordenar) novo.set('ordenar', ordenar);
  return novo;
}

export interface DrawerDeFiltrosProps {
  /** Mesmas opções de grupo passadas ao `PainelDeFiltros` do aside. */
  grupos: OpcoesDinamicasDeFiltro;
  /** `produtos.length` — o mesmo total que alimenta a toolbar, nunca uma segunda consulta. */
  total: number;
}

export function DrawerDeFiltros({ grupos, total }: DrawerDeFiltrosProps) {
  const aberto = useAppSelector((s) => s.ui.drawerFiltrosAberto);
  const dispatch = useAppDispatch();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [, iniciarTransicao] = useTransition();

  function aoLimpar() {
    const novosParams = limparFiltros(searchParams);
    iniciarTransicao(() => {
      router.push(`?${novosParams.toString()}`);
    });
  }

  function fechar() {
    dispatch(definirDrawerFiltros(false));
  }

  return (
    <Dialog.Root open={aberto} onOpenChange={(valor) => dispatch(definirDrawerFiltros(valor))}>
      <Dialog.Portal>
        <Envelope>
          <Overlay />
          <Painel aria-describedby={undefined}>
            <Cabecalho>
              <Titulo>Filtros</Titulo>
              <BotaoFechar aria-label="Fechar">×</BotaoFechar>
            </Cabecalho>
            <Corpo>
              <PainelDeFiltros grupos={grupos} idPrefixo="drawer" />
            </Corpo>
            <Rodape>
              <BotaoLimpar type="button" onClick={aoLimpar}>
                LIMPAR
              </BotaoLimpar>
              <BotaoAplicar type="button" onClick={fechar}>
                {total === 1 ? 'VER 1 PRODUTO' : `VER ${total} PRODUTOS`}
              </BotaoAplicar>
            </Rodape>
          </Painel>
        </Envelope>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
