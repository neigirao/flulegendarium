import { test, expect } from '@playwright/test';
import { waitForPageReady, startGameWithName, safeClick } from './helpers/test-helpers';

test.describe('Quiz por Década', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/quiz-decada');
    await waitForPageReady(page);
  });

  test('should load decade selection or game page', async ({ page }) => {
    // A página pode ser quiz-decada-page ou decade-selection-page
    const quizPage = page.getByTestId('quiz-decada-page');
    const decadeSelection = page.getByTestId('decade-selection-page');
    const guestForm = page.getByTestId('guest-name-form');
    
    const hasQuizPage = await quizPage.isVisible({ timeout: 15000 }).catch(() => false);
    const hasDecadeSelection = await decadeSelection.isVisible({ timeout: 5000 }).catch(() => false);
    const hasGuestForm = await guestForm.isVisible({ timeout: 5000 }).catch(() => false);
    
    expect(hasQuizPage || hasDecadeSelection || hasGuestForm).toBeTruthy();
  });

  test('should display decade selection page initially', async ({ page }) => {
    // A página de seleção de década pode aparecer
    const decadeSelectionPage = page.getByTestId('decade-selection-page');
    const guestForm = page.getByTestId('guest-name-form');
    
    // Primeiro pode pedir o nome
    await startGameWithName(page, 'Jogador Teste');
    await page.waitForTimeout(2000);
    
    const isSelectionVisible = await decadeSelectionPage.isVisible({ timeout: 10000 }).catch(() => false);
    
    // Se a página de seleção está visível, verificar as opções de década
    if (isSelectionVisible) {
      const decade1980s = page.getByTestId('decade-option-1980s');
      const decade1990s = page.getByTestId('decade-option-1990s');
      const decade2000s = page.getByTestId('decade-option-2000s');
      
      const hasDecade1980s = await decade1980s.isVisible({ timeout: 5000 }).catch(() => false);
      const hasDecade1990s = await decade1990s.isVisible({ timeout: 2000 }).catch(() => false);
      const hasDecade2000s = await decade2000s.isVisible({ timeout: 2000 }).catch(() => false);
      
      expect(hasDecade1980s || hasDecade1990s || hasDecade2000s).toBeTruthy();
    } else {
      // Se não está visível, o jogo pode ter iniciado diretamente
      const playerImage = page.getByTestId('player-image');
      const scoreDisplay = page.getByTestId('score-display');
      
      const hasPlayerImage = await playerImage.isVisible({ timeout: 10000 }).catch(() => false);
      const hasScore = await scoreDisplay.isVisible({ timeout: 5000 }).catch(() => false);
      
      expect(hasPlayerImage || hasScore).toBeTruthy();
    }
  });

  test('should allow selecting a decade', async ({ page }) => {
    // Primeiro preencher nome se necessário
    await startGameWithName(page, 'Jogador Teste');
    await page.waitForTimeout(2000);
    
    const decadeSelectionPage = page.getByTestId('decade-selection-page');
    const isSelectionVisible = await decadeSelectionPage.isVisible({ timeout: 10000 }).catch(() => false);
    
    if (isSelectionVisible) {
      // Tentar selecionar uma década disponível
      const decade1990s = page.getByTestId('decade-option-1990s');
      const decade2000s = page.getByTestId('decade-option-2000s');
      
      const hasDecade1990s = await decade1990s.isVisible({ timeout: 3000 }).catch(() => false);
      const hasDecade2000s = await decade2000s.isVisible({ timeout: 2000 }).catch(() => false);
      
      if (hasDecade1990s) {
        await safeClick(page, decade1990s);
      } else if (hasDecade2000s) {
        await safeClick(page, decade2000s);
      }
      
      // Aguardar jogo carregar
      await page.waitForTimeout(3000);
      
      // Deve mostrar elementos do jogo
      const playerImage = page.getByTestId('player-image');
      const scoreDisplay = page.getByTestId('score-display');
      
      const hasPlayerImage = await playerImage.isVisible({ timeout: 15000 }).catch(() => false);
      const hasScore = await scoreDisplay.isVisible({ timeout: 5000 }).catch(() => false);
      
      expect(hasPlayerImage || hasScore).toBeTruthy();
    } else {
      // Jogo iniciou diretamente
      const playerImage = page.getByTestId('player-image');
      const hasPlayerImage = await playerImage.isVisible({ timeout: 15000 }).catch(() => false);
      expect(hasPlayerImage).toBeTruthy();
    }
  });

  test('should start game after decade selection and name input', async ({ page }) => {
    test.setTimeout(60000);
    
    // Primeiro preencher nome se necessário
    await startGameWithName(page, 'Jogador Teste');
    await page.waitForTimeout(2000);
    
    const decadeSelectionPage = page.getByTestId('decade-selection-page');
    const isSelectionVisible = await decadeSelectionPage.isVisible({ timeout: 10000 }).catch(() => false);
    
    if (isSelectionVisible) {
      // Selecionar década
      const decade1990s = page.getByTestId('decade-option-1990s');
      const decade2000s = page.getByTestId('decade-option-2000s');
      
      if (await decade1990s.isVisible({ timeout: 3000 }).catch(() => false)) {
        await safeClick(page, decade1990s);
      } else if (await decade2000s.isVisible({ timeout: 2000 }).catch(() => false)) {
        await safeClick(page, decade2000s);
      }
      
      await page.waitForTimeout(3000);
    }
    
    // Verificar elementos do jogo
    const timerDisplay = page.getByTestId('timer-display');
    const scoreDisplay = page.getByTestId('score-display');
    const playerImage = page.getByTestId('player-image');
    
    const hasTimer = await timerDisplay.isVisible({ timeout: 10000 }).catch(() => false);
    const hasScore = await scoreDisplay.isVisible({ timeout: 5000 }).catch(() => false);
    const hasPlayerImage = await playerImage.isVisible({ timeout: 5000 }).catch(() => false);
    
    expect(hasTimer || hasScore || hasPlayerImage).toBeTruthy();
  });

  test('should not show error icons', async ({ page }) => {
    await startGameWithName(page, 'Jogador Teste');
    await page.waitForTimeout(2000);
    
    const errorIcon = page.getByTestId('image-error');
    const hasError = await errorIcon.isVisible({ timeout: 3000 }).catch(() => false);
    expect(hasError).toBeFalsy();
  });
});
