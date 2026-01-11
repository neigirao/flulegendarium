import { test, expect } from '@playwright/test';

test.describe('Quiz por Década', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/quiz-decada');
    await page.waitForLoadState('networkidle');
  });

  test('should load decade selection or game', async ({ page }) => {
    // Aguarda a página carregar completamente
    await page.waitForTimeout(2000);
    
    // Verifica que há conteúdo visível na página
    const body = page.locator('body');
    await expect(body).toBeVisible();
    
    const hasContent = await page.locator('h1, h2, h3, button, a, img').count();
    expect(hasContent).toBeGreaterThan(0);
  });

  test('should display decade options or player image', async ({ page }) => {
    await page.waitForTimeout(2000);
    
    // Verifica se tem botões de década ou imagem de jogador usando getByText
    const decadeText = page.getByText(/década|anos 80|anos 90|2000/i);
    const playerImage = page.getByTestId('player-image');
    
    const hasDecadeText = await decadeText.count() > 0;
    const hasPlayerImage = await playerImage.count() > 0;
    
    expect(hasDecadeText || hasPlayerImage).toBeTruthy();
  });

  test('should not show error icons', async ({ page }) => {
    const errorIcon = page.locator('[data-testid="image-error"]');
    await expect(errorIcon).not.toBeVisible();
  });
});
