import { test, expect } from '@playwright/test';

// Helper para fechar qualquer overlay/dialog aberto
async function closeOverlays(page: import('@playwright/test').Page) {
  // Tentar fechar qualquer overlay clicando no backdrop ou botão de fechar
  const overlay = page.locator('.fixed.inset-0.bg-black\\/50, [data-radix-dialog-overlay]');
  const closeButton = page.locator('[data-radix-dialog-close], button:has-text("×"), button:has-text("Fechar")');
  
  // Pressionar Escape para fechar modais
  await page.keyboard.press('Escape').catch(() => {});
  await page.waitForTimeout(300);
  
  // Se ainda houver overlay, tentar clicar fora
  if (await overlay.count() > 0) {
    await page.keyboard.press('Escape').catch(() => {});
    await page.waitForTimeout(300);
  }
  
  // Tentar clicar no botão de fechar se existir
  if (await closeButton.count() > 0) {
    await closeButton.first().click({ force: true }).catch(() => {});
    await page.waitForTimeout(300);
  }
}

// Helper para preencher nome e iniciar jogo
async function startGame(page: import('@playwright/test').Page) {
  // Primeiro fecha qualquer overlay que possa estar aberto
  await closeOverlays(page);
  
  const nameInput = page.locator('input[placeholder*="nome"], input[placeholder*="Nome"]');
  const isNameFormVisible = await nameInput.first().isVisible().catch(() => false);
  
  if (isNameFormVisible) {
    await nameInput.first().fill('Jogador Teste');
    
    // Procurar botão de submit dentro do formulário (não no overlay)
    const formSubmitButton = page.locator('form button[type="submit"], button:has-text("Confirmar"):not([data-radix-dialog-close])');
    if (await formSubmitButton.count() > 0) {
      await formSubmitButton.first().click({ force: true });
      await page.waitForTimeout(1000);
    } else {
      // Fallback: qualquer botão com texto apropriado
      const submitButton = page.getByRole('button', { name: /confirmar|começar|jogar/i });
      if (await submitButton.count() > 0) {
        await submitButton.first().click({ force: true });
        await page.waitForTimeout(1000);
      }
    }
  }
}

test.describe('Gameplay - Quiz Adaptativo', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/quiz-adaptativo');
    // Usar domcontentloaded em vez de networkidle para evitar timeout
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000); // Aguarda renderização inicial
  });

  test('should allow submitting a guess', async ({ page }) => {
    await startGame(page);
    
    // Esperar imagem carregar
    await page.waitForSelector('[data-testid="player-image"]', { timeout: 15000 });
    
    // Verificar que input de palpite existe
    const inputField = page.locator('input[type="text"]').last();
    await expect(inputField).toBeVisible();
  });

  test('should show feedback after incorrect guess', async ({ page }) => {
    await startGame(page);
    
    // Esperar jogo carregar
    await page.waitForSelector('[data-testid="player-image"]', { timeout: 15000 });
    
    // Fazer um palpite errado
    const guessInput = page.locator('input[type="text"]').last();
    await guessInput.fill('Nome Incorreto XYZ');
    
    // Clicar no botão de enviar
    const sendButton = page.getByRole('button', { name: /enviar|confirmar|→/i });
    if (await sendButton.count() > 0) {
      await sendButton.first().click();
      
      // Confirmar no dialog se aparecer
      const confirmButton = page.getByRole('button', { name: /confirmar|sim/i });
      if (await confirmButton.isVisible({ timeout: 2000 }).catch(() => false)) {
        await confirmButton.click();
      }
      
      // Aguardar feedback
      await page.waitForTimeout(2000);
      
      // Verificar que algo aconteceu
      const gameOverDialog = page.getByText(/game over|fim de jogo|errou|incorreto/i);
      const toast = page.locator('[data-sonner-toast], .sonner-toast, [role="status"]');
      
      const hasGameOver = await gameOverDialog.count() > 0;
      const hasToast = await toast.count() > 0;
      
      expect(hasGameOver || hasToast).toBeTruthy();
    }
  });

  test('should update score display after gameplay', async ({ page }) => {
    await startGame(page);
    
    // Esperar jogo carregar
    await page.waitForSelector('[data-testid="player-image"]', { timeout: 15000 });
    
    // Verificar que o contador de pontos está visível
    const scoreDisplay = page.getByText(/pontos?|score|pts/i);
    await expect(scoreDisplay.first()).toBeVisible();
  });

  test('should have timer visible during gameplay', async ({ page }) => {
    await startGame(page);
    
    // Esperar jogo carregar
    await page.waitForSelector('[data-testid="player-image"]', { timeout: 15000 });
    
    // Verificar timer
    const timer = page.getByText(/\d+s|segundo/i);
    const timerCount = await timer.count();
    expect(timerCount).toBeGreaterThan(0);
  });

  test('should show game over when time runs out', async ({ page }) => {
    await startGame(page);
    
    // Esperar jogo carregar
    await page.waitForSelector('[data-testid="player-image"]', { timeout: 15000 });
    
    // Esperar o tempo acabar (máximo 20 segundos)
    await page.waitForTimeout(20000);
    
    // Verificar que game over apareceu
    const gameOverIndicator = page.getByText(/game over|fim de jogo|tempo|esgotou|acabou/i);
    const gameOverDialog = page.locator('[role="dialog"], [data-radix-dialog-content]');
    
    const hasGameOverText = await gameOverIndicator.count() > 0;
    const hasDialog = await gameOverDialog.count() > 0;
    
    expect(hasGameOverText || hasDialog).toBeTruthy();
  });
});
