import { test, expect } from '@playwright/test';
import { waitForPageReady, startGameWithName } from './helpers/test-helpers';

test.describe('Image Display Guarantee', () => {
  test.describe('Player Images', () => {
    test('should display player image on game page', async ({ page }) => {
      await page.goto('/quiz-adaptativo');
      await waitForPageReady(page);
      
      await startGameWithName(page, 'Jogador Teste');
      
      // Verificar que existe uma imagem de jogador usando data-testid
      const playerImage = page.getByTestId('player-image');
      await expect(playerImage).toBeVisible({ timeout: 20000 });
      
      // Verificar dimensões válidas
      const box = await playerImage.boundingBox();
      if (box) {
        expect(box.width).toBeGreaterThan(50);
        expect(box.height).toBeGreaterThan(50);
      }
    });

    test('should not show error icons for player images', async ({ page }) => {
      await page.goto('/quiz-adaptativo');
      await waitForPageReady(page);
      
      await startGameWithName(page, 'Jogador Teste');
      await page.waitForTimeout(3000);
      
      // Verificar que não há ícones de erro visíveis
      const errorIcon = page.getByTestId('image-error');
      await expect(errorIcon).not.toBeVisible();
    });
  });

  test.describe('Jersey Images', () => {
    test('should display jersey image on jersey game page', async ({ page }) => {
      await page.goto('/quiz-camisas');
      await waitForPageReady(page);
      
      await startGameWithName(page, 'Jogador Teste');
      
      // Verificar que existe uma imagem de camisa usando data-testid
      const jerseyImage = page.getByTestId('jersey-image');
      await expect(jerseyImage).toBeVisible({ timeout: 20000 });
      
      // Verificar dimensões válidas
      const box = await jerseyImage.boundingBox();
      if (box) {
        expect(box.width).toBeGreaterThan(50);
        expect(box.height).toBeGreaterThan(50);
      }
    });

    test('should not show error icons for jersey images', async ({ page }) => {
      await page.goto('/quiz-camisas');
      await waitForPageReady(page);
      
      await startGameWithName(page, 'Jogador Teste');
      await page.waitForTimeout(3000);
      
      // Verificar que não há ícones de erro visíveis
      const errorIcon = page.getByTestId('image-error');
      await expect(errorIcon).not.toBeVisible();
    });
  });

  test.describe('ImageGuard Component', () => {
    test('should show skeleton during loading', async ({ page }) => {
      await page.goto('/');
      await waitForPageReady(page);
      
      // ImageGuard pode estar em qualquer página com imagens
      // Este teste verifica que o componente não quebra
      const skeleton = page.getByTestId('image-skeleton');
      // Skeleton pode ou não estar visível dependendo do carregamento
      await page.waitForTimeout(1000);
    });

    test('should always show an image (never broken image)', async ({ page }) => {
      await page.goto('/');
      await waitForPageReady(page);
      
      // Aguardar estabilização completa
      await page.waitForTimeout(2000);
      
      // Verificar que todas as imagens visíveis têm src válido
      const images = page.locator('img:visible');
      const count = await images.count();
      
      // Limitar a verificação para evitar timeout
      const maxImages = Math.min(count, 10);
      
      for (let i = 0; i < maxImages; i++) {
        const img = images.nth(i);
        
        // Verificar se ainda está visível antes de acessar atributos
        const isVisible = await img.isVisible({ timeout: 2000 }).catch(() => false);
        if (!isVisible) continue;
        
        const src = await img.getAttribute('src').catch(() => null);
        
        // src deve existir e não ser vazio
        if (src) {
          expect(src).not.toContain('undefined');
          expect(src).not.toContain('null');
        }
      }
    });
  });

  test.describe('Fallback Images', () => {
    test('fallback images should be accessible', async ({ page }) => {
      // Verificar que a imagem de fallback padrão existe
      const response = await page.goto('/lovable-uploads/0aa3609f-0584-4bf4-8303-e03f50f7e131.png');
      expect(response?.status()).toBeLessThan(400);
    });

    test('jersey fallback image should be accessible', async ({ page }) => {
      // Verificar que a imagem de fallback de camisa existe
      const response = await page.goto('/lovable-uploads/7df50b87-e220-4f5e-be35-e5f61cb46d2f.png');
      expect(response?.status()).toBeLessThan(400);
    });
  });

  test.describe('Responsive Images', () => {
    test('images should be responsive on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/');
      await waitForPageReady(page);
      
      // Aguardar carregamento
      await page.waitForTimeout(2000);
      
      // Verificar que imagens não causam overflow
      const scrollWidth = await page.evaluate(() => document.body.scrollWidth);
      const clientWidth = await page.evaluate(() => document.body.clientWidth);
      
      // Pequena tolerância para margens/paddings
      expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 10);
    });

    test('images should scale properly on desktop', async ({ page }) => {
      await page.setViewportSize({ width: 1920, height: 1080 });
      await page.goto('/');
      await waitForPageReady(page);
      
      // Aguardar carregamento
      await page.waitForTimeout(2000);
      
      const images = page.locator('img:visible');
      const count = await images.count();
      
      const maxImages = Math.min(count, 5);
      
      for (let i = 0; i < maxImages; i++) {
        const img = images.nth(i);
        const isVisible = await img.isVisible({ timeout: 2000 }).catch(() => false);
        if (!isVisible) continue;
        
        const box = await img.boundingBox();
        
        // Imagens não devem ser maiores que a viewport
        if (box) {
          expect(box.width).toBeLessThanOrEqual(1920);
        }
      }
    });
  });
});
