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
    // Produção: acrescentar o domínio real do Strapi quando a Fase 17 definir.
    // NUNCA desligar a flag de otimização de imagem como atalho — isso desliga a
    // proteção contra SSRF do endpoint de otimização junto com a otimização.
    remotePatterns: [
      { protocol: 'http', hostname: 'localhost', port: '1337', pathname: '/uploads/**' },
      { protocol: 'http', hostname: 'cms', port: '1337', pathname: '/uploads/**' },
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
