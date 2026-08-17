import type { Config } from 'jest';
import nextJest from 'next/jest.js';

const createJestConfig = nextJest({
  // Caminho do app Next para carregar next.config e .env nos testes.
  dir: './',
});

const config: Config = {
  coverageProvider: 'v8',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    // Módulos server-only (cliente/adaptadores do CMS) são testáveis no Node.
    '^server-only$': '<rootDir>/test/stubs/server-only.ts',
  },
  // Obs.: `marked` e a cadeia do `htmlparser2` (sanitize-html) publicam só ESM.
  // Quem os transforma aqui é o `transpilePackages` do next.config.ts — o
  // next/jest só sabe destranspilar node_modules a partir dessa lista.
  // e2e (Playwright) e a pasta de layouts não entram no Jest.
  testPathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/e2e/', '<rootDir>/projeto-base/'],
  // Evita colisão de nomes (haste) com .next/standalone/package.json.
  modulePathIgnorePatterns: ['<rootDir>/.next/'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{ts,tsx}',
    '!src/app/**/layout.tsx',
  ],
  // Meta de cobertura em lógica de negócio (reforçada por fase).
  coverageThreshold: {
    global: {
      statements: 0,
      branches: 0,
      functions: 0,
      lines: 0,
    },
  },
};

export default createJestConfig(config);
