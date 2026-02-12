
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    functions: {
      invoke: vi.fn(),
    },
    from: vi.fn(() => ({
      update: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ error: null })),
      })),
    })),
  },
}));

// Mock validation utilities
vi.mock('@/utils/validation', () => ({
  validateSupabaseResponse: vi.fn((schema, response) => ({
    success: true,
    data: response.data,
    errors: [],
  })),
}));

// Mock player image utilities
vi.mock('@/utils/player-image', () => ({
  getReliableImageUrl: vi.fn((player) => player.image_url || '/default.png'),
}));

// Mock logger
vi.mock('@/utils/logger', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
  },
}));

describe('playerDataService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('collectPlayerData', () => {
    it('should throw error when edge function fails', async () => {
      const { collectPlayerData } = await import('../playerDataService');
      const { supabase } = await import('@/integrations/supabase/client');
      vi.mocked(supabase.functions.invoke).mockResolvedValueOnce({
        data: null,
        error: { message: 'Edge function error' },
      });

      await expect(collectPlayerData()).rejects.toThrow('Edge function error');
    });

    it('should throw error when response format is unexpected', async () => {
      const { collectPlayerData } = await import('../playerDataService');
      const { supabase } = await import('@/integrations/supabase/client');
      vi.mocked(supabase.functions.invoke).mockResolvedValueOnce({
        data: { invalid: 'format' },
        error: null,
      });

      await expect(collectPlayerData()).rejects.toThrow('formato inesperado');
    });

    it('should throw error when data is null', async () => {
      const { collectPlayerData } = await import('../playerDataService');
      const { supabase } = await import('@/integrations/supabase/client');
      vi.mocked(supabase.functions.invoke).mockResolvedValueOnce({
        data: null,
        error: null,
      });

      await expect(collectPlayerData()).rejects.toThrow('formato inesperado');
    });

    it('should throw error when players array is missing', async () => {
      const { collectPlayerData } = await import('../playerDataService');
      const { supabase } = await import('@/integrations/supabase/client');
      vi.mocked(supabase.functions.invoke).mockResolvedValueOnce({
        data: { other: 'data' },
        error: null,
      });

      await expect(collectPlayerData()).rejects.toThrow('formato inesperado');
    });

    it('should process players with reliable image URLs', async () => {
      const { collectPlayerData } = await import('../playerDataService');
      const mockPlayers = [
        {
          id: '1',
          name: 'Fred',
          position: 'Atacante',
          image_url: 'https://example.com/fred.jpg',
          fun_fact: 'Artilheiro histórico',
          achievements: ['Campeão'],
          year_highlight: '2012',
          statistics: { gols: 199, jogos: 382 },
        },
      ];

      const { supabase } = await import('@/integrations/supabase/client');
      vi.mocked(supabase.functions.invoke).mockResolvedValueOnce({
        data: { players: mockPlayers },
        error: null,
      });

      const result = await collectPlayerData();

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Fred');
      expect(result[0].image_url).toBeDefined();
    });

    it('should handle multiple players', async () => {
      const { collectPlayerData } = await import('../playerDataService');
      const mockPlayers = [
        {
          id: '1',
          name: 'Fred',
          position: 'Atacante',
          image_url: 'https://example.com/fred.jpg',
          fun_fact: 'Artilheiro',
          achievements: ['Campeão'],
          year_highlight: '2012',
          statistics: { gols: 199, jogos: 382 },
        },
        {
          id: '2',
          name: 'Marcelo',
          position: 'Lateral',
          image_url: 'https://example.com/marcelo.jpg',
          fun_fact: 'Lateral esquerdo',
          achievements: ['Copa'],
          year_highlight: '2023',
          statistics: { gols: 10, jogos: 50 },
        },
      ];

      const { supabase } = await import('@/integrations/supabase/client');
      vi.mocked(supabase.functions.invoke).mockResolvedValueOnce({
        data: { players: mockPlayers },
        error: null,
      });

      const result = await collectPlayerData();

      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('Fred');
      expect(result[1].name).toBe('Marcelo');
    });

    it('should handle players with missing statistics', async () => {
      const { collectPlayerData } = await import('../playerDataService');
      const mockPlayers = [
        {
          id: '1',
          name: 'Player',
          position: 'Atacante',
          image_url: 'https://example.com/player.jpg',
          fun_fact: 'Info',
          achievements: [],
          year_highlight: '2020',
          statistics: {}, // Missing gols and jogos
        },
      ];

      const { supabase } = await import('@/integrations/supabase/client');
      vi.mocked(supabase.functions.invoke).mockResolvedValueOnce({
        data: { players: mockPlayers },
        error: null,
      });

      const result = await collectPlayerData();

      expect(result).toHaveLength(1);
      expect(result[0].statistics.gols).toBe(0);
      expect(result[0].statistics.jogos).toBe(0);
    });

    it('should convert player data to correct structure', async () => {
      const { collectPlayerData } = await import('../playerDataService');
      const mockPlayer = {
        id: 'test-id',
        name: 'Test Player',
        position: 'Meia',
        image_url: 'https://example.com/test.jpg',
        fun_fact: 'Test fact',
        achievements: ['Achievement 1', 'Achievement 2'],
        year_highlight: '2015',
        statistics: { gols: 50, jogos: 200 },
      };

      const { supabase } = await import('@/integrations/supabase/client');
      vi.mocked(supabase.functions.invoke).mockResolvedValueOnce({
        data: { players: [mockPlayer] },
        error: null,
      });

      const result = await collectPlayerData();

      expect(result[0]).toMatchObject({
        id: 'test-id',
        name: 'Test Player',
        position: 'Meia',
        fun_fact: 'Test fact',
        achievements: ['Achievement 1', 'Achievement 2'],
        year_highlight: '2015',
        statistics: { gols: 50, jogos: 200 },
      });
    });

    it('should call edge function with correct name', async () => {
      const { collectPlayerData } = await import('../playerDataService');
      const { supabase } = await import('@/integrations/supabase/client');
      vi.mocked(supabase.functions.invoke).mockResolvedValueOnce({
        data: { players: [] },
        error: null,
      });

      // Mock validation to handle empty array
      const { validateSupabaseResponse } = await import('@/utils/validation');
      vi.mocked(validateSupabaseResponse).mockReturnValueOnce({
        success: true,
        data: [],
        errors: undefined,
      });

      await collectPlayerData();

      expect(supabase.functions.invoke).toHaveBeenCalledWith('collect-players-data');
    });

    it('should throw error when validation fails', async () => {
      const { collectPlayerData } = await import('../playerDataService');
      const { supabase } = await import('@/integrations/supabase/client');
      vi.mocked(supabase.functions.invoke).mockResolvedValueOnce({
        data: { players: [{ invalid: 'data' }] },
        error: null,
      });

      const { validateSupabaseResponse } = await import('@/utils/validation');
      vi.mocked(validateSupabaseResponse).mockReturnValueOnce({
        success: false,
        data: null,
        errors: { player: ['Invalid player format'] },
      });

      await expect(collectPlayerData()).rejects.toThrow('formato inválido');
    });
  });

  describe('updatePlayerImage', () => {
    it('should update player image URL', async () => {
      const { updatePlayerImage } = await import('../playerDataService');
      const { supabase } = await import('@/integrations/supabase/client');
      const mockUpdate = vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ error: null })),
      }));
      vi.mocked(supabase.from).mockReturnValue({
        update: mockUpdate,
      } as unknown as ReturnType<typeof supabase.from>);

      await expect(updatePlayerImage('player-1', 'https://new-url.com/image.jpg')).resolves.not.toThrow();
    });

    it('should throw error when update fails', async () => {
      const { updatePlayerImage } = await import('../playerDataService');
      const { supabase } = await import('@/integrations/supabase/client');
      vi.mocked(supabase.from).mockReturnValue({
        update: vi.fn(() => ({
          eq: vi.fn(() => Promise.resolve({ error: new Error('Update failed') })),
        })),
      } as unknown as ReturnType<typeof supabase.from>);

      await expect(updatePlayerImage('player-1', 'https://new-url.com/image.jpg')).rejects.toThrow();
    });

    it('should call update with correct table', async () => {
      const { updatePlayerImage } = await import('../playerDataService');
      const { supabase } = await import('@/integrations/supabase/client');
      const mockEq = vi.fn(() => Promise.resolve({ error: null }));
      const mockUpdate = vi.fn(() => ({ eq: mockEq }));
      vi.mocked(supabase.from).mockReturnValue({
        update: mockUpdate,
      } as unknown as ReturnType<typeof supabase.from>);

      await updatePlayerImage('player-123', 'https://example.com/new.jpg');

      expect(supabase.from).toHaveBeenCalledWith('players');
    });

    it('should pass correct player id to eq', async () => {
      const { updatePlayerImage } = await import('../playerDataService');
      const { supabase } = await import('@/integrations/supabase/client');
      const mockEq = vi.fn(() => Promise.resolve({ error: null }));
      const mockUpdate = vi.fn(() => ({ eq: mockEq }));
      vi.mocked(supabase.from).mockReturnValue({
        update: mockUpdate,
      } as unknown as ReturnType<typeof supabase.from>);

      await updatePlayerImage('player-xyz', 'https://example.com/new.jpg');

      expect(mockEq).toHaveBeenCalledWith('id', 'player-xyz');
    });

    it('should pass correct image URL to update', async () => {
      const { updatePlayerImage } = await import('../playerDataService');
      const { supabase } = await import('@/integrations/supabase/client');
      const mockEq = vi.fn(() => Promise.resolve({ error: null }));
      const mockUpdate = vi.fn(() => ({ eq: mockEq }));
      vi.mocked(supabase.from).mockReturnValue({
        update: mockUpdate,
      } as unknown as ReturnType<typeof supabase.from>);

      const newUrl = 'https://storage.example.com/players/new-image.png';
      await updatePlayerImage('player-1', newUrl);

      expect(mockUpdate).toHaveBeenCalledWith({ image_url: newUrl });
    });
  });

  describe('Player interface', () => {
    it('should have correct structure', async () => {
      const { collectPlayerData } = await import('../playerDataService');
      const mockPlayer = {
        id: 'test',
        name: 'Test',
        position: 'Atacante',
        image_url: 'https://test.com/img.jpg',
        fun_fact: 'Fact',
        achievements: ['A1'],
        year_highlight: '2020',
        statistics: { gols: 10, jogos: 20 },
      };

      const { supabase } = await import('@/integrations/supabase/client');
      vi.mocked(supabase.functions.invoke).mockResolvedValueOnce({
        data: { players: [mockPlayer] },
        error: null,
      });

      const result = await collectPlayerData();

      expect(result[0]).toHaveProperty('id');
      expect(result[0]).toHaveProperty('name');
      expect(result[0]).toHaveProperty('position');
      expect(result[0]).toHaveProperty('image_url');
      expect(result[0]).toHaveProperty('fun_fact');
      expect(result[0]).toHaveProperty('achievements');
      expect(result[0]).toHaveProperty('year_highlight');
      expect(result[0]).toHaveProperty('statistics');
      expect(result[0].statistics).toHaveProperty('gols');
      expect(result[0].statistics).toHaveProperty('jogos');
    });
  });
});
