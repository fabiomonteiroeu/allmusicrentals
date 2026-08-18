import coreWebVitals from 'eslint-config-next/core-web-vitals';
import typescript from 'eslint-config-next/typescript';

/** @type {import('eslint').Linter.Config[]} */
const config = [
  {
    ignores: [
      '.next/**',
      'node_modules/**',
      'coverage/**',
      'playwright-report/**',
      'test-results/**',
      'cms/**',
      'projeto-base/**',
      'next-env.d.ts',
    ],
  },
  ...coreWebVitals,
  ...typescript,
  {
    rules: {
      // TS strict já cobre; reforçamos proibição de `any` explícito e ts-ignore sem motivo.
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/ban-ts-comment': [
        'error',
        { 'ts-ignore': 'allow-with-description', minimumDescriptionLength: 8 },
      ],
    },
  },
  {
    // MED-01: porta única de saída de eventos. Nenhum arquivo fora de
    // src/lib/analytics/dataLayer.ts pode tocar window.dataLayer/dataLayer.push direto —
    // use emitirEvento() de @/lib/analytics/dataLayer.
    rules: {
      'no-restricted-properties': [
        'error',
        {
          object: 'window',
          property: 'dataLayer',
          message:
            'Não acesse window.dataLayer direto. Use emitirEvento() de @/lib/analytics/dataLayer.',
        },
        {
          object: 'dataLayer',
          property: 'push',
          message:
            'Não chame dataLayer.push direto. Use emitirEvento() de @/lib/analytics/dataLayer.',
        },
      ],
    },
  },
  {
    // Exceção fechada: só o módulo e seu teste unitário podem tocar window.dataLayer.
    // Lista intencionalmente fechada em 2 entradas — não acrescentar caminhos depois
    // (planos futuros devem mockar @/lib/analytics/dataLayer, não abrir exceção aqui).
    files: ['src/lib/analytics/dataLayer.ts', 'src/lib/analytics/dataLayer.test.ts'],
    rules: {
      'no-restricted-properties': 'off',
    },
  },
];

export default config;
