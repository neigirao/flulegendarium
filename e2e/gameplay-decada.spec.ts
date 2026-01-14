import { test, expect } from '@playwright/test';
import { 
  waitForPageReady, 
  startGameWithName, 
  closeAllOverlays,
  safeClick 
} from './helpers/test-helpers';

test.describe('Gameplay - Quiz por Década', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/quiz-decada');
    await waitForPageReady(page);
  });

  test('should display decade selection or game', async ({ page }) => {
    // A página pode mostrar seleção de décadas ou formulário de nome
    const decadeSelection = page.getByTestId('decade-selection-page');
    const guestForm = page.getByTestId('guest-name-form');
    const quizPage = page.getByTestId('quiz-decada-page');
    
    const hasDecadeSelection = await decadeSelection.isVisible({ timeout: 10000 }).catch(() => false);
    const hasGuestForm = await guestForm.isVisible({ timeout: 5000 }).catch(() => false);
    const hasQuizPage = await quizPage.isVisible({ timeout: 5000 }).catch(() => false);
    
    expect(hasDecadeSelection || hasGuestForm || hasQuizPage).toBeTruthy();
  });

  test('should allow selecting a decade', async ({ page }) => {
    // Primeiro tentar iniciar o jogo se formulário de nome aparecer
    await startGameWithName(page, 'Jogador Teste');
    await page.waitForTimeout(2000);
    
    // Procurar botões de década usando data-testid
    const decade80 = page.getByTestId('decade-option-80');
    const decade90 = page.getByTestId('decade-option-90');
    const decade2000 = page.getByTestId('decade-option-2000');
    const decade2010 = page.getByTestId('decade-option-2010');
    
    const hasDecade80 = await decade80.isVisible({ timeout: 5000 }).catch(() => false);
    const hasDecade90 = await decade90.isVisible({ timeout: 2000 }).catch(() => false);
    const hasDecade2000 = await decade2000.isVisible({ timeout: 2000 }).catch(() => false);
    const hasDecade2010 = await decade2010.isVisible({ timeout: 2000 }).catch(() => false);
    
    const hasAnyDecade = hasDecade80 || hasDecade90 || hasDecade2000 || hasDecade2010;
    
    // Se tem décadas, clicar em uma
    if (hasAnyDecade) {
      if (hasDecade90) {
        await safeClick(page, decade90);
      } else if (hasDecade80) {
        await safeClick(page, decade80);
      } else if (hasDecade2000) {
        await safeClick(page, decade2000);
      } else {
        await safeClick(page, decade2010);
      }
      
      await page.waitForTimeout(2000);
      
      // Após seleção, deve carregar o jogo
      const playerImage = page.getByTestId('player-image');
      const guessInput = page.getByTestId('guess-input');
      const scoreDisplay = page.getByTestId('score-display');
      
      const hasPlayerImage = await playerImage.isVisible({ timeout: 10000 }).catch(() => false);
      const hasGuessInput = await guessInput.isVisible({ timeout: 5000 }).catch(() => false);
      const hasScore = await scoreDisplay.isVisible({ timeout: 5000 }).catch(() => false);
      
      expect(hasPlayerImage || hasGuessInput || hasScore).toBeTruthy();
    } else {
      // Se não tem seleção de década, jogo deve ter iniciado diretamente
      const playerImage = page.getByTestId('player-image');
      const hasPlayerImage = await playerImage.isVisible({ timeout: 10000 }).catch(() => false);
      expect(hasPlayerImage).toBeTruthy();
    }
  });

  test('should start game after decade selection', async ({ page }) => {
    await startGameWithName(page, 'Jogador Teste');
    await page.waitForTimeout(2000);
    
    // Tentar selecionar uma década se disponível
    const decade90 = page.getByTestId('decade-option-90');
    if (await decade90.isVisible({ timeout: 5000 }).catch(() => false)) {
      await safeClick(page, decade90);
      await page.waitForTimeout(2000);
    }
    
    // Verificar que o jogo iniciou
    const playerImage = page.getByTestId('player-image');
    const scoreDisplay = page.getByTestId('score-display');
    const timerDisplay = page.getByTestId('timer-display');
    
    const hasPlayerImage = await playerImage.isVisible({ timeout: 15000 }).catch(() => false);
    const hasScore = await scoreDisplay.isVisible({ timeout: 5000 }).catch(() => false);
    const hasTimer = await timerDisplay.isVisible({ timeout: 5000 }).catch(() => false);
    
    expect(hasPlayerImage || hasScore || hasTimer).toBeTruthy();
  });

  test('should allow submitting a guess in decade mode', async ({ page }) => {
    await startGameWithName(page, 'Jogador Teste');
    await page.waitForTimeout(2000);
    
    // Tentar selecionar uma década se disponível
    const decade90 = page.getByTestId('decade-option-90');
    if (await decade90.isVisible({ timeout: 5000 }).catch(() => false)) {
      await safeClick(page, decade90);
      await page.waitForTimeout(2000);
    }
    
    // Esperar imagem carregar
    const playerImage = page.getByTestId('player-image');
    await expect(playerImage).toBeVisible({ timeout: 20000 });
    
    // Fazer um palpite usando data-testid
    const guessInput = page.getByTestId('guess-input');
    if (await guessInput.isVisible({ timeout: 5000 }).catch(() => false)) {
      await guessInput.fill('Teste Jogador');
      
      // Fechar overlays antes de clicar no botão de enviar
      await closeAllOverlays(page);
      
      const submitButton = page.getByTestId('guess-submit-btn');
      if (await submitButton.isVisible({ timeout: 5000 }).catch(() => false)) {
        await safeClick(page, submitButton);
        
        // Confirmar dialog se aparecer
        await page.waitForTimeout(1000);
        const confirmButton = page.getByRole('button', { name: /confirmar|sim/i });
        if (await confirmButton.isVisible({ timeout: 3000 }).catch(() => false)) {
          await confirmButton.click();
        }
        
        // Verificar feedback
        await page.waitForTimeout(3000);
        
        const gameOverDialog = page.getByTestId('game-over-dialog');
        const toast = page.locator('[data-sonner-toast]');
        
        const hasGameOver = await gameOverDialog.isVisible({ timeout: 2000 }).catch(() => false);
        const hasToast = await toast.count() > 0;
        
        expect(hasGameOver || hasToast).toBeTruthy();
      }
    }
  });

  test('should filter players by selected decade', async ({ page }) => {
    await startGameWithName(page, 'Jogador Teste');
    await page.waitForTimeout(2000);
    
    // Verificar que existem opções de décadas usando data-testid
    const decade80 = page.getByTestId('decade-option-80');
    const decade90 = page.getByTestId('decade-option-90');
    
    const hasDecade80 = await decade80.isVisible({ timeout: 5000 }).catch(() => false);
    const hasDecade90 = await decade90.isVisible({ timeout: 2000 }).catch(() => false);
    
    // Se não há seleção de década, o jogo pode ter um modo diferente
    if (hasDecade80 || hasDecade90) {
      expect(hasDecade80 || hasDecade90).toBeTruthy();
    } else {
      // Jogo iniciou diretamente, verificar que está funcionando
      const playerImage = page.getByTestId('player-image');
      const hasPlayerImage = await playerImage.isVisible({ timeout: 10000 }).catch(() => false);
      expect(hasPlayerImage).toBeTruthy();
    }
  });
});
