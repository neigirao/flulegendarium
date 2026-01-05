
import { test, expect } from '@playwright/test';

test.describe('Game Flow', () => {
  test('should load the main page correctly', async ({ page }) => {
    await page.goto('/');
    
    // Verificar se a página carrega
    await expect(page).toHaveTitle(/lendas do flu/i);
    
    // Verificar se elementos principais estão presentes
    await expect(page.getByRole('heading', { name: /lendas do flu/i }).first()).toBeVisible();
  });

  test('should navigate to game mode selection', async ({ page }) => {
    await page.goto('/');
    
    // Procurar por botão de jogar e clicar
    const playButton = page.locator('button:has-text("Jogar"), a:has-text("Jogar")').first();
    if (await playButton.isVisible()) {
      await playButton.click();
      // Verificar se navega para seleção de modo
      await expect(page).toHaveURL(/\/(selecionar-modo-jogo|game-mode-selection)(\/|$)/);
    }
  });

  test('should handle mobile viewport correctly', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    // Verificar se a página é responsiva em mobile
    await expect(page.locator('body')).toBeVisible();
    
    // Verificar se não há scroll horizontal
    const scrollWidth = await page.evaluate(() => document.body.scrollWidth);
    const clientWidth = await page.evaluate(() => document.body.clientWidth);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1); // +1 para tolerância
  });
});
