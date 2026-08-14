import { isLocale } from '@/i18n/config';
import { getDictionary } from '@/i18n/getDictionary';
import { notFound } from 'next/navigation';
import { FoundationStatus } from '@/components/FoundationStatus';

/**
 * Home (placeholder da Fase 01). Busca de dados no servidor;
 * o componente estilizado (folha) recebe os dados por props.
 * A Home real é construída na Fase 04.
 */
export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const dict = await getDictionary(locale);

  return (
    <FoundationStatus
      siteName={dict.meta.siteName}
      tagline={dict.meta.tagline}
      locale={locale}
      ctaLabel={dict.common.requestQuote}
    />
  );
}
