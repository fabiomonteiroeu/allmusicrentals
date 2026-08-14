'use client';

import styled from 'styled-components';

const Wrap = styled.main`
  max-width: ${({ theme }) => theme.container.principal};
  margin: 0 auto;
  padding: ${({ theme }) => `${theme.espaco[40]} ${theme.espaco[20]}`};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.espaco[16]};
`;

const Eyebrow = styled.p`
  font-family: ${({ theme }) => theme.fonte.mono};
  text-transform: uppercase;
  letter-spacing: 0.06em;
  font-size: 13px;
  color: ${({ theme }) => theme.cor.tealLink};
  margin: 0;
`;

const Title = styled.h1`
  font-family: ${({ theme }) => theme.fonte.display};
  font-weight: ${({ theme }) => theme.peso.display};
  font-variation-settings: 'wdth' 75;
  text-transform: uppercase;
  letter-spacing: -0.01em;
  line-height: 0.98;
  font-size: clamp(40px, 5vw, 64px);
  margin: 0;
`;

const Tagline = styled.p`
  font-size: clamp(16px, 1.2vw, 17px);
  color: ${({ theme }) => theme.cor.textoMid};
  max-width: 640px;
  margin: 0;
`;

const Cta = styled.button`
  align-self: flex-start;
  font-family: ${({ theme }) => theme.fonte.display};
  font-weight: ${({ theme }) => theme.peso.display};
  text-transform: uppercase;
  letter-spacing: 0.04em;
  background: ${({ theme }) => theme.cor.teal};
  color: ${({ theme }) => theme.cor.tinta900};
  border: none;
  border-radius: ${({ theme }) => theme.raio.base};
  padding: ${({ theme }) => `${theme.espaco[14]} ${theme.espaco[24]}`};
  min-height: 44px;
  cursor: pointer;
  transition: background ${({ theme }) => theme.motion.rapida};
  &:hover {
    background: ${({ theme }) => theme.cor.tealHover};
    color: ${({ theme }) => theme.cor.branco};
  }
`;

export interface FoundationStatusProps {
  siteName: string;
  tagline: string;
  locale: string;
  ctaLabel: string;
}

/**
 * Componente-folha estilizado (Fase 01) — prova o pipeline SSR do styled-components,
 * o tema, as fontes e o i18n. Substituído pela Home real na Fase 04.
 */
export function FoundationStatus({ siteName, tagline, locale, ctaLabel }: FoundationStatusProps) {
  return (
    <Wrap>
      <Eyebrow>
        {siteName} · {locale}
      </Eyebrow>
      <Title>Fundação pronta</Title>
      <Tagline>{tagline}</Tagline>
      <Cta type="button">{ctaLabel}</Cta>
    </Wrap>
  );
}
