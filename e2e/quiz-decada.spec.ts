import { test, expect } from '@playwright/test';

test.describe('Quiz por Década', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/quiz-decada');
    await page.waitForLoadState('networkidle');
  });

  test('should load decade selection or game', async ({ page }) => {
    // Pode mostrar seleção de década ou já o jogo
    const content = page.locator('main, [role="main"], section');
    await expect(content.first()).toBeVisible();
  });

  test('should display decade options or player image', async ({ page }) => {
    // Verifica se tem botões de década ou imagem de jogador
    const decadeButton = page.locator('button:has-text(/década|anos|80|90|2000/i)');
    const playerImage = page.getByTestId('player-image');
    
    const hasDecadeButtons = await decadeButton.count() > 0;
    const hasPlayerImage = await playerImage.count() > 0;
    
    expect(hasDecadeButtons || hasPlayerImage).toBeTruthy();
  });

  test('should not show error icons', async ({ page }) => {
    const errorIcon = page.locator('[data-testid="image-error"]');
    await expect(errorIcon).not.toBeVisible();
  });
});
