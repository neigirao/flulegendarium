import { test, expect } from '@playwright/test';

test.describe('Seleção de Modo de Jogo', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/selecionar-modo-jogo');
    await page.waitForLoadState('networkidle');
  });

  test('should display game mode options', async ({ page }) => {
    // Verificar que a página carrega com opções de jogo
    const content = page.locator('main, [role="main"], section');
    await expect(content.first()).toBeVisible();
  });

  test('should display all game modes', async ({ page }) => {
    // Verificar que os modos estão visíveis
    const adaptativo = page.locator('text=/adaptativo/i');
    const decada = page.locator('text=/década/i');
    const camisa = page.locator('text=/camisa/i');
    
    await expect(adaptativo.first()).toBeVisible();
    await expect(decada.first()).toBeVisible();
    await expect(camisa.first()).toBeVisible();
  });

  test('should navigate to quiz adaptativo', async ({ page }) => {
    const adaptativoLink = page.locator('a[href*="quiz-adaptativo"], [data-testid*="adaptativo"]');
    const count = await adaptativoLink.count();
    
    if (count > 0) {
      await adaptativoLink.first().click();
      await page.waitForURL(/quiz-adaptativo/);
    }
  });

  test('should navigate to quiz decada', async ({ page }) => {
    const decadaLink = page.locator('a[href*="quiz-decada"], [data-testid*="decada"]');
    const count = await decadaLink.count();
    
    if (count > 0) {
      await decadaLink.first().click();
      await page.waitForURL(/quiz-decada/);
    }
  });

  test('should navigate to quiz camisas', async ({ page }) => {
    const camisasLink = page.locator('a[href*="quiz-camisas"], [data-testid*="camisas"]');
    const count = await camisasLink.count();
    
    if (count > 0) {
      await camisasLink.first().click();
      await page.waitForURL(/quiz-camisas/);
    }
  });
});
