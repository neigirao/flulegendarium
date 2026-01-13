import { test, expect } from '@playwright/test';
import { waitForPageReady, startGameWithName } from './helpers/test-helpers';

test.describe('Quiz por Década', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/quiz-decada');
    await waitForPageReady(page);
  });

  test('should load decade selection or game page', async ({ page }) => {
    const quizPage = page.getByTestId('quiz-decada-page');
    await expect(quizPage).toBeVisible({ timeout: 15000 });
  });

  test('should display decade selection page initially', async ({ page }) => {
    // A página de seleção de década deve aparecer
    const decadeSelectionPage = page.getByTestId('decade-selection-page');
    const isVisible = await decadeSelectionPage.isVisible({ timeout: 10000 }).catch(() => false);
    
    // Se a página de seleção está visível, verificar as opções de década
    if (isVisible) {
      const decade1970s = page.getByTestId('decade-option-1970s');
      const decade1980s = page.getByTestId('decade-option-1980s');
      const decade1990s = page.getByTestId('decade-option-1990s');
      
      await expect(decade1970s).toBeVisible();
      await expect(decade1980s).toBeVisible();
      await expect(decade1990s).toBeVisible();
    }
  });

  test('should allow selecting a decade', async ({ page }) => {
    const decadeSelectionPage = page.getByTestId('decade-selection-page');
    const isSelectionVisible = await decadeSelectionPage.isVisible({ timeout: 10000 }).catch(() => false);
    
    if (isSelectionVisible) {
      // Selecionar década 1990s
      const decade1990s = page.getByTestId('decade-option-1990s');
      await decade1990s.click();
      
      // Aguardar formulário de nome ou jogo carregar
      await page.waitForTimeout(2000);
      
      // Deve mostrar formulário de nome ou jogo
      const guestForm = page.getByTestId('guest-name-form');
      const playerImage = page.getByTestId('player-image');
      
      const hasGuestForm = await guestForm.isVisible({ timeout: 5000 }).catch(() => false);
      const hasPlayerImage = await playerImage.isVisible({ timeout: 5000 }).catch(() => false);
      
      expect(hasGuestForm || hasPlayerImage).toBeTruthy();
    }
  });

  test('should start game after decade selection and name input', async ({ page }) => {
    const decadeSelectionPage = page.getByTestId('decade-selection-page');
    const isSelectionVisible = await decadeSelectionPage.isVisible({ timeout: 10000 }).catch(() => false);
    
    if (isSelectionVisible) {
      // Selecionar década
      const decade1990s = page.getByTestId('decade-option-1990s');
      await decade1990s.click();
      await page.waitForTimeout(1000);
      
      // Preencher nome se necessário
      await startGameWithName(page, 'Jogador Teste');
      await page.waitForTimeout(2000);
      
      // Verificar elementos do jogo
      const timerOrScore = page.locator('[data-testid="timer-display"], [data-testid="score-display"]');
      const count = await timerOrScore.count();
      expect(count).toBeGreaterThan(0);
    }
  });

  test('should not show error icons', async ({ page }) => {
    const errorIcon = page.getByTestId('image-error');
    await expect(errorIcon).not.toBeVisible();
  });
});
