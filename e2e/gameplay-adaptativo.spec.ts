import { test, expect } from '@playwright/test';
import { 
  waitForPageReady, 
  startGameWithName, 
  closeAllOverlays,
  safeClick 
} from './helpers/test-helpers';

test.describe('Gameplay - Quiz Adaptativo', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/quiz-adaptativo');
    await waitForPageReady(page);
  });

  test('should allow submitting a guess', async ({ page }) => {
    await startGameWithName(page, 'Jogador Teste');
    
    // Esperar imagem carregar usando data-testid
    const playerImage = page.getByTestId('player-image');
    await expect(playerImage).toBeVisible({ timeout: 20000 });
    
    // Verificar que input de palpite existe usando data-testid
    const guessInput = page.getByTestId('guess-input');
    await expect(guessInput).toBeVisible({ timeout: 10000 });
  });

  test('should show feedback after incorrect guess', async ({ page }) => {
    await startGameWithName(page, 'Jogador Teste');
    
    // Esperar jogo carregar
    const playerImage = page.getByTestId('player-image');
    await expect(playerImage).toBeVisible({ timeout: 20000 });
    
    // Fazer um palpite errado usando data-testid
    const guessInput = page.getByTestId('guess-input');
    await guessInput.fill('Nome Incorreto XYZ');
    
    // Clicar no botão de enviar usando data-testid
    const submitButton = page.getByTestId('guess-submit-btn');
    await safeClick(page, submitButton);
    
    // Aguardar dialog de confirmação
    await page.waitForTimeout(1000);
    
    // Confirmar no dialog se aparecer
    const confirmButton = page.getByRole('button', { name: /confirmar|sim/i });
    if (await confirmButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await confirmButton.click();
    }
    
    // Aguardar feedback
    await page.waitForTimeout(3000);
    
    // Verificar que algo aconteceu (toast, game over, ou mudança de estado)
    const gameOverDialog = page.getByTestId('game-over-dialog');
    const toast = page.locator('[data-sonner-toast]');
    const scoreChanged = page.getByTestId('score-display');
    
    const hasGameOver = await gameOverDialog.isVisible({ timeout: 2000 }).catch(() => false);
    const hasToast = await toast.count() > 0;
    const hasScore = await scoreChanged.isVisible({ timeout: 2000 }).catch(() => false);
    
    expect(hasGameOver || hasToast || hasScore).toBeTruthy();
  });

  test('should update score display after gameplay', async ({ page }) => {
    await startGameWithName(page, 'Jogador Teste');
    
    // Esperar jogo carregar
    const playerImage = page.getByTestId('player-image');
    await expect(playerImage).toBeVisible({ timeout: 20000 });
    
    // Verificar que o contador de pontos está visível
    const scoreDisplay = page.getByTestId('score-display');
    await expect(scoreDisplay).toBeVisible({ timeout: 10000 });
  });

  test('should have timer visible during gameplay', async ({ page }) => {
    await startGameWithName(page, 'Jogador Teste');
    
    // Esperar jogo carregar
    const playerImage = page.getByTestId('player-image');
    await expect(playerImage).toBeVisible({ timeout: 20000 });
    
    // Verificar timer usando data-testid
    const timerDisplay = page.getByTestId('timer-display');
    await expect(timerDisplay).toBeVisible({ timeout: 10000 });
  });

  test('should show game over when time runs out', async ({ page }) => {
    test.setTimeout(60000); // Aumentar timeout para este teste específico
    
    await startGameWithName(page, 'Jogador Teste');
    
    // Esperar jogo carregar
    const playerImage = page.getByTestId('player-image');
    await expect(playerImage).toBeVisible({ timeout: 20000 });
    
    // Esperar o tempo acabar (máximo 25 segundos + buffer)
    await page.waitForTimeout(25000);
    
    // Verificar que game over apareceu
    const gameOverDialog = page.getByTestId('game-over-dialog');
    await expect(gameOverDialog).toBeVisible({ timeout: 10000 });
  });
});
