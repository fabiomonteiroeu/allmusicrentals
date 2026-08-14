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
  // styled-components: transforma no compilador SWC (SSR + displayName).
  compiler: {
    styledComponents: true,
  },
  images: {
    formats: ['image/avif', 'image/webp'],
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
