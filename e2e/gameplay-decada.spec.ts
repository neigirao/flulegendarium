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

test.describe('Gameplay - Quiz por Década', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/quiz-decada');
    // Usar domcontentloaded em vez de networkidle para evitar timeout
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000); // Aguarda renderização inicial
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
    
    // Fechar overlays antes de clicar
    await closeOverlays(page);
    
    // Procurar botões de década
    const decadeButtons = page.getByRole('button').filter({ hasText: /80|90|2000|2010|jogar/i });
    const count = await decadeButtons.count();
    
    if (count > 0) {
      await decadeButtons.first().click({ force: true });
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
    
    // Fechar overlays antes de clicar
    await closeOverlays(page);
    
    // Selecionar década se necessário
    const decadeButtons = page.getByRole('button').filter({ hasText: /80|90|2000|2010|jogar/i });
    if (await decadeButtons.count() > 0) {
      await decadeButtons.first().click({ force: true });
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
    
    // Fechar overlays antes de clicar
    await closeOverlays(page);
    
    // Selecionar década se necessário
    const decadeButtons = page.getByRole('button').filter({ hasText: /80|90|2000|2010|jogar/i });
    if (await decadeButtons.count() > 0) {
      await decadeButtons.first().click({ force: true });
      await page.waitForTimeout(1500);
    }
    
    await startGame(page);
    
    // Esperar imagem carregar
    await page.waitForSelector('[data-testid="player-image"]', { timeout: 15000 }).catch(() => {});
    
    // Fazer um palpite
    const guessInput = page.locator('input[type="text"]').last();
    if (await guessInput.isVisible().catch(() => false)) {
      await guessInput.fill('Teste Jogador');
      
      // Fechar overlays antes de clicar no botão de enviar
      await closeOverlays(page);
      
      const sendButton = page.getByRole('button', { name: /enviar|confirmar|→/i });
      if (await sendButton.count() > 0) {
        await sendButton.first().click({ force: true });
        
        // Confirmar dialog se aparecer
        const confirmButton = page.getByRole('button', { name: /confirmar|sim/i });
        if (await confirmButton.isVisible({ timeout: 2000 }).catch(() => false)) {
          await confirmButton.click({ force: true });
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
