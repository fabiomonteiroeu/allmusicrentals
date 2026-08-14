'use client';

import styled from 'styled-components';
import { media } from '@/lib/theme/media';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { alternarMenuMobile } from '@/store/slices/uiSlice';
import { navPrincipal, type ItemNav } from '@/lib/site/navigation';
import { MobileMenu } from './MobileMenu';

const Bar = styled.header`
  position: sticky;
  top: 0;
  z-index: ${({ theme }) => theme.z.header};
  background: ${({ theme }) => theme.cor.tinta900};
  border-bottom: 1px solid ${({ theme }) => theme.cor.tinta800};
`;

const Inner = styled.div`
  max-width: ${({ theme }) => theme.container.principal};
  margin: 0 auto;
  padding: ${({ theme }) => `${theme.espaco[14]} ${theme.espaco[20]}`};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.espaco[24]};
`;

const Logo = styled.a`
  display: flex;
  align-items: center;
  flex: none;
`;

const LogoImg = styled.img`
  display: block;
  height: 38px;
  width: auto;
`;

const Desktop = styled.div`
  flex: 1;
  min-width: 0;
  align-items: center;
  gap: ${({ theme }) => theme.espaco[20]};
  ${media.mobile} {
    display: none;
  }
  ${media.desktop} {
    display: flex;
  }
`;

const Nav = styled.nav`
  display: flex;
  flex-wrap: wrap;
  flex: 1;
  gap: 4px 16px;
  font-family: ${({ theme }) => theme.fonte.corpo};
  font-weight: ${({ theme }) => theme.peso.medio};
  font-size: ${({ theme }) => theme.tamanho[15]};
`;

const NavLink = styled.a<{ $ativo?: boolean }>`
  color: ${({ theme, $ativo }) => ($ativo ? theme.cor.fundo : theme.cor.navInativo)};
  padding: ${({ theme }) => `${theme.espaco[4]} 0`};
  border-bottom: 2px solid ${({ theme, $ativo }) => ($ativo ? theme.cor.teal : 'transparent')};
  &:hover {
    color: ${({ theme }) => theme.cor.fundo};
    border-bottom-color: ${({ theme }) => theme.cor.teal};
  }
`;

const Acoes = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.espaco[14]};
  flex: none;
`;

const Orcamento = styled.a`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.espaco[8]};
  color: ${({ theme }) => theme.cor.fundo};
  font-family: ${({ theme }) => theme.fonte.mono};
  font-size: ${({ theme }) => theme.tamanho[13]};
  letter-spacing: ${({ theme }) => theme.tracking.rotuloForte};
  border: 1px solid ${({ theme }) => theme.cor.tinta700};
  padding: ${({ theme }) => `${theme.espaco[8]} ${theme.espaco[10]}`};
  border-radius: ${({ theme }) => theme.raio.base};
  &:hover {
    border-color: ${({ theme }) => theme.cor.teal};
    color: ${({ theme }) => theme.cor.teal};
  }
`;

const Badge = styled.span`
  min-width: 20px;
  height: 20px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0 5px;
  background: ${({ theme }) => theme.cor.teal};
  color: ${({ theme }) => theme.cor.tinta900};
  font-weight: ${({ theme }) => theme.peso.medio};
  border-radius: ${({ theme }) => theme.raio.base};
`;

const CtaLink = styled.a`
  background: ${({ theme }) => theme.cor.teal};
  color: ${({ theme }) => theme.cor.tinta900};
  padding: ${({ theme }) => `11px ${theme.espaco[16]}`};
  border-radius: ${({ theme }) => theme.raio.base};
  font-family: ${({ theme }) => theme.fonte.display};
  font-variation-settings: 'wdth' 75;
  font-weight: ${({ theme }) => theme.peso.display};
  font-size: ${({ theme }) => theme.tamanho[14]};
  letter-spacing: ${({ theme }) => theme.tracking.apertado};
  text-transform: uppercase;
  white-space: nowrap;
  &:hover {
    background: ${({ theme }) => theme.cor.fundo};
    color: ${({ theme }) => theme.cor.tinta900};
  }
