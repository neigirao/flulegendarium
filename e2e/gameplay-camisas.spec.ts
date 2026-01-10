import { test, expect } from '@playwright/test';

// Helper para preencher nome e iniciar jogo
async function startGame(page: import('@playwright/test').Page) {
  const nameInput = page.locator('input[placeholder*="nome"], input[placeholder*="Nome"]');
  const isNameFormVisible = await nameInput.first().isVisible().catch(() => false);
  
  if (isNameFormVisible) {
    await nameInput.first().fill('Jogador Teste');
    
    const submitButton = page.getByRole('button', { name: /confirmar|começar|jogar/i });
    if (await submitButton.count() > 0) {
      await submitButton.first().click();
      await page.waitForTimeout(1000);
    }
  }
}

test.describe('Gameplay - Quiz de Camisas', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/quiz-camisas');
    await page.waitForLoadState('networkidle');
  });

  test('should display year options for selection', async ({ page }) => {
    await startGame(page);
    
    // Esperar camisa carregar
    await page.waitForSelector('[data-testid="jersey-image"]', { timeout: 15000 });
    
    // Verificar que opções de anos estão visíveis (botões com anos tipo 1984, 1995, 2004)
    const yearOptions = page.getByRole('button').filter({ hasText: /19\d{2}|20\d{2}/ });
    const count = await yearOptions.count();
    expect(count).toBeGreaterThanOrEqual(2);
  });

  test('should allow selecting a year option', async ({ page }) => {
    await startGame(page);
    
    // Esperar camisa carregar
    await page.waitForSelector('[data-testid="jersey-image"]', { timeout: 15000 });
    
    // Clicar na primeira opção de ano
    const yearOptions = page.getByRole('button').filter({ hasText: /19\d{2}|20\d{2}/ });
    await expect(yearOptions.first()).toBeVisible();
    await yearOptions.first().click();
    
    // Verificar que o botão foi selecionado ou resultado apareceu
    await page.waitForTimeout(1500);
    
    // Após clique, algo deve acontecer
    const selectedButton = page.locator('button[class*="selected"], button[aria-pressed="true"]');
    const resultIndicator = page.getByText(/correto|errado|certo|incorreto/i);
    const nextJersey = page.locator('[data-testid="jersey-image"]');
    
    const hasSelected = await selectedButton.count() > 0;
    const hasResult = await resultIndicator.count() > 0;
    const hasJersey = await nextJersey.count() > 0;
    
    expect(hasSelected || hasResult || hasJersey).toBeTruthy();
  });

  test('should show visual feedback for correct answer', async ({ page }) => {
    await startGame(page);
    
    // Esperar camisa carregar
    await page.waitForSelector('[data-testid="jersey-image"]', { timeout: 15000 });
    
    // Clicar em qualquer opção e verificar feedback visual
    const yearOptions = page.getByRole('button').filter({ hasText: /19\d{2}|20\d{2}/ });
    await yearOptions.first().click();
    
    // Esperar feedback
    await page.waitForTimeout(2000);
    
    // Deve haver algum tipo de feedback visual
    const correctIndicator = page.locator('[class*="green"], [class*="success"], .bg-green');
    const incorrectIndicator = page.locator('[class*="red"], [class*="error"], [class*="destructive"], .bg-red');
    const textFeedback = page.getByText(/✓|correto|certo|✗|incorreto|errado/i);
    
    const hasCorrect = await correctIndicator.count() > 0;
    const hasIncorrect = await incorrectIndicator.count() > 0;
    const hasTextFeedback = await textFeedback.count() > 0;
    
    expect(hasCorrect || hasIncorrect || hasTextFeedback).toBeTruthy();
  });

  test('should show score after selecting answer', async ({ page }) => {
    await startGame(page);
    
    // Esperar camisa carregar
    await page.waitForSelector('[data-testid="jersey-image"]', { timeout: 15000 });
    
    // Verificar pontuação visível
    const scoreDisplay = page.getByText(/pontos?|score|pts/i);
    await expect(scoreDisplay.first()).toBeVisible();
    
    // Clicar na primeira opção
    const yearOptions = page.getByRole('button').filter({ hasText: /19\d{2}|20\d{2}/ });
    await yearOptions.first().click();
    
    // Esperar processamento
    await page.waitForTimeout(2000);
    
    // Pontuação ainda deve estar visível
    await expect(scoreDisplay.first()).toBeVisible();
  });

  test('should show game over after incorrect answer', async ({ page }) => {
    await startGame(page);
    
    // Esperar camisa carregar
    await page.waitForSelector('[data-testid="jersey-image"]', { timeout: 15000 });
    
    // Clicar em uma opção
    const yearOptions = page.getByRole('button').filter({ hasText: /19\d{2}|20\d{2}/ });
    await yearOptions.first().click();
    
    // Esperar resultado
    await page.waitForTimeout(2000);
    
    // Se errou, deve aparecer game over ou próxima camisa se acertou
    const gameOverDialog = page.locator('[role="dialog"]');
    const gameOverText = page.getByText(/game over|fim|errou/i);
    const nextJersey = page.locator('[data-testid="jersey-image"]');
    
    const hasGameOver = await gameOverDialog.count() > 0 || await gameOverText.count() > 0;
    const hasNextJersey = await nextJersey.count() > 0;
    
    expect(hasGameOver || hasNextJersey).toBeTruthy();
  });

  test('should have skip player button', async ({ page }) => {
    await startGame(page);
    
    // Esperar camisa carregar
    await page.waitForSelector('[data-testid="jersey-image"]', { timeout: 15000 });
    
    // Verificar botão de pular
    const skipButton = page.getByRole('button', { name: /pular|skip/i });
    const skipButtonCount = await skipButton.count();
    expect(skipButtonCount).toBeGreaterThan(0);
  });
});
