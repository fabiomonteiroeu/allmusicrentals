import type { ReactNode } from 'react';
import { notFound } from 'next/navigation';
import { locales, isLocale, type Locale } from '@/i18n/config';
import { fontVariables } from '@/lib/fonts';
import { StyledRegistry } from '@/lib/theme/StyledRegistry';
import { StoreProvider } from '@/store/StoreProvider';

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

  return (
    <html lang={lang} className={fontVariables}>
      <body>
        <StyledRegistry>
          <StoreProvider>{children}</StoreProvider>
        </StyledRegistry>
      </body>
    </html>
  );
}