`;

const Mobile = styled.div`
  flex: 1;
  justify-content: flex-end;
  gap: ${({ theme }) => theme.espaco[10]};
  ${media.desktop} {
    display: none;
  }
  ${media.mobile} {
    display: flex;
  }
`;

const IconeBotao = styled.button`
  width: 44px;
  height: 44px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.espaco[4]};
  position: relative;
  background: transparent;
  border: 1px solid ${({ theme }) => theme.cor.tinta700};
  border-radius: ${({ theme }) => theme.raio.base};
  color: ${({ theme }) => theme.cor.fundo};
  cursor: pointer;
`;

const HamburgerBarra = styled.span`
  width: 18px;
  height: 2px;
  background: ${({ theme }) => theme.cor.fundo};
`;

const BadgeCanto = styled(Badge)`
  position: absolute;
  top: -6px;
  right: -6px;
  font-family: ${({ theme }) => theme.fonte.mono};
  font-size: ${({ theme }) => theme.tamanho[12]};
`;

const CartLink = styled.a`
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  border: 1px solid ${({ theme }) => theme.cor.tinta700};
  border-radius: ${({ theme }) => theme.raio.base};
  color: ${({ theme }) => theme.cor.fundo};
  font-family: ${({ theme }) => theme.fonte.mono};
  font-size: ${({ theme }) => theme.tamanho[13]};
`;

export interface HeaderProps {
  logoSrc?: string;
  itens?: ItemNav[];
  ativoHref?: string;
  quantidade?: number;
  orcamentoHref?: string;
  ctaHref?: string;
  ctaLabel?: string;
}

export function Header({
  logoSrc = '/uploads/logo-amr.png',
  itens = navPrincipal,
  ativoHref,
  quantidade = 0,
  orcamentoHref = '/meu-orcamento',
  ctaHref = '#solicitar',
  ctaLabel = 'Solicitar Orçamento',
}: HeaderProps) {
  const dispatch = useAppDispatch();
  const menuAberto = useAppSelector((s) => s.ui.menuMobileAberto);

  return (
    <Bar>
      <Inner>
        <Logo href="#inicio" aria-label="All Music Rentals — início">
          <LogoImg src={logoSrc} alt="All Music Rentals" width={140} height={38} />
        </Logo>

        <Desktop>
          <Nav>
            {itens.map((item) => (
              <NavLink key={item.href} href={item.href} $ativo={item.href === ativoHref}>
                {item.rotulo}
              </NavLink>
            ))}
          </Nav>
          <Acoes>
            <Orcamento href={orcamentoHref}>
              ORÇAMENTO
              <Badge aria-label={`${quantidade} itens no orçamento`}>{quantidade}</Badge>
            </Orcamento>
            <CtaLink href={ctaHref}>{ctaLabel}</CtaLink>
          </Acoes>
        </Desktop>

        <Mobile>
          <CartLink href={orcamentoHref} aria-label="Carrinho de orçamento">
            {quantidade}
            <BadgeCanto aria-hidden>{quantidade}</BadgeCanto>
          </CartLink>
          <IconeBotao
            type="button"
            aria-label={menuAberto ? 'Fechar menu' : 'Abrir menu'}
            aria-expanded={menuAberto}
            aria-controls="menu-mobile"
            onClick={() => dispatch(alternarMenuMobile())}
          >
            <HamburgerBarra />
            <HamburgerBarra />
            <HamburgerBarra />
          </IconeBotao>
        </Mobile>
      </Inner>

      <MobileMenu itens={itens} ativoHref={ativoHref} ctaHref={ctaHref} ctaLabel={ctaLabel} />
    </Bar>
  );
}
