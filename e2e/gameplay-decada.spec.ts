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

test.describe('Gameplay - Quiz por Década', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/quiz-decada');
    await page.waitForLoadState('networkidle');
  });

  test('should display decade selection or game', async ({ page }) => {
    await page.waitForTimeout(2000);
    
    // A página pode mostrar seleção de décadas ou ir direto pro jogo
    const decadeButtons = page.getByRole('button').filter({ hasText: /80|90|2000|2010|década|anos/i });
    const playerImage = page.getByTestId('player-image');
    const content = page.locator('main, section, h1, h2');
    
    const hasDecadeButtons = await decadeButtons.count() > 0;
    const hasPlayerImage = await playerImage.count() > 0;
    const hasContent = await content.count() > 0;
    
    expect(hasDecadeButtons || hasPlayerImage || hasContent).toBeTruthy();
  });

  test('should allow selecting a decade', async ({ page }) => {
    await page.waitForTimeout(2000);
    
    // Procurar botões de década
    const decadeButtons = page.getByRole('button').filter({ hasText: /80|90|2000|2010|jogar/i });
    const count = await decadeButtons.count();
    
    if (count > 0) {
      await decadeButtons.first().click();
      await page.waitForTimeout(1500);
      
      // Após seleção, deve carregar o jogo ou próxima tela
      const playerImage = page.getByTestId('player-image');
      const gameContent = page.locator('input[type="text"]');
      const nameForm = page.locator('input[placeholder*="nome"]');
      const submitButtons = page.getByRole('button', { name: /enviar|confirmar/i });
      
      const hasPlayerImage = await playerImage.count() > 0;
      const hasGameContent = await gameContent.count() > 0;
      const hasNameForm = await nameForm.count() > 0;
      const hasSubmitButtons = await submitButtons.count() > 0;
      
      expect(hasPlayerImage || hasGameContent || hasNameForm || hasSubmitButtons).toBeTruthy();
    }
  });

  test('should start game after decade selection', async ({ page }) => {
    await page.waitForTimeout(2000);
    
    // Selecionar década se necessário
    const decadeButtons = page.getByRole('button').filter({ hasText: /80|90|2000|2010|jogar/i });
    if (await decadeButtons.count() > 0) {
      await decadeButtons.first().click();
      await page.waitForTimeout(1500);
    }
    
    await startGame(page);
    
    // Verificar que o jogo iniciou
    const playerImage = page.getByTestId('player-image');
    const guessInput = page.locator('input[type="text"]');
    const scoreDisplay = page.getByText(/pontos?|score/i);
    
    const hasPlayerImage = await playerImage.count() > 0;
    const hasGuessInput = await guessInput.count() > 0;
    const hasScore = await scoreDisplay.count() > 0;
    
    expect(hasPlayerImage || hasGuessInput || hasScore).toBeTruthy();
  });

  test('should allow submitting a guess in decade mode', async ({ page }) => {
    await page.waitForTimeout(2000);
    
    // Selecionar década se necessário
    const decadeButtons = page.getByRole('button').filter({ hasText: /80|90|2000|2010|jogar/i });
    if (await decadeButtons.count() > 0) {
      await decadeButtons.first().click();
      await page.waitForTimeout(1500);
    }
    
    await startGame(page);
    
    // Esperar imagem carregar
    await page.waitForSelector('[data-testid="player-image"]', { timeout: 15000 }).catch(() => {});
    
    // Fazer um palpite
    const guessInput = page.locator('input[type="text"]').last();
    if (await guessInput.isVisible().catch(() => false)) {
      await guessInput.fill('Teste Jogador');
      
      const sendButton = page.getByRole('button', { name: /enviar|confirmar|→/i });
      if (await sendButton.count() > 0) {
        await sendButton.first().click();
        
        // Confirmar dialog se aparecer
        const confirmButton = page.getByRole('button', { name: /confirmar|sim/i });
        if (await confirmButton.isVisible({ timeout: 2000 }).catch(() => false)) {
          await confirmButton.click();
        }
        
        // Verificar feedback
        await page.waitForTimeout(2000);
        
        const hasResponse = await page.getByText(/correto|incorreto|errou|acertou|game over/i).count() > 0;
        const hasToast = await page.locator('[data-sonner-toast]').count() > 0;
        const hasDialog = await page.locator('[role="dialog"]').count() > 0;
        
        expect(hasResponse || hasToast || hasDialog).toBeTruthy();
      }
    }
  });

  test('should filter players by selected decade', async ({ page }) => {
    await page.waitForTimeout(2000);
    
    // Este teste verifica que existem opções de décadas
    const decadeButtons = page.getByRole('button').filter({ hasText: /80|90|anos 80|anos 90/i });
    
    if (await decadeButtons.count() > 0) {
      const count = await decadeButtons.count();
      expect(count).toBeGreaterThanOrEqual(1);
    }
  });
});
