import { NextRequest, NextResponse } from 'next/server';
import { locales, defaultLocale, isLocale } from '@/i18n/config';

/**
 * Roteamento de locale por prefixo de caminho (convenção `proxy` do Next 16).
 * - Se o caminho já começa com um locale válido, segue.
 * - Senão, redireciona para o locale preferido (Accept-Language) ou o padrão pt-BR.
 */
function resolvePreferredLocale(request: NextRequest): string {
  const header = request.headers.get('accept-language');
  if (!header) return defaultLocale;

  const candidates = header
    .split(',')
    .map((part) => part.split(';')[0]?.trim() ?? '')
    .filter(Boolean);

  for (const candidate of candidates) {
    if (isLocale(candidate)) return candidate;
    const base = candidate.split('-')[0];
    const match = locales.find((locale) => locale.split('-')[0] === base);
    if (match) return match;
  }
  return defaultLocale;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const hasLocale = locales.some(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`),
  );
  if (hasLocale) return NextResponse.next();

  const locale = resolvePreferredLocale(request);
  const url = request.nextUrl.clone();
  url.pathname = `/${locale}${pathname === '/' ? '' : pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  // Ignora assets internos, arquivos com extensão e rotas de API.
  matcher: ['/((?!_next|api|.*\\..*).*)'],
};
