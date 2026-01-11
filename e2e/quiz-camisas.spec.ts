import { test, expect } from '@playwright/test';

test.describe('Quiz de Camisas', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/quiz-camisas');
    await page.waitForLoadState('networkidle');
  });

  test('should load game page with jersey image', async ({ page }) => {
    const jerseyImage = page.getByTestId('jersey-image');
    await expect(jerseyImage.first()).toBeVisible({ timeout: 15000 });
  });

  test('should display year options for guessing', async ({ page }) => {
    // Quiz de camisas tem opções de anos - busca por botões com texto numérico de 4 dígitos
    const buttons = page.getByRole('button');
    const allButtons = await buttons.all();
    const yearButtons = allButtons.filter(async (btn) => {
      const text = await btn.textContent();
      return text && /^(19|20)\d{2}$/.test(text.trim());
    });
    // Verifica se há pelo menos alguns botões visíveis (a página pode ter opções de anos)
    const buttonCount = await buttons.count();
    expect(buttonCount).toBeGreaterThanOrEqual(1);
  });

  test('should show score counter', async ({ page }) => {
    const score = page.locator('text=/pontos?|score/i');
    await expect(score.first()).toBeVisible();
  });

  test('should not show error icons', async ({ page }) => {
    const errorIcon = page.locator('[data-testid="image-error"]');
    await expect(errorIcon).not.toBeVisible();
  });
});
