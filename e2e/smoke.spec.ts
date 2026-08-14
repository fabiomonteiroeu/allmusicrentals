import { test, expect } from '@playwright/test';

/**
 * Smoke da Fase 01: a raiz redireciona para um locale e a fundação renderiza.
 * A matriz completa (3 locales × mobile/desktop, percurso de orçamento) entra na Fase 16.
 */
test('raiz redireciona para um locale com prefixo', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveURL(/\/(pt-BR|en|es)$/);
});

test('a fundação renderiza com o locale pt-BR', async ({ page }) => {
  await page.goto('/pt-BR');
  await expect(page.locator('html')).toHaveAttribute('lang', 'pt-BR');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
});
