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
    // Quiz de camisas tem opções de anos
    const options = page.locator('button:has-text(/19[0-9]{2}|20[0-9]{2}/)');
    const count = await options.count();
    expect(count).toBeGreaterThanOrEqual(2);
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
