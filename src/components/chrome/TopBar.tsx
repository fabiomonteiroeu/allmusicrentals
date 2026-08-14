'use client';

import styled from 'styled-components';
import { media } from '@/lib/theme/media';
import { contato, textosLegais } from '@/lib/site/navigation';

const Barra = styled.div`
  background: ${({ theme }) => theme.cor.tinta900};
  border-bottom: 1px solid ${({ theme }) => theme.cor.tinta800};
  ${media.mobile} {
    display: none;
  }
`;

const Inner = styled.div`
  max-width: ${({ theme }) => theme.container.principal};
  margin: 0 auto;
  padding: ${({ theme }) => `${theme.espaco[8]} ${theme.espaco[20]}`};
  display: flex;
  flex-wrap: wrap;
  gap: 8px 24px;
  align-items: center;
  justify-content: space-between;
`;

const Tagline = styled.p`
  margin: 0;
  font-family: ${({ theme }) => theme.fonte.corpo};
  font-weight: ${({ theme }) => theme.peso.corpo};
  font-size: ${({ theme }) => theme.tamanho[13]};
  line-height: 1.4;
  color: ${({ theme }) => theme.cor.textoMutedClaro};
`;

const Contatos = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px 14px;
  font-family: ${({ theme }) => theme.fonte.corpo};
  font-weight: ${({ theme }) => theme.peso.medio};
  font-size: ${({ theme }) => theme.tamanho[13]};
`;

const Tel = styled.a`
  font-family: ${({ theme }) => theme.fonte.mono};
  color: ${({ theme }) => theme.cor.fundo};
  &:hover {
    color: ${({ theme }) => theme.cor.teal};
  }
`;

const Email = styled.a`
  color: ${({ theme }) => theme.cor.fundo};
  &:hover {
    color: ${({ theme }) => theme.cor.teal};
  }
`;

const Sep = styled.span.attrs({ 'aria-hidden': true })`
  color: ${({ theme }) => theme.cor.tinta700};
`;

const Idiomas = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.espaco[8]};
  font-family: ${({ theme }) => theme.fonte.mono};
  font-size: ${({ theme }) => theme.tamanho[12]};
  letter-spacing: ${({ theme }) => theme.tracking.rotuloForte};
`;

const Idioma = styled.a<{ $ativo?: boolean }>`
  color: ${({ theme, $ativo }) => ($ativo ? theme.cor.teal : theme.cor.textoMutedClaro)};
  font-weight: ${({ theme, $ativo }) => ($ativo ? theme.peso.medio : theme.peso.corpo)};
  &:hover {
    color: ${({ theme }) => theme.cor.teal};
  }
`;

const IdiomaGrupo = styled.span`
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.espaco[8]};
`;

const IDIOMAS = [
  { code: 'en', rotulo: 'EN' },
  { code: 'pt-BR', rotulo: 'PT' },
  { code: 'es', rotulo: 'ES' },
] as const;

export function TopBar({ localeAtual = 'pt-BR' }: { localeAtual?: string }) {
  return (
    <Barra>
      <Inner>
        <Tagline>{textosLegais.tagline}</Tagline>
        <Contatos>
          <Tel href={contato.telefoneHref}>{contato.telefone}</Tel>
          <Sep>·</Sep>
          <Email href={`mailto:${contato.email}`}>{contato.email}</Email>
          <Sep>·</Sep>
          <Idiomas>
            {IDIOMAS.map((idioma, i) => (
              <IdiomaGrupo key={idioma.code}>
                {i > 0 && <Sep>|</Sep>}
                <Idioma href={`/${idioma.code}`} $ativo={idioma.code === localeAtual}>
                  {idioma.rotulo}
                </Idioma>
              </IdiomaGrupo>
            ))}
          </Idiomas>
        </Contatos>
      </Inner>
    </Barra>
  );
}
