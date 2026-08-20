'use client';

import { useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import styled from 'styled-components';
import * as Accordion from '@radix-ui/react-accordion';
import {
  GRUPOS_DE_FILTRO,
  alternarValor,
  type GrupoDeFiltro,
  type IdGrupoFiltro,
  type OpcaoDeFiltro,
} from '@/lib/catalogo/filtros';
import { SwatchesDeCor } from './SwatchesDeCor';

/**
 * Painel de filtros do catálogo (Bloco 3 do UI-SPEC) — acordeão múltiplo dos 5 grupos.
 * Primeiro consumidor real de `@radix-ui/react-accordion` no projeto: nenhum acordeão existe
 * em `src/` antes deste componente, então a API vem direto de
 * `node_modules/@radix-ui/react-accordion/dist/index.d.ts`, não de precedente interno.
 * `Accordion.Trigger` já é um `<button>` que responde a `Enter`/`Space` e expõe
 * `aria-expanded`/`aria-controls` corretos — não reimplementamos handler de teclado por cima.
 *
 * O painel NÃO tem estado próprio de filtro: lê o valor corrente de `useSearchParams()` e, a
 * cada alternância, chama `alternarValor` (`src/lib/catalogo/filtros.ts`) e faz `router.push`
 * dentro de `useTransition`. A URL continua sendo a única fonte de verdade — recarregar,
 * voltar no histórico ou colar o link reconstroem exatamente o mesmo estado. O estado
 * aberto/fechado do acordeão em si é UI efêmera e fica só no Radix (não vai para a URL).
 *
 * `idPrefixo` evita colisão de `id` de checkbox quando o mesmo painel é renderizado duas vezes
 * na página (aside deste plano e drawer mobile de 05-06).
 */

const GRUPOS_ABERTOS_POR_PADRAO = GRUPOS_DE_FILTRO.filter((g) => g.abertoPorPadrao).map(
  (g) => g.id,
);

const Root = styled(Accordion.Root)`
  display: grid;
  gap: ${({ theme }) => theme.espaco[4]};
`;

const Item = styled(Accordion.Item)`
  border-bottom: 1px solid ${({ theme }) => theme.cor.borda};
`;

const Trigger = styled(Accordion.Trigger)`
  display: flex;
  width: 100%;
  min-height: 44px;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.espaco[8]};
  padding: ${({ theme }) => `${theme.espaco[12]} 0`};
  background: transparent;
  border: none;
  cursor: pointer;
  font-family: ${({ theme }) => theme.fonte.mono};
  font-weight: ${({ theme }) => theme.peso.medio};
  font-size: ${({ theme }) => theme.tamanho[13]};
  letter-spacing: ${({ theme }) => theme.tracking.rotulo};
  text-transform: uppercase;
  color: ${({ theme }) => theme.cor.tinta900};

  /* prefers-reduced-motion não é duplicado aqui: a regra global (GlobalStyle.ts) já zera
     transition-duration de qualquer elemento, mesmo padrão já usado por HeroBloco/loading. */
  .indicador {
    display: inline-block;
    transition: transform ${({ theme }) => theme.motion.padrao}
      ${({ theme }) => theme.motion.easing};
  }
  &[data-state='open'] .indicador {
    transform: rotate(180deg);
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.cor.tealLink};
    outline-offset: 3px;
  }
`;

const Content = styled(Accordion.Content)`
  padding-bottom: ${({ theme }) => theme.espaco[16]};
  display: grid;
  gap: ${({ theme }) => theme.espaco[8]};
`;

const ListaDeOpcoes = styled.ul`
  margin: 0;
  padding: 0;
  list-style: none;
  display: grid;
  gap: ${({ theme }) => theme.espaco[4]};
`;

const Opcao = styled.label`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.espaco[8]};
  min-height: 44px;
  cursor: pointer;
  font-size: ${({ theme }) => theme.tamanho[14]};
  color: ${({ theme }) => theme.cor.tinta900};

  input:focus-visible {
    outline: 2px solid ${({ theme }) => theme.cor.tealLink};
    outline-offset: 3px;
  }
`;

const Nota = styled.p`
  margin: 0;
  font-family: ${({ theme }) => theme.fonte.mono};
  font-size: ${({ theme }) => theme.tamanho[12]};
  color: ${({ theme }) => theme.cor.textoHint};
`;

/** Opções resolvidas no servidor para os 3 grupos dinâmicos (D-02, D8). */
export interface OpcoesDinamicasDeFiltro {
  categoria: OpcaoDeFiltro[];
  evento: OpcaoDeFiltro[];
  cor: string[];
}

export interface PainelDeFiltrosProps {
  grupos: OpcoesDinamicasDeFiltro;
  /** Evita colisão de `id` de checkbox entre o painel do aside e o do drawer (05-06). */
  idPrefixo: string;
}

function opcoesDoGrupo(grupo: GrupoDeFiltro, dinamicas: OpcoesDinamicasDeFiltro): OpcaoDeFiltro[] {
  if (grupo.id === 'categoria') return dinamicas.categoria;
  if (grupo.id === 'evento') return dinamicas.evento;
  return grupo.opcoes;
}

export function PainelDeFiltros({ grupos, idPrefixo }: PainelDeFiltrosProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [, iniciarTransicao] = useTransition();

  function aoAlternar(chave: IdGrupoFiltro, valor: string) {
    const novosParams = alternarValor(searchParams, chave, valor);
    iniciarTransicao(() => {
      router.push(`?${novosParams.toString()}`);
    });
  }

  return (
    <Root type="multiple" defaultValue={GRUPOS_ABERTOS_POR_PADRAO}>
      {GRUPOS_DE_FILTRO.map((grupo) => (
        <Item key={grupo.id} value={grupo.id}>
          <Accordion.Header>
            <Trigger>
              {grupo.rotulo}
              <span className="indicador" aria-hidden="true">
                ▾
              </span>
            </Trigger>
          </Accordion.Header>
          <Content>
            {grupo.swatch ? (
              <SwatchesDeCor
                cores={grupos.cor}
                selecionadas={searchParams.getAll('cor')}
                onAlternar={(cor) => aoAlternar('cor', cor)}
              />
            ) : (
              <ListaDeOpcoes>
                {opcoesDoGrupo(grupo, grupos).map((opcao) => {
                  const id = `${idPrefixo}-${grupo.id}-${opcao.valor}`;
                  const marcado = searchParams.getAll(grupo.id).includes(opcao.valor);
                  return (
                    <li key={opcao.valor}>
                      <Opcao htmlFor={id}>
                        <input
                          type="checkbox"
                          id={id}
                          checked={marcado}
                          onChange={() => aoAlternar(grupo.id, opcao.valor)}
                        />
                        {opcao.rotulo}
                      </Opcao>
                    </li>
                  );
                })}
              </ListaDeOpcoes>
            )}
            {grupo.id === 'categoria' && (
              <Nota>Novas categorias entram nesta lista conforme forem cadastradas.</Nota>
            )}
          </Content>
        </Item>
      ))}
    </Root>
  );
}
