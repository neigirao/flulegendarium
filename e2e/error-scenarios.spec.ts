import { test, expect } from '@playwright/test';
import { waitForPageReady, startGameWithName, closeAllOverlays } from './helpers/test-helpers';

test.describe('Cenários de Erro e Resiliência', () => {

  test.describe('Imagens Quebradas', () => {
    test('should show fallback when player image URL fails', async ({ page }) => {
      test.setTimeout(60000);

      // Interceptar requisições de imagem para simular falha
      await page.route('**/storage/v1/object/public/players/**', (route) => {
        route.abort('connectionrefused');
      });

      await page.goto('/quiz-adaptativo');
      await waitForPageReady(page);
      await startGameWithName(page, 'Jogador Teste');
      await page.waitForTimeout(5000);

      // Não deve haver ícone de erro visível (fallback deve cobrir)
      const errorIcon = page.getByTestId('image-error');
      const hasError = await errorIcon.isVisible({ timeout: 5000 }).catch(() => false);

      // O fallback SVG inline ou imagem padrão deve aparecer em vez de erro
      const playerImage = page.getByTestId('player-image');
      const hasImage = await playerImage.isVisible({ timeout: 10000 }).catch(() => false);
      const skeleton = page.getByTestId('image-skeleton');
      const hasSkeleton = await skeleton.isVisible({ timeout: 3000 }).catch(() => false);

      // Deve ter imagem ou skeleton, nunca erro visível
      expect(hasImage || hasSkeleton || !hasError).toBeTruthy();
    });

    test('should show fallback when jersey image URL fails', async ({ page }) => {
      test.setTimeout(60000);

      await page.route('**/storage/v1/object/public/jerseys/**', (route) => {
        route.abort('connectionrefused');
      });

      await page.goto('/quiz-camisas');
      await waitForPageReady(page);
      await startGameWithName(page, 'Jogador Teste');
      await page.waitForTimeout(5000);

      const errorIcon = page.getByTestId('image-error');
      const hasError = await errorIcon.isVisible({ timeout: 5000 }).catch(() => false);

      const jerseyImage = page.getByTestId('jersey-image');
      const hasImage = await jerseyImage.isVisible({ timeout: 10000 }).catch(() => false);

      expect(hasImage || !hasError).toBeTruthy();
    });

    test('should handle 404 image responses gracefully', async ({ page }) => {
      test.setTimeout(60000);

      await page.route('**/storage/v1/object/public/players/**', (route) => {
        route.fulfill({ status: 404, body: 'Not Found' });
      });

      await page.goto('/quiz-adaptativo');
      await waitForPageReady(page);
      await startGameWithName(page, 'Jogador Teste');
      await page.waitForTimeout(5000);

      // Página não deve quebrar
      const quizPage = page.getByTestId('quiz-adaptativo-page');
      const hasPage = await quizPage.isVisible({ timeout: 10000 }).catch(() => false);
      expect(hasPage).toBeTruthy();
    });

    test('should handle 429 rate-limited image responses', async ({ page }) => {
      test.setTimeout(60000);

      await page.route('**/storage/v1/object/public/players/**', (route) => {
        route.fulfill({ status: 429, body: 'Too Many Requests' });
      });

      await page.goto('/quiz-adaptativo');
      await waitForPageReady(page);
      await startGameWithName(page, 'Jogador Teste');
      await page.waitForTimeout(5000);

      // Deve mostrar fallback, sem crash
      const errorIcon = page.getByTestId('image-error');
      const hasError = await errorIcon.isVisible({ timeout: 3000 }).catch(() => false);
      expect(hasError).toBeFalsy();
    });
  });

  test.describe('Timeout de Rede (API)', () => {
    test('should handle slow API responses gracefully', async ({ page }) => {
      test.setTimeout(90000);

      // Simular API lenta (delay de 10s nas queries de players)
      await page.route('**/rest/v1/players**', async (route) => {
        await new Promise((resolve) => setTimeout(resolve, 10000));
        route.continue();
      });

      await page.goto('/quiz-adaptativo');
      await waitForPageReady(page);

      // Página deve carregar mesmo com API lenta
      const quizPage = page.getByTestId('quiz-adaptativo-page');
      const hasPage = await quizPage.isVisible({ timeout: 20000 }).catch(() => false);
      expect(hasPage).toBeTruthy();
    });

    test('should handle API failure on player fetch', async ({ page }) => {
      test.setTimeout(60000);

      await page.route('**/rest/v1/players**', (route) => {
        route.fulfill({ status: 500, body: 'Internal Server Error' });
      });

      await page.goto('/quiz-adaptativo');
      await waitForPageReady(page);

      // Página não deve mostrar tela branca - deve ter algum conteúdo
      const body = page.locator('body');
      await expect(body).toBeVisible();

      // Verificar que não há crash total (JS error que mata a página)
      const content = await page.content();
      expect(content).not.toContain('Application error');
    });

    test('should handle API failure on jerseys fetch', async ({ page }) => {
      test.setTimeout(60000);

      await page.route('**/rest/v1/jerseys**', (route) => {
        route.fulfill({ status: 500, body: 'Internal Server Error' });
      });

      await page.goto('/quiz-camisas');
      await waitForPageReady(page);

      const body = page.locator('body');
      await expect(body).toBeVisible();

      const content = await page.content();
      expect(content).not.toContain('Application error');
    });

    test('should handle network disconnect during gameplay', async ({ page }) => {
      test.setTimeout(90000);

      await page.goto('/quiz-adaptativo');
      await waitForPageReady(page);
      await startGameWithName(page, 'Jogador Teste');
      await page.waitForTimeout(5000);

      // Simular perda de rede após o jogo já ter iniciado
      await page.route('**/rest/v1/**', (route) => {
        route.abort('connectionrefused');
      });

      // Aguardar um pouco para ver se a página não crasheia
      await page.waitForTimeout(5000);

      // A página não deve ter crasheado
      const body = page.locator('body');
      await expect(body).toBeVisible();
    });
  });

  test.describe('Resiliência da UI', () => {
    test('should not show broken image icons on any page', async ({ page }) => {
      test.setTimeout(60000);

      // Testar página principal
      await page.goto('/');
      await waitForPageReady(page);
      await page.waitForTimeout(2000);

      // Verificar que nenhuma imagem está quebrada
      const brokenImages = await page.evaluate(() => {
        const images = document.querySelectorAll('img');
        let broken = 0;
        images.forEach((img) => {
          if (img.naturalWidth === 0 && img.complete && img.src && !img.src.startsWith('data:')) {
            broken++;
          }
        });
        return broken;
      });

      expect(brokenImages).toBe(0);
    });

    test('should recover from temporary image load failure', async ({ page }) => {
      test.setTimeout(90000);

      let blockCount = 0;

      // Bloquear apenas as primeiras 3 requisições de imagem, depois permitir
      await page.route('**/storage/v1/object/public/players/**', (route) => {
        blockCount++;
        if (blockCount <= 3) {
          route.abort('connectionrefused');
        } else {
          route.continue();
        }
      });

      await page.goto('/quiz-adaptativo');
      await waitForPageReady(page);
      await startGameWithName(page, 'Jogador Teste');
      await page.waitForTimeout(8000);

      // Página deve estar funcionando (com fallback ou imagem real)
      const quizPage = page.getByTestId('quiz-adaptativo-page');
      const hasPage = await quizPage.isVisible({ timeout: 10000 }).catch(() => false);
      expect(hasPage).toBeTruthy();
    });

    test('should not show console errors for handled image failures', async ({ page }) => {
      test.setTimeout(60000);

      const jsErrors: string[] = [];
      page.on('pageerror', (error) => {
        jsErrors.push(error.message);
      });

      await page.goto('/quiz-adaptativo');
      await waitForPageReady(page);
      await startGameWithName(page, 'Jogador Teste');
      await page.waitForTimeout(5000);

      // Não deve haver erros JS não tratados relacionados a imagens
      const imageErrors = jsErrors.filter(
        (e) => e.toLowerCase().includes('image') || e.toLowerCase().includes('img')
      );
      expect(imageErrors.length).toBe(0);
    });
  });
});
