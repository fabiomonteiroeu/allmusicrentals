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
];

export default config;
