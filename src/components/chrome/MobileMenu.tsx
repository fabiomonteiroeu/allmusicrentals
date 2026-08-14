'use client';

import styled from 'styled-components';
import { media } from '@/lib/theme/media';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fecharMenuMobile } from '@/store/slices/uiSlice';
import { contato, navPrincipal, type ItemNav } from '@/lib/site/navigation';

const Wrap = styled.div<{ $aberto: boolean }>`
  background: ${({ theme }) => theme.cor.tinta800};
  border-top: 1px solid ${({ theme }) => theme.cor.tinta700};
  box-shadow: ${({ theme }) => theme.sombra.duraBaixo};
  padding: ${({ theme }) => `${theme.espaco[16]} ${theme.espaco[20]} ${theme.espaco[24]}`};
  ${media.desktop} {
    display: none;
  }
  ${media.mobile} {
    display: ${({ $aberto }) => ($aberto ? 'block' : 'none')};
  }
`;

const Nav = styled.nav`
  display: grid;
  gap: ${({ theme }) => theme.espaco[2]};
`;

const Link = styled.a<{ $ativo?: boolean }>`
  font-family: ${({ theme }) => theme.fonte.corpo};
  font-weight: ${({ theme }) => theme.peso.medio};
  font-size: ${({ theme }) => theme.tamanho[17]};
  color: ${({ theme, $ativo }) => ($ativo ? theme.cor.teal : theme.cor.fundo)};
  padding: ${({ theme }) => `${theme.espaco[12]} 0`};
  border-bottom: 1px solid ${({ theme }) => theme.cor.tinta700};
`;

const Cta = styled.a`
  display: block;
  text-align: center;
  margin-top: ${({ theme }) => theme.espaco[16]};
  background: ${({ theme }) => theme.cor.teal};
  color: ${({ theme }) => theme.cor.tinta900};
  padding: 15px;
  border-radius: ${({ theme }) => theme.raio.base};
  font-family: ${({ theme }) => theme.fonte.display};
  font-variation-settings: 'wdth' 75;
  font-weight: ${({ theme }) => theme.peso.display};
  font-size: ${({ theme }) => theme.tamanho[16]};
  text-transform: uppercase;
`;

const Rodape = styled.div`
  margin-top: ${({ theme }) => theme.espaco[24]};
  padding-top: ${({ theme }) => theme.espaco[20]};
  border-top: 1px solid ${({ theme }) => theme.cor.tinta700};
  display: grid;
  gap: ${({ theme }) => theme.espaco[16]};
`;

const RotuloMono = styled.p`
  margin: 0;
  font-family: ${({ theme }) => theme.fonte.mono};
  font-weight: ${({ theme }) => theme.peso.medio};
  font-size: ${({ theme }) => theme.tamanho[12]};
  letter-spacing: ${({ theme }) => theme.tracking.rotuloForte};
  color: ${({ theme }) => theme.cor.textoMuted};
`;

const ContatoBloco = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.espaco[2]};
`;

const ContatoTel = styled.a`
  display: flex;
  align-items: center;
  min-height: 44px;
  font-family: ${({ theme }) => theme.fonte.mono};
  font-size: ${({ theme }) => theme.tamanho[17]};
  color: ${({ theme }) => theme.cor.fundo};
  border-bottom: 1px solid ${({ theme }) => theme.cor.tinta700};
`;

const ContatoEmail = styled.a`
  font-size: ${({ theme }) => theme.tamanho[17]};
  color: ${({ theme }) => theme.cor.fundo};
  border-bottom: 1px solid ${({ theme }) => theme.cor.tinta700};
  padding: ${({ theme }) => `${theme.espaco[12]} 0`};
`;

export interface MobileMenuProps {
  itens?: ItemNav[];
  ativoHref?: string;
  ctaHref?: string;
  ctaLabel?: string;
}

export function MobileMenu({
  itens = navPrincipal,
  ativoHref,
  ctaHref = '#solicitar',
  ctaLabel = 'Solicitar Orçamento',
}: MobileMenuProps) {
  const aberto = useAppSelector((s) => s.ui.menuMobileAberto);
  const dispatch = useAppDispatch();
  const fechar = () => dispatch(fecharMenuMobile());

  return (
    <Wrap $aberto={aberto} id="menu-mobile" aria-hidden={!aberto}>
      <Nav>
        {itens.map((item) => (
          <Link key={item.href} href={item.href} $ativo={item.href === ativoHref} onClick={fechar}>
            {item.rotulo}
          </Link>
        ))}
      </Nav>
      <Cta href={ctaHref} onClick={fechar}>
        {ctaLabel}
      </Cta>
      <Rodape>
        <RotuloMono>CONTATO</RotuloMono>
        <ContatoBloco>
          <ContatoTel href={contato.telefoneHref}>{contato.telefone}</ContatoTel>
          <ContatoEmail href={`mailto:${contato.email}`}>{contato.email}</ContatoEmail>
        </ContatoBloco>
      </Rodape>
    </Wrap>
  );
}
