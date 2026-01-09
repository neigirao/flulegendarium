import { test, expect } from '@playwright/test';

test.describe('Quiz Adaptativo', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/quiz-adaptativo');
    await page.waitForLoadState('networkidle');
  });

  test('should load game page with player image', async ({ page }) => {
    const playerImage = page.getByTestId('player-image');
    await expect(playerImage.first()).toBeVisible({ timeout: 15000 });
  });

  test('should display score counter', async ({ page }) => {
    const score = page.locator('text=/pontos?|score/i');
    await expect(score.first()).toBeVisible();
  });

  test('should have input for guessing player name', async ({ page }) => {
    const input = page.locator('input[type="text"], input[placeholder*="nome"]');
    await expect(input.first()).toBeVisible();
  });

  test('should not show error icons', async ({ page }) => {
    const errorIcon = page.locator('[data-testid="image-error"]');
    await expect(errorIcon).not.toBeVisible();
  });
});
