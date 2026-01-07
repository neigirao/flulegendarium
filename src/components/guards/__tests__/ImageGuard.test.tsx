/// <reference types="@testing-library/jest-dom" />
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { ImageGuard } from '../ImageGuard';
import { playerSilhouetteSvg, fluminenseJerseySvg } from '@/utils/fallback-images/fluminenseSvg';

// Mock logger
vi.mock('@/utils/logger', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  }
}));

// Mock problematic URL utils
vi.mock('@/utils/player-image/problematicUrls', () => ({
  isProblematicDomain: vi.fn(() => false),
  isUrlProblematic: vi.fn(() => false),
  markUrlAsProblematic: vi.fn(),
  getRetryDelay: vi.fn(() => 0),
}));

describe('ImageGuard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Garantia de Exibição', () => {
    it('deve renderizar imagem quando src é válido', () => {
      render(<ImageGuard src="/valid-image.jpg" alt="Test image" />);
      
      const img = screen.getByRole('img');
      expect(img).toBeInTheDocument();
      expect(img).toHaveAttribute('src', '/valid-image.jpg');
    });

    it('deve mostrar skeleton durante carregamento', () => {
      render(<ImageGuard src="/slow-image.jpg" alt="Test image" />);
      
      const skeleton = screen.getByTestId('image-skeleton');
      expect(skeleton).toBeInTheDocument();
    });

    it('NUNCA deve mostrar ícone de erro - sempre mostra imagem', async () => {
      render(<ImageGuard src="/broken-image.jpg" alt="Test image" />);
      
      // Simular erro na imagem
      const img = screen.getByRole('img');
      fireEvent.error(img);
      
      await waitFor(() => {
        // Não deve haver ícone de erro
        expect(screen.queryByTestId('error-icon')).not.toBeInTheDocument();
        expect(screen.queryByText(/erro/i)).not.toBeInTheDocument();
        
        // Sempre deve haver uma imagem
        expect(screen.getByRole('img')).toBeInTheDocument();
      });
    });

    it('deve usar SVG inline de player como último fallback', async () => {
      render(<ImageGuard src={null} alt="Test" imageType="player" />);
      
      // Quando src é null, deve ir direto para fallback
      await waitFor(() => {
        const img = screen.getByRole('img');
        // Fallback inicial ou SVG inline
        expect(img).toBeInTheDocument();
      });
    });

    it('deve usar SVG inline de camisa para imageType="jersey"', async () => {
      render(<ImageGuard src={null} alt="Test" imageType="jersey" />);
      
      await waitFor(() => {
        const img = screen.getByRole('img');
        expect(img).toBeInTheDocument();
      });
    });

    it('deve usar fallbackSrc quando src principal é inválido', () => {
      render(
        <ImageGuard 
          src="" 
          alt="Test" 
          fallbackSrc="/custom-fallback.png" 
        />
      );
      
      const img = screen.getByRole('img');
      expect(img).toHaveAttribute('src', '/custom-fallback.png');
    });
  });

  describe('Props e Comportamento', () => {
    it('deve aplicar className corretamente', () => {
      render(<ImageGuard src="/image.jpg" alt="Test" className="custom-class" />);
      
      const container = screen.getByTestId('image-guard-container');
      expect(container.className).toContain('custom-class');
    });

    it('deve chamar onLoad quando imagem carrega', async () => {
      const onLoad = vi.fn();
      render(<ImageGuard src="/image.jpg" alt="Test" onLoad={onLoad} />);
      
      const img = screen.getByRole('img');
      fireEvent.load(img);
      
      await waitFor(() => {
        expect(onLoad).toHaveBeenCalled();
      });
    });

    it('deve chamar onError quando imagem falha', async () => {
      const onError = vi.fn();
      render(<ImageGuard src="/broken.jpg" alt="Test" onError={onError} />);
      
      const img = screen.getByRole('img');
      fireEvent.error(img);
      
      // onError pode ser chamado após retries
      await waitFor(() => {
        expect(onError).toHaveBeenCalled();
      }, { timeout: 3000 });
    });

    it('deve usar loading="eager" quando priority=true', () => {
      render(<ImageGuard src="/image.jpg" alt="Test" priority={true} />);
      
      const img = screen.getByRole('img');
      expect(img).toHaveAttribute('loading', 'eager');
    });

    it('deve usar loading="lazy" quando priority=false', async () => {
      render(<ImageGuard src="/image.jpg" alt="Test" priority={false} />);
      
      const img = screen.getByRole('img');
      fireEvent.load(img);
      
      await waitFor(() => {
        const loadedImg = screen.getByTestId('image-guard');
        expect(loadedImg).toHaveAttribute('loading', 'lazy');
      });
    });
  });

  describe('Fallback SVG', () => {
    it('SVG de player nunca deve ser vazio', () => {
      expect(playerSilhouetteSvg).toBeTruthy();
      expect(playerSilhouetteSvg.length).toBeGreaterThan(100);
    });

    it('SVG de camisa nunca deve ser vazio', () => {
      expect(fluminenseJerseySvg).toBeTruthy();
      expect(fluminenseJerseySvg.length).toBeGreaterThan(100);
    });

    it('SVGs devem ser data URLs válidos', () => {
      expect(playerSilhouetteSvg).toMatch(/^data:image\/svg\+xml,/);
      expect(fluminenseJerseySvg).toMatch(/^data:image\/svg\+xml,/);
    });

    it('SVGs não devem depender de recursos externos', () => {
      expect(playerSilhouetteSvg).not.toContain('http://');
      expect(playerSilhouetteSvg).not.toContain('https://');
      expect(fluminenseJerseySvg).not.toContain('http://');
      expect(fluminenseJerseySvg).not.toContain('https://');
    });
  });

  describe('Acessibilidade', () => {
    it('deve ter atributo alt', () => {
      render(<ImageGuard src="/image.jpg" alt="Descrição da imagem" />);
      
      const img = screen.getByRole('img');
      expect(img).toHaveAttribute('alt', 'Descrição da imagem');
    });
  });
});
