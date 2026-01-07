/// <reference types="@testing-library/jest-dom" />
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { JerseyImage } from '../JerseyImage';
import type { Jersey } from '@/types/jersey-game';
import type { DifficultyLevel } from '@/types/guess-game';

// Mock logger
vi.mock('@/utils/logger', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  }
}));

// Mock jersey image utils
vi.mock('@/utils/jersey-image/imageUtils', () => ({
  getReliableJerseyImageUrl: vi.fn((jersey: Jersey) => jersey.image_url || '/default-jersey.png'),
  jerseyDefaultImage: '/default-jersey.png',
}));

// Mock problem tracking
vi.mock('@/utils/jersey-image/problemTracking', () => ({
  reportJerseyImageProblem: vi.fn(),
}));

// Mock Supabase transforms
vi.mock('@/utils/image/supabaseTransforms', () => ({
  isSupabaseStorageUrl: vi.fn(() => false),
  getTransformedImageUrl: vi.fn((url: string) => url),
  getResponsiveSrcSet: vi.fn(() => undefined),
}));

// Mock IntersectionObserver
const mockIntersectionObserver = vi.fn();
mockIntersectionObserver.mockReturnValue({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
});
window.IntersectionObserver = mockIntersectionObserver;

describe('JerseyImage', () => {
  const createMockJersey = (overrides = {}): Jersey => ({
    id: 'jersey-1',
    image_url: '/jerseys/2020-home.jpg',
    years: [2020],
    type: 'home',
    manufacturer: 'Umbro',
    created_at: new Date().toISOString(),
    ...overrides,
  });

  const defaultProps = {
    onImageLoaded: vi.fn(),
    difficulty: 'medio' as DifficultyLevel,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Renderização Básica', () => {
    it('deve renderizar com dados da camisa', () => {
      const jersey = createMockJersey();
      render(<JerseyImage jersey={jersey} {...defaultProps} />);
      
      const img = screen.getByRole('img');
      expect(img).toBeInTheDocument();
      expect(img).toHaveAttribute('alt', 'Camisa histórica do Fluminense');
    });

    it('deve ter data-testid="jersey-image"', () => {
      const jersey = createMockJersey();
      render(<JerseyImage jersey={jersey} {...defaultProps} />);
      
      const img = screen.getByTestId('jersey-image');
      expect(img).toBeInTheDocument();
    });

    it('deve mostrar label do tipo de camisa', () => {
      const jersey = createMockJersey({ type: 'home' });
      render(<JerseyImage jersey={jersey} {...defaultProps} />);
      
      expect(screen.getByText('Titular')).toBeInTheDocument();
    });

    it('deve mostrar badge do fabricante', () => {
      const jersey = createMockJersey({ manufacturer: 'Adidas' });
      render(<JerseyImage jersey={jersey} {...defaultProps} />);
      
      expect(screen.getByText('Adidas')).toBeInTheDocument();
    });
  });

  describe('Tipos de Camisa', () => {
    it('deve mostrar "Titular" para type="home"', () => {
      const jersey = createMockJersey({ type: 'home' });
      render(<JerseyImage jersey={jersey} {...defaultProps} />);
      expect(screen.getByText('Titular')).toBeInTheDocument();
    });

    it('deve mostrar "Reserva" para type="away"', () => {
      const jersey = createMockJersey({ type: 'away' });
      render(<JerseyImage jersey={jersey} {...defaultProps} />);
      expect(screen.getByText('Reserva')).toBeInTheDocument();
    });

    it('deve mostrar "Terceiro" para type="third"', () => {
      const jersey = createMockJersey({ type: 'third' });
      render(<JerseyImage jersey={jersey} {...defaultProps} />);
      expect(screen.getByText('Terceiro')).toBeInTheDocument();
    });

    it('deve mostrar "Especial" para type="special"', () => {
      const jersey = createMockJersey({ type: 'special' });
      render(<JerseyImage jersey={jersey} {...defaultProps} />);
      expect(screen.getByText('Especial')).toBeInTheDocument();
    });
  });

  describe('Callbacks', () => {
    it('deve chamar onImageLoaded quando imagem carrega', async () => {
      const onImageLoaded = vi.fn();
      const jersey = createMockJersey();
      
      render(
        <JerseyImage 
          jersey={jersey} 
          onImageLoaded={onImageLoaded}
          difficulty="medio"
        />
      );
      
      const img = screen.getByTestId('jersey-image');
      fireEvent.load(img);
      
      await waitFor(() => {
        expect(onImageLoaded).toHaveBeenCalled();
      });
    });

    it('deve chamar onImageLoaded mesmo após erro (para não travar jogo)', async () => {
      const onImageLoaded = vi.fn();
      const jersey = createMockJersey({ image_url: '/broken.jpg' });
      
      render(
        <JerseyImage 
          jersey={jersey} 
          onImageLoaded={onImageLoaded}
          difficulty="medio"
        />
      );
      
      const img = screen.getByTestId('jersey-image');
      
      // Primeiro erro -> tenta fallback
      fireEvent.error(img);
      
      // Segundo erro -> chama onImageLoaded
      fireEvent.error(img);
      
      await waitFor(() => {
        expect(onImageLoaded).toHaveBeenCalled();
      });
    });
  });

  describe('Efeitos de Dificuldade', () => {
    it('deve aplicar efeitos para dificuldade "facil"', () => {
      const jersey = createMockJersey();
      render(
        <JerseyImage 
          jersey={jersey} 
          onImageLoaded={vi.fn()}
          difficulty="facil"
        />
      );
      
      const container = document.querySelector('.border-difficulty-easy');
      expect(container).toBeInTheDocument();
    });

    it('deve aplicar efeitos para dificuldade "muito_dificil"', () => {
      const jersey = createMockJersey();
      render(
        <JerseyImage 
          jersey={jersey} 
          onImageLoaded={vi.fn()}
          difficulty="muito_dificil"
        />
      );
      
      const container = document.querySelector('.border-difficulty-very-hard');
      expect(container).toBeInTheDocument();
    });
  });

  describe('Fallback e Erro', () => {
    it('deve mostrar fallback quando imagem falha', async () => {
      const jersey = createMockJersey({ image_url: '/broken.jpg' });
      
      render(<JerseyImage jersey={jersey} {...defaultProps} />);
      
      const img = screen.getByTestId('jersey-image');
      
      // Primeiro erro -> tenta fallback
      fireEvent.error(img);
      
      await waitFor(() => {
        // Ainda deve mostrar uma imagem
        expect(screen.getByRole('img')).toBeInTheDocument();
      });
    });

    it('deve mostrar estado de erro após fallback falhar', async () => {
      const jersey = createMockJersey({ image_url: '/broken.jpg' });
      
      render(<JerseyImage jersey={jersey} {...defaultProps} />);
      
      const img = screen.getByTestId('jersey-image');
      
      // Primeiro erro -> tenta fallback
      fireEvent.error(img);
      
      // Segundo erro -> mostra estado de erro
      fireEvent.error(img);
      
      await waitFor(() => {
        expect(screen.getByText('Imagem não disponível')).toBeInTheDocument();
      });
    });
  });

  describe('Texto Auxiliar', () => {
    it('deve mostrar pergunta sobre o ano', () => {
      const jersey = createMockJersey();
      render(<JerseyImage jersey={jersey} {...defaultProps} />);
      
      expect(screen.getByText('De que ano é essa camisa?')).toBeInTheDocument();
    });

    it('deve mostrar dica sobre pontuação', () => {
      const jersey = createMockJersey();
      render(<JerseyImage jersey={jersey} {...defaultProps} />);
      
      expect(screen.getByText('Digite o ano exato para mais pontos!')).toBeInTheDocument();
    });
  });
});
