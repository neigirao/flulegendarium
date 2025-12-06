
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
      } as any);

      await expect(updatePlayerImage('player-1', 'https://new-url.com/image.jpg')).resolves.not.toThrow();
    });

    it('should throw error when update fails', async () => {
      const { updatePlayerImage } = await import('../playerDataService');
      const { supabase } = await import('@/integrations/supabase/client');
      vi.mocked(supabase.from).mockReturnValue({
        update: vi.fn(() => ({
          eq: vi.fn(() => Promise.resolve({ error: new Error('Update failed') })),
        })),
      } as any);

      await expect(updatePlayerImage('player-1', 'https://new-url.com/image.jpg')).rejects.toThrow();
    });
  });
});
