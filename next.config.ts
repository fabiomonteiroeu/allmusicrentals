import type { NextConfig } from 'next';

/**
 * Cabeçalhos de segurança base (Fase 01).
 * CSP com nonce é tratada na Fase 15 — aqui ficam os cabeçalhos estáticos.
 */
const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), browsing-topics=()',
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
];

/**
 * Deriva o padrão remoto de imagens do Strapi de produção a partir de
 * `NEXT_PUBLIC_STRAPI_MEDIA_URL` (Fase 17). O hostname de produção nunca fica hardcoded neste
 * arquivo — ele nem existe em DNS ainda no momento em que este código é escrito. O valor chega
 * como build-arg do Dockerfile (ver `ARG NEXT_PUBLIC_STRAPI_MEDIA_URL`).
 *
 * Continua uma allowlist EXATA (protocol+hostname+port+pathname), nunca um curinga: um curinga
 * aqui reabriria a superfície de SSRF que o otimizador de imagem do Next existe para fechar — a
 * mesma proteção que a Fase 1 decidiu manter ligada (nunca `images.unoptimized`).
 */
function remotePatternDoMediaDeProducao(): NonNullable<
  NonNullable<NextConfig['images']>['remotePatterns']
> {
  const mediaUrl = process.env.NEXT_PUBLIC_STRAPI_MEDIA_URL;
  if (!mediaUrl) return [];

  try {
    const url = new URL(mediaUrl);
    // Os dois hosts de dev (localhost, cms) já cobrem http — só adiciona um padrão novo se o
    // hostname configurado for diferente deles, para não duplicar entradas em dev.
    if (url.hostname === 'localhost' || url.hostname === 'cms') return [];

    return [
      {
        protocol: url.protocol.replace(':', '') as 'http' | 'https',
        hostname: url.hostname,
        ...(url.port ? { port: url.port } : {}),
        pathname: '/uploads/**',
      },
    ];
  } catch {
    // URL malformada em NEXT_PUBLIC_STRAPI_MEDIA_URL não deve derrubar o build — só não amplia
    // a allowlist. O sintoma visível seria imagem quebrada, não build vermelho; mais seguro do
    // que falhar o deploy por uma variável de ambiente digitada errado.
    return [];
  }
}

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Raiz do Turbopack fixada neste projeto (evita ambiguidade com lockfiles acima).
  turbopack: {
    root: process.cwd(),
  },
  // Saída standalone: imagem Docker enxuta (Fase 01/17).
  output: 'standalone',
  // Sanitização de rich text (Fase 03): `marked` e a cadeia do `htmlparser2`
  // (usada pelo sanitize-html) publicam só ESM — transpilar mantém build e Jest iguais.
  transpilePackages: [
    'marked',
    'htmlparser2',
    'domhandler',
    'domutils',
    'dom-serializer',
    'entities',
    'domelementtype',
  ],
  // styled-components: transforma no compilador SWC (SSR + displayName).
  compiler: {
    styledComponents: true,
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    // NUNCA desligar a flag de otimização de imagem como atalho — isso desliga a proteção
    // contra SSRF do endpoint de otimização junto com a otimização (Fase 01/17).
    remotePatterns: [
      { protocol: 'http', hostname: 'localhost', port: '1337', pathname: '/uploads/**' },
      { protocol: 'http', hostname: 'cms', port: '1337', pathname: '/uploads/**' },
      ...remotePatternDoMediaDeProducao(),
    ],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
