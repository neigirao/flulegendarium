import { Page, Locator, expect } from '@playwright/test';

/**
 * Centralized E2E test helpers for Lendas do Flu
 * Following best practices for stable, maintainable tests
 */

// ========== Page Ready Helpers ==========

/**
 * Wait for page to be fully ready for interaction
 */
export async function waitForPageReady(page: Page, timeout = 15000): Promise<void> {
  await page.waitForLoadState('domcontentloaded');
  // Use try-catch for networkidle to avoid timeout errors
  try {
    await page.waitForLoadState('networkidle', { timeout });
  } catch {
    // Fallback: just wait a bit if networkidle times out
    await page.waitForTimeout(2000);
  }
  // Extra wait for React hydration
  await page.waitForTimeout(1000);
}

/**
 * Wait for a specific element to be visible and stable
 */
export async function waitForElement(
  page: Page, 
  testId: string, 
  timeout = 10000
): Promise<Locator> {
  const element = page.getByTestId(testId);
  await expect(element).toBeVisible({ timeout });
  return element;
}

// ========== Overlay Management ==========

/**
 * Close any open dialogs or overlays
 */
export async function closeAllOverlays(page: Page): Promise<void> {
  // Try pressing Escape to close dialogs
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);
  
  // Try clicking any visible close buttons
  const closeButtons = page.locator('[data-testid="close-dialog"], [aria-label="Fechar"], [aria-label="Close"]');
  const count = await closeButtons.count();
  
  for (let i = 0; i < count; i++) {
    const button = closeButtons.nth(i);
    if (await button.isVisible({ timeout: 1000 }).catch(() => false)) {
      await button.click({ force: true });
      await page.waitForTimeout(200);
    }
  }
}

// ========== Game Start Helpers ==========

/**
 * Start game with a guest name (for unauthenticated users)
 */
export async function startGameWithName(
  page: Page, 
  playerName = 'Jogador Teste'
): Promise<boolean> {
  // Wait for name input form to appear
  const nameInput = page.getByTestId('player-name-input');
  
  // Check if form is visible
  const isVisible = await nameInput.isVisible({ timeout: 5000 }).catch(() => false);
  
  if (!isVisible) {
    // User might be authenticated or form not required
    return false;
  }
  
  await nameInput.fill(playerName);
  
  const startButton = page.getByTestId('start-game-button');
  await expect(startButton).toBeEnabled({ timeout: 3000 });
  await startButton.click();
  
  // Wait for form to close
  await page.waitForTimeout(1000);
  
  return true;
}

/**
 * Navigate to a game mode and start playing
 */
export async function navigateAndStartGame(
  page: Page,
  gameMode: 'adaptativo' | 'decada' | 'camisas',
  playerName = 'Jogador Teste'
): Promise<void> {
  // Click on game mode card
  const testId = `game-mode-${gameMode}`;
  const gameModeCard = page.getByTestId(testId);
  
  if (await gameModeCard.isVisible({ timeout: 5000 }).catch(() => false)) {
    await gameModeCard.click();
    await page.waitForURL(new RegExp(`quiz-${gameMode}`));
    await waitForPageReady(page);
    await startGameWithName(page, playerName);
  }
}

// ========== Safe Interaction Helpers ==========

/**
 * Click an element safely, closing overlays first
 */
export async function safeClick(
  page: Page, 
  locator: Locator
): Promise<void> {
  await closeAllOverlays(page);
  await locator.waitFor({ state: 'visible', timeout: 5000 });
  await locator.click({ force: true });
}

/**
 * Fill an input safely
 */
export async function safeFill(
  page: Page,
  locator: Locator,
  value: string
): Promise<void> {
  await closeAllOverlays(page);
  await locator.waitFor({ state: 'visible', timeout: 5000 });
  await locator.fill(value);
}

// ========== Game State Helpers ==========

/**
 * Check if game is in active state (timer running, not game over)
 */
export async function isGameActive(page: Page): Promise<boolean> {
  const timerDisplay = page.getByTestId('timer-display');
  const gameOverDialog = page.getByTestId('game-over-dialog');
  
  const hasTimer = await timerDisplay.isVisible({ timeout: 2000 }).catch(() => false);
  const hasGameOver = await gameOverDialog.isVisible({ timeout: 500 }).catch(() => false);
  
  return hasTimer && !hasGameOver;
}

