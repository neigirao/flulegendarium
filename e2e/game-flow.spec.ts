import { test, expect } from '@playwright/test';

test.describe('Game Flow', () => {
  test('should load the main page correctly', async ({ page }) => {
    await page.goto('/');
    
    // Verificar se a página carrega
    await expect(page).toHaveTitle(/lendas do flu/i);
    
    // Verificar se heading principal está presente usando data-testid ou texto
    const heading = page.locator('h1');
    await expect(heading).toContainText(/lendas do flu/i);
  });

  test('should show play button and navigate to game mode selection', async ({ page }) => {
    await page.goto('/');
    
    // Usar data-testid para o botão de jogar
    const playButton = page.getByTestId('play-button');
    await expect(playButton).toBeVisible();
    
    // Clicar e verificar navegação
    await playButton.click();
    
    // Esperar navegação
    await page.waitForURL(/selecionar-modo-jogo/);
    await expect(page).toHaveURL(/selecionar-modo-jogo/);
  });

  test('should be responsive on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    // Verificar se a página carrega corretamente
    await expect(page.locator('body')).toBeVisible();
    
    // Verificar se o botão de jogar está visível em mobile
    const playButton = page.getByTestId('play-button');
    await expect(playButton).toBeVisible();
    
    // Verificar se não há scroll horizontal excessivo
    const scrollWidth = await page.evaluate(() => document.body.scrollWidth);
    const clientWidth = await page.evaluate(() => document.body.clientWidth);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 5); // Pequena tolerância
  });
});
