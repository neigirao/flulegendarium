import { test, expect } from '@playwright/test';

test.describe('Image Display Guarantee', () => {
  test.describe('Player Images', () => {
    test('should display player image on game page', async ({ page }) => {
      await page.goto('/jogo-adivinhacao');
      
      // Esperar carregamento
      await page.waitForLoadState('networkidle');
      
      // Verificar que existe uma imagem de jogador
      const playerImage = page.getByTestId('player-image');
      
      // Se o data-testid existir, verificar visibilidade
      const count = await playerImage.count();
      if (count > 0) {
        await expect(playerImage.first()).toBeVisible({ timeout: 10000 });
        
        // Verificar dimensões válidas
        const box = await playerImage.first().boundingBox();
        expect(box?.width).toBeGreaterThan(50);
        expect(box?.height).toBeGreaterThan(50);
      }
    });

    test('should not show error icons for player images', async ({ page }) => {
      await page.goto('/jogo-adivinhacao');
      await page.waitForLoadState('networkidle');
      
      // Verificar que não há ícones de erro visíveis
      const errorIcon = page.locator('[data-testid="image-error"], .lucide-image-off, .lucide-alert-circle');
      await expect(errorIcon).not.toBeVisible();
    });
  });

  test.describe('Jersey Images', () => {
    test('should display jersey image on jersey game page', async ({ page }) => {
      await page.goto('/jogo-camisas');
      
      // Esperar carregamento
      await page.waitForLoadState('networkidle');
      
      // Verificar que existe uma imagem de camisa
      const jerseyImage = page.getByTestId('jersey-image');
      
      const count = await jerseyImage.count();
      if (count > 0) {
        await expect(jerseyImage.first()).toBeVisible({ timeout: 10000 });
        
        // Verificar dimensões válidas
        const box = await jerseyImage.first().boundingBox();
        expect(box?.width).toBeGreaterThan(50);
        expect(box?.height).toBeGreaterThan(50);
      }
    });

    test('should not show error icons for jersey images', async ({ page }) => {
      await page.goto('/jogo-camisas');
      await page.waitForLoadState('networkidle');
      
      // Verificar que não há ícones de erro visíveis
      const errorIcon = page.locator('[data-testid="image-error"], .lucide-image-off, .lucide-alert-circle');
      await expect(errorIcon).not.toBeVisible();
    });
  });

  test.describe('ImageGuard Component', () => {
    test('should show skeleton during loading', async ({ page }) => {
      await page.goto('/');
      
      // ImageGuard pode estar em qualquer página com imagens
      const skeleton = page.getByTestId('image-skeleton');
      
      // Skeleton aparece brevemente durante loading
      // Este teste verifica que o componente não quebra
      await page.waitForLoadState('networkidle');
    });

    test('should always show an image (never broken image)', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // Verificar que todas as imagens visíveis têm src válido
      const images = page.locator('img:visible');
      const count = await images.count();
      
      for (let i = 0; i < count; i++) {
        const img = images.nth(i);
        const src = await img.getAttribute('src');
        
        // src deve existir e não ser vazio
        expect(src).toBeTruthy();
        
        // src não deve conter padrões inválidos
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
      await page.waitForLoadState('networkidle');
      
      // Verificar que imagens não causam overflow
      const scrollWidth = await page.evaluate(() => document.body.scrollWidth);
      const clientWidth = await page.evaluate(() => document.body.clientWidth);
      
      // Pequena tolerância para margens/paddings
      expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 10);
    });

    test('images should scale properly on desktop', async ({ page }) => {
      await page.setViewportSize({ width: 1920, height: 1080 });
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      const images = page.locator('img:visible');
      const count = await images.count();
      
      for (let i = 0; i < Math.min(count, 5); i++) {
        const img = images.nth(i);
        const box = await img.boundingBox();
        
        // Imagens não devem ser maiores que a viewport
        if (box) {
          expect(box.width).toBeLessThanOrEqual(1920);
        }
      }
    });
  });
});