/**
 * Wait for game to start (timer running)
 */
export async function waitForGameStart(page: Page, timeout = 15000): Promise<void> {
  const timerDisplay = page.getByTestId('timer-display');
  await expect(timerDisplay).toBeVisible({ timeout });
}

/**
 * Wait for game over dialog
 */
export async function waitForGameOver(page: Page, timeout = 120000): Promise<void> {
  const gameOverDialog = page.getByTestId('game-over-dialog');
  await expect(gameOverDialog).toBeVisible({ timeout });
}

// ========== Score Helpers ==========

/**
 * Get current score from display
 */
export async function getScore(page: Page): Promise<number> {
  const scoreDisplay = page.getByTestId('score-display');
  const text = await scoreDisplay.textContent();
  const match = text?.match(/\d+/);
  return match ? parseInt(match[0], 10) : 0;
}

// ========== Quiz Specific Helpers ==========

/**
 * Submit a guess in quiz adaptativo
 */
export async function submitGuess(page: Page, guess: string): Promise<void> {
  const guessInput = page.getByTestId('guess-input');
  const submitButton = page.getByTestId('submit-guess-button');
  
  await safeFill(page, guessInput, guess);
  await safeClick(page, submitButton);
  await page.waitForTimeout(500);
}

/**
 * Select a year option in quiz camisas
 */
export async function selectYearOption(page: Page, year?: number): Promise<void> {
  // If no year specified, click the first option
  const yearButtons = page.getByTestId(/^year-option-/);
  const count = await yearButtons.count();
  
  if (count > 0) {
    if (year) {
      const specificButton = page.getByTestId(`year-option-${year}`);
      if (await specificButton.isVisible({ timeout: 2000 }).catch(() => false)) {
        await safeClick(page, specificButton);
        return;
      }
    }
    // Click first available option
    await safeClick(page, yearButtons.first());
  }
}

/**
 * Select a decade in quiz decada
 */
export async function selectDecade(page: Page, decade: string): Promise<void> {
  const decadeButton = page.getByTestId(`decade-option-${decade}`);
  await safeClick(page, decadeButton);
  await page.waitForTimeout(500);
}

// ========== Assertion Helpers ==========

/**
 * Assert that player/jersey image is visible
 */
export async function assertImageVisible(
  page: Page, 
  type: 'player' | 'jersey' = 'player'
): Promise<void> {
  const testId = type === 'player' ? 'player-image' : 'jersey-image';
  const image = page.getByTestId(testId);
  await expect(image).toBeVisible({ timeout: 15000 });
  
  // Also check that error icon is not visible
  const errorIcon = page.getByTestId('image-error');
  await expect(errorIcon).not.toBeVisible();
}

/**
 * Assert score display is visible
 */
export async function assertScoreVisible(page: Page): Promise<void> {
  const scoreDisplay = page.getByTestId('score-display');
  await expect(scoreDisplay).toBeVisible({ timeout: 5000 });
}

// ========== Navigation Helpers ==========

/**
 * Navigate to game mode selection page
 */
export async function goToGameModeSelection(page: Page): Promise<void> {
  await page.goto('/selecionar-modo-jogo');
  await waitForPageReady(page);
}

/**
 * Navigate to specific quiz page
 */
export async function goToQuiz(
  page: Page, 
  quiz: 'adaptativo' | 'decada' | 'camisas'
): Promise<void> {
  await page.goto(`/quiz-${quiz}`);
  await waitForPageReady(page);
}

// ========== Debug Helpers ==========

/**
 * Take a screenshot with a descriptive name
 */
export async function takeScreenshot(
  page: Page, 
  name: string
): Promise<void> {
  await page.screenshot({ 
    path: `test-results/screenshots/${name}-${Date.now()}.png`,
    fullPage: true 
  });
}

/**
 * Log current page state for debugging
 */
export async function logPageState(page: Page): Promise<void> {
  const url = page.url();
  const title = await page.title();
  console.log(`[Page State] URL: ${url}, Title: ${title}`);
}
