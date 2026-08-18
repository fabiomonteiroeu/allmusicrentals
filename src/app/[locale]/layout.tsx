import type { ReactNode } from 'react';
import { notFound } from 'next/navigation';
import { locales, isLocale, type Locale } from '@/i18n/config';
import { fontVariables } from '@/lib/fonts';
import { StyledRegistry } from '@/lib/theme/StyledRegistry';
import { StoreProvider } from '@/store/StoreProvider';
import { getNavPrincipal, getColunasRodape, getSettingsGlobais } from '@/lib/cms/adapters';
import { TopBar } from '@/components/chrome/TopBar';
import { Header } from '@/components/chrome/Header';
import { Footer } from '@/components/chrome/Footer';

// Gera as rotas estáticas para os três locales.
export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const lang: Locale = locale;

  // Três requisições independentes ao Strapi em toda página do site — em paralelo, não em série.
  const [nav, colunas, settings] = await Promise.all([
    getNavPrincipal(lang),
    getColunasRodape(lang),
    getSettingsGlobais(lang),
  ]);

  return (
    <html lang={lang} className={fontVariables}>
      <body>
        <StyledRegistry>
          <StoreProvider>
            <TopBar localeAtual={lang} tagline={settings?.tagline} contato={settings?.contato} />
            {/*
              nav.length > 0 ? nav : undefined — passar [] sobrescreveria o default estático de
              Header/MobileMenu e o site ficaria sem navegação quando o CMS não tem menu
              publicado. Passando undefined, o default estático assume. Mesma regra para
              `colunas` no Footer. `settings?.tagline`/`settings?.contato` seguem o mesmo
              raciocínio: getSettingsGlobais devolve SettingsGlobais | null, e com null a prop
              recebe undefined, acionando o default estático.
            */}
            <Header
              itens={nav.length > 0 ? nav : undefined}
              // ctaHref/orcamentoHref com prefixo de locale: os defaults atuais são uma âncora
              // interna à Home e o caminho sem locale /meu-orcamento. As rotas reais abaixo
              // fecham o item 6 de docs/divergencias.md no cabeçalho. Dão 404 até as Fases 5/8 —
              // aceito por decisão travada do CONTEXT.md ("CTAs apontam para as rotas finais,
              // mesmo antes de existirem"); não desabilitar nem stubar.
              ctaHref={`/${lang}/solicitar-orcamento`}
              orcamentoHref={`/${lang}/meu-orcamento`}
            />
            {/*
              MobileMenu NÃO é montado aqui: Header.tsx já o renderiza internamente (linha 248,
              confirmado em 2026-08-18), repassando itens/ativoHref/ctaHref/ctaLabel. Montar de
              novo produziria dois id="menu-mobile" no DOM e landmark duplicado.
            */}
            {/*
              Landmark <main> único do layout — dono é aqui, não cada page.tsx: toda página do
              site (Home e as Fases 5-11 depois dela) herda automaticamente o mesmo destino de
              "pular para o conteúdo" sem precisar repetir a tag em cada rota. Achado no
              checkpoint HOME-04 (04-07): sem isto, leitores de tela não tinham atalho para o
              conteúdo principal.
            */}
            <main>{children}</main>
            <Footer
              colunas={colunas.length > 0 ? colunas : undefined}
              contato={settings?.contato}
            />
          </StoreProvider>
        </StyledRegistry>
      </body>
    </html>
  );
}
