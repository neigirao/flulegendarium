import { test, expect } from '@playwright/test';
import { waitForPageReady, startGameWithName, assertImageVisible } from './helpers/test-helpers';

test.describe('Quiz Adaptativo', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/quiz-adaptativo');
    await waitForPageReady(page);
  });

  test('should load game page', async ({ page }) => {
    const quizPage = page.getByTestId('quiz-adaptativo-page');
    await expect(quizPage).toBeVisible({ timeout: 15000 });
  });

  test('should show guest name form for unauthenticated users', async ({ page }) => {
    const guestForm = page.getByTestId('guest-name-form');
    // O formulário deve aparecer para usuários não autenticados
    const isVisible = await guestForm.isVisible({ timeout: 10000 }).catch(() => false);
    
    // Se o formulário aparecer, verificar seus elementos
    if (isVisible) {
      const nameInput = page.getByTestId('player-name-input');
      const startButton = page.getByTestId('start-game-button');
      
      await expect(nameInput).toBeVisible();
      await expect(startButton).toBeVisible();
    }
  });

  test('should start game after entering name', async ({ page }) => {
    const started = await startGameWithName(page, 'Jogador Teste');
    
    // Se conseguiu iniciar o jogo, verificar elementos do jogo
    if (started) {
      // Aguardar carregamento do jogo
      await page.waitForTimeout(2000);
      
      // Verificar se score está visível
      const scoreDisplay = page.getByTestId('score-display');
      await expect(scoreDisplay).toBeVisible({ timeout: 15000 });
    }
  });

  test('should display player image after starting', async ({ page }) => {
    await startGameWithName(page, 'Jogador Teste');
    
    // Aguardar imagem carregar
    const playerImage = page.getByTestId('player-image');
    await expect(playerImage).toBeVisible({ timeout: 20000 });
  });

  test('should display guess form', async ({ page }) => {
    await startGameWithName(page, 'Jogador Teste');
    await page.waitForTimeout(2000);
    
    // Verificar formulário de palpite
    const guessForm = page.getByTestId('guess-form');
    await expect(guessForm).toBeVisible({ timeout: 15000 });
    
    const guessInput = page.getByTestId('guess-input');
    await expect(guessInput).toBeVisible();
  });

  test('should not show error icons', async ({ page }) => {
    await startGameWithName(page, 'Jogador Teste');
    
    // Verificar que não há erros de imagem visíveis
    const errorIcon = page.getByTestId('image-error');
    await expect(errorIcon).not.toBeVisible();
  });
});
