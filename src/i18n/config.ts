/**
 * Configuração de i18n — três locales, pt-BR como padrão.
 * Decisão registrada em docs/adr/002-locale-padrao.md.
 */
export const locales = ['pt-BR', 'en', 'es'] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'pt-BR';

/** Mapa de locale → atributo `lang`/`hreflang` (aqui coincidem). */
export const hreflangByLocale: Record<Locale, string> = {
  'pt-BR': 'pt-BR',
  en: 'en',
  es: 'es',
};

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}
