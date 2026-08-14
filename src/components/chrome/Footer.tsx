'use client';

import styled from 'styled-components';
import { colunasRodape, contato, textosLegais, type ColunaRodape } from '@/lib/site/navigation';
import { SectionDivider } from '@/components/feedback/SectionDivider';

const Rodape = styled.footer`
  background: ${({ theme }) => theme.cor.tinta900};
  color: ${({ theme }) => theme.cor.fundo};
`;

const Inner = styled.div`
  max-width: ${({ theme }) => theme.container.principal};
  margin: 0 auto;
  padding: clamp(40px, 5vw, 64px) ${({ theme }) => theme.espaco[20]}
    ${({ theme }) => theme.espaco[32]};
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: ${({ theme }) => theme.espaco[40]};
`;

const LogoImg = styled.img`
  display: block;
  height: 34px;
  width: auto;
  margin-bottom: ${({ theme }) => theme.espaco[20]};
`;

const Descricao = styled.p`
  margin: 0;
  font-family: ${({ theme }) => theme.fonte.corpo};
  font-size: ${({ theme }) => theme.tamanho[15]};
  line-height: ${({ theme }) => theme.leading.corpo};
  color: ${({ theme }) => theme.cor.textoMutedClaro};
  max-width: 34ch;
`;

const Titulo = styled.p`
  margin: 0 0 ${({ theme }) => theme.espaco[16]};
  font-family: ${({ theme }) => theme.fonte.mono};
  font-weight: ${({ theme }) => theme.peso.medio};
  font-size: ${({ theme }) => theme.tamanho[12]};
  letter-spacing: ${({ theme }) => theme.tracking.rotuloForte};
  color: ${({ theme }) => theme.cor.textoMuted};
`;

const Lista = styled.nav`
  display: grid;
  gap: ${({ theme }) => theme.espaco[10]};
  font-family: ${({ theme }) => theme.fonte.corpo};
  font-size: ${({ theme }) => theme.tamanho[15]};
`;

const LinkCol = styled.a`
  color: ${({ theme }) => theme.cor.rodapeLink};
  &:hover {
    color: ${({ theme }) => theme.cor.teal};
  }
`;

const ContatoCol = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.espaco[10]};
`;

const ContatoTel = styled.a`
  font-family: ${({ theme }) => theme.fonte.mono};
  font-size: ${({ theme }) => theme.tamanho[15]};
  color: ${({ theme }) => theme.cor.fundo};
  &:hover {
    color: ${({ theme }) => theme.cor.teal};
  }
`;

const ContatoEmail = styled.a`
  font-size: ${({ theme }) => theme.tamanho[15]};
  color: ${({ theme }) => theme.cor.fundo};
  &:hover {
    color: ${({ theme }) => theme.cor.teal};
  }
`;

const Divisor = styled(SectionDivider)`
  margin-top: ${({ theme }) => theme.espaco[40]};
`;

const Legais = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 16px 32px;
  justify-content: space-between;
  padding-top: ${({ theme }) => theme.espaco[24]};
`;

const Disclaimer = styled.p`
  margin: 0;
  font-family: ${({ theme }) => theme.fonte.corpo};
  font-size: ${({ theme }) => theme.tamanho[15]};
  line-height: ${({ theme }) => theme.leading.corpo};
  color: ${({ theme }) => theme.cor.textoMutedClaro};
  max-width: 60ch;
`;

const Copyright = styled.p`
  margin: 0;
  font-family: ${({ theme }) => theme.fonte.mono};
  font-size: ${({ theme }) => theme.tamanho[13]};
  color: ${({ theme }) => theme.cor.textoMuted};
`;

export interface FooterProps {
  logoSrc?: string;
  colunas?: ColunaRodape[];
}

export function Footer({
  logoSrc = '/uploads/logo-amr.png',
  colunas = colunasRodape,
}: FooterProps) {
  return (
    <Rodape id="contato-rodape">
      <Inner>
        <Grid>
          <div>
            <LogoImg src={logoSrc} alt="All Music Rentals" width={126} height={34} />
            <Descricao>{textosLegais.descricaoMarca}</Descricao>
          </div>

          {colunas.map((coluna) => (
            <div key={coluna.titulo}>
              <Titulo>{coluna.titulo}</Titulo>
              <Lista aria-label={coluna.titulo}>
                {coluna.itens.map((item) => (
                  <LinkCol key={item.href} href={item.href}>
                    {item.rotulo}
                  </LinkCol>
                ))}
              </Lista>
            </div>
          ))}

          <div>
            <Titulo>CONTATO</Titulo>
            <ContatoCol>
              <ContatoTel href={contato.telefoneHref}>{contato.telefone}</ContatoTel>
              <ContatoEmail href={`mailto:${contato.email}`}>{contato.email}</ContatoEmail>
            </ContatoCol>
          </div>
        </Grid>

        <Divisor />

        <Legais>
          <Disclaimer>{textosLegais.disclaimer}</Disclaimer>
          <Copyright>{textosLegais.copyright}</Copyright>
        </Legais>
      </Inner>
    </Rodape>
  );
}
