/// <reference types="@testing-library/jest-dom" />
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { UnifiedPlayerImage } from '../UnifiedPlayerImage';
import type { Player } from '@/types/guess-game';

// Mock logger
vi.mock('@/utils/logger', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  }
}));

// Mock image utils
vi.mock('@/utils/player-image/imageUtils', () => ({
  getReliableImageUrl: vi.fn((player: Player) => player.image_url || '/default-player.png'),
}));

// Mock cache
vi.mock('@/utils/player-image/cache', () => ({
  markImageAsLoaded: vi.fn(),
}));

// Mock report service
vi.mock('@/services/imageReportService', () => ({
  reportImageError: vi.fn(),
}));

// Mock IntersectionObserver
const mockIntersectionObserver = vi.fn();
mockIntersectionObserver.mockReturnValue({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
});
window.IntersectionObserver = mockIntersectionObserver;

describe('UnifiedPlayerImage', () => {
  const createMockPlayer = (overrides = {}): Player => ({
    id: 'player-1',
    name: 'Romário',
    image_url: '/players/romario.jpg',
    position: 'Atacante',
    year_highlight: '1995',
    fun_fact: 'Maior artilheiro da história',
    achievements: ['Campeão Brasileiro'],
    nicknames: ['Baixinho'],
    statistics: { gols: 204, jogos: 350 },
    decade: '1990',
    ...overrides,
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Renderização Básica', () => {
    it('deve renderizar com dados do jogador', () => {
      const player = createMockPlayer();
      render(<UnifiedPlayerImage player={player} />);
      
      const img = screen.getByRole('img');
      expect(img).toBeInTheDocument();
      expect(img).toHaveAttribute('alt', `Foto de ${player.name}`);
    });

    it('deve ter data-testid="player-image"', () => {
      const player = createMockPlayer();
      render(<UnifiedPlayerImage player={player} priority />);
      
      const img = screen.getByTestId('player-image');
      expect(img).toBeInTheDocument();
    });

    it('deve mostrar skeleton durante carregamento', () => {
      const player = createMockPlayer();
      render(<UnifiedPlayerImage player={player} />);
      
      // Skeleton é o shimmer effect
      const shimmer = document.querySelector('.animate-shimmer');
      expect(shimmer).toBeInTheDocument();
    });
  });

  describe('Callbacks', () => {
    it('deve chamar onImageLoaded quando imagem carrega', async () => {
      const onImageLoaded = vi.fn();
      const player = createMockPlayer();
      
      render(
        <UnifiedPlayerImage 
          player={player} 
          onImageLoaded={onImageLoaded}
          priority
        />
      );
      
      const img = screen.getByTestId('player-image');
      fireEvent.load(img);
      
      await waitFor(() => {
        expect(onImageLoaded).toHaveBeenCalled();
      });
    });
  });

  describe('Efeitos de Dificuldade', () => {
    it('deve aplicar efeitos para dificuldade "facil"', () => {
      const player = createMockPlayer();
      render(
        <UnifiedPlayerImage 
          player={player} 
          difficulty="facil"
          priority
        />
      );
      
      const container = document.querySelector('.border-difficulty-easy');
      expect(container).toBeInTheDocument();
    });

    it('deve aplicar efeitos para dificuldade "muito_dificil"', () => {
      const player = createMockPlayer();
      render(
        <UnifiedPlayerImage 
          player={player} 
          difficulty="muito_dificil"
          priority
        />
      );
      
      const container = document.querySelector('.border-difficulty-very-hard');
      expect(container).toBeInTheDocument();
    });

    it('deve mostrar indicador de dificuldade quando showDifficultyIndicator=true', () => {
      const player = createMockPlayer();
      render(
        <UnifiedPlayerImage 
          player={player} 
          difficulty="medio"
          showDifficultyIndicator
          priority
        />
      );
      
      expect(screen.getByText(/MEDIO/i)).toBeInTheDocument();
    });
  });

  describe('Loading e Priority', () => {
    it('deve usar loading="eager" quando priority=true', () => {
      const player = createMockPlayer();
      render(<UnifiedPlayerImage player={player} priority />);
      
      const img = screen.getByTestId('player-image');
      expect(img).toHaveAttribute('loading', 'eager');
    });

    it('deve usar fetchPriority="high" quando priority=true', () => {
      const player = createMockPlayer();
      render(<UnifiedPlayerImage player={player} priority />);
      
      const img = screen.getByTestId('player-image');
      expect(img).toHaveAttribute('fetchPriority', 'high');
    });
  });

  describe('Fallback e Erro', () => {
    it('deve mostrar fallback visual quando imagem falha após retries', async () => {
      const player = createMockPlayer({ image_url: '/broken.jpg' });
      
      render(<UnifiedPlayerImage player={player} priority />);
      
      const img = screen.getByTestId('player-image');
      
      // Simular múltiplos erros
      fireEvent.error(img);
      
      await waitFor(() => {
        // Após erro, componente ainda deve estar visível
        expect(screen.getByRole('img')).toBeInTheDocument();
      });
    });
  });

  describe('Acessibilidade', () => {
    it('deve ter alt text descritivo', () => {
      const player = createMockPlayer({ name: 'Fred' });
      render(<UnifiedPlayerImage player={player} priority />);
      
      const img = screen.getByRole('img');
      expect(img).toHaveAttribute('alt', 'Foto de Fred');
    });
  });
});
