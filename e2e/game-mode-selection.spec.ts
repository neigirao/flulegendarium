import { test, expect } from '@playwright/test';
import { waitForPageReady, waitForElement, goToGameModeSelection } from './helpers/test-helpers';

test.describe('Seleção de Modo de Jogo', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/selecionar-modo-jogo');
    await waitForPageReady(page);
  });

  test('should display game mode page', async ({ page }) => {
    // Verificar que a página carrega com o data-testid correto
    const gameModePagee = page.getByTestId('game-mode-page');
    await expect(gameModePagee).toBeVisible({ timeout: 10000 });
  });

  test('should display all game modes', async ({ page }) => {
    // Verificar que os modos estão visíveis usando data-testid
    const adaptativoButton = page.getByTestId('game-mode-adaptativo');
    const decadaButton = page.getByTestId('game-mode-decada');
    const camisasButton = page.getByTestId('game-mode-camisas');
    
    await expect(adaptativoButton).toBeVisible({ timeout: 10000 });
    await expect(decadaButton).toBeVisible();
    await expect(camisasButton).toBeVisible();
  });

  test('should navigate to quiz adaptativo', async ({ page }) => {
    const adaptativoButton = page.getByTestId('game-mode-adaptativo');
    await expect(adaptativoButton).toBeVisible({ timeout: 10000 });
    
    await adaptativoButton.click();
    await page.waitForURL(/quiz-adaptativo/, { timeout: 10000 });
    
    // Verificar que a página do quiz carregou
    const quizPage = page.getByTestId('quiz-adaptativo-page');
    await expect(quizPage).toBeVisible({ timeout: 15000 });
  });

  test('should navigate to quiz decada', async ({ page }) => {
    const decadaButton = page.getByTestId('game-mode-decada');
    await expect(decadaButton).toBeVisible({ timeout: 10000 });
    
    await decadaButton.click();
    await page.waitForURL(/quiz-decada/, { timeout: 10000 });
    
    // Verificar que a página de seleção de década ou quiz carregou
    const decadePage = page.getByTestId('quiz-decada-page');
    await expect(decadePage).toBeVisible({ timeout: 15000 });
  });

  test('should navigate to quiz camisas', async ({ page }) => {
    const camisasButton = page.getByTestId('game-mode-camisas');
    await expect(camisasButton).toBeVisible({ timeout: 10000 });
    
    await camisasButton.click();
    await page.waitForURL(/quiz-camisas/, { timeout: 10000 });
    
    // Verificar que a página do quiz carregou
    const camisasPage = page.getByTestId('quiz-camisas-page');
    await expect(camisasPage).toBeVisible({ timeout: 15000 });
  });
});
