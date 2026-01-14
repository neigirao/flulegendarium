import { test, expect } from '@playwright/test';
import { waitForPageReady, startGameWithName } from './helpers/test-helpers';

test.describe('Quiz de Camisas', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/quiz-camisas');
    await waitForPageReady(page);
  });

  test('should load game page', async ({ page }) => {
    const quizPage = page.getByTestId('quiz-camisas-page');
    await expect(quizPage).toBeVisible({ timeout: 15000 });
  });

  test('should load game page with jersey image', async ({ page }) => {
    await startGameWithName(page, 'Jogador Teste');
    
    // Aguardar imagem carregar
    const jerseyImage = page.getByTestId('jersey-image');
    await expect(jerseyImage).toBeVisible({ timeout: 20000 });
  });

  test('should display year options for guessing', async ({ page }) => {
    await startGameWithName(page, 'Jogador Teste');
    
    // Aguardar jogo carregar
    await page.waitForTimeout(3000);
    
    // Quiz de camisas tem opções de anos com data-testid
    const yearOptions = page.locator('[data-testid^="year-option-"]');
    const count = await yearOptions.count();
    
    // Deve haver pelo menos 3 opções de ano
    expect(count).toBeGreaterThanOrEqual(3);
  });

  test('should show score counter', async ({ page }) => {
    await startGameWithName(page, 'Jogador Teste');
    
    // Aguardar jogo carregar
    await page.waitForTimeout(2000);
    
    const scoreDisplay = page.getByTestId('score-display');
    await expect(scoreDisplay).toBeVisible({ timeout: 15000 });
  });

  test('should show skip button', async ({ page }) => {
    await startGameWithName(page, 'Jogador Teste');
    
    // Aguardar jogo carregar
    await page.waitForTimeout(2000);
    
    const skipButton = page.getByTestId('skip-button');
    await expect(skipButton).toBeVisible({ timeout: 15000 });
  });

  test('should not show error icons', async ({ page }) => {
    await startGameWithName(page, 'Jogador Teste');
    
    // Aguardar carregamento completo
    await page.waitForTimeout(3000);
    
    const errorIcon = page.getByTestId('image-error');
    await expect(errorIcon).not.toBeVisible();
  });
});
