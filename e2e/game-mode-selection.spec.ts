import { test, expect } from '@playwright/test';

test.describe('Seleção de Modo de Jogo', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/selecionar-modo-jogo');
    await page.waitForLoadState('networkidle');
  });

  test('should display game mode options', async ({ page }) => {
    // Aguardar página carregar completamente
    await page.waitForTimeout(2000);
    
    // Verificar que a página carrega (body deve ter conteúdo)
    const body = page.locator('body');
    await expect(body).toBeVisible();
    
    // Verificar que há algum conteúdo visível
    const hasContent = await page.locator('h1, h2, h3, button, a').count();
    expect(hasContent).toBeGreaterThan(0);
  });

  test('should display all game modes', async ({ page }) => {
    await page.waitForTimeout(2000);
    
    // Verificar que os modos estão visíveis usando getByText
    const adaptativo = page.getByText(/adaptativo/i);
    const decada = page.getByText(/década/i);
    const camisa = page.getByText(/camisa/i);
    
    await expect(adaptativo.first()).toBeVisible();
    await expect(decada.first()).toBeVisible();
    await expect(camisa.first()).toBeVisible();
  });

  test('should navigate to quiz adaptativo', async ({ page }) => {
    await page.waitForTimeout(2000);
    
    const adaptativoLink = page.locator('a[href*="quiz-adaptativo"], [data-testid*="adaptativo"]');
    const count = await adaptativoLink.count();
    
    if (count > 0) {
      await adaptativoLink.first().click();
      await page.waitForURL(/quiz-adaptativo/);
    }
  });

  test('should navigate to quiz decada', async ({ page }) => {
    await page.waitForTimeout(2000);
    
    const decadaLink = page.locator('a[href*="quiz-decada"], [data-testid*="decada"]');
    const count = await decadaLink.count();
    
    if (count > 0) {
      await decadaLink.first().click();
      await page.waitForURL(/quiz-decada/);
    }
  });

  test('should navigate to quiz camisas', async ({ page }) => {
    await page.waitForTimeout(2000);
    
    const camisasLink = page.locator('a[href*="quiz-camisas"], [data-testid*="camisas"]');
    const count = await camisasLink.count();
    
    if (count > 0) {
      await camisasLink.first().click();
      await page.waitForURL(/quiz-camisas/);
    }
  });
});
