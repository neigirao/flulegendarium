import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { challengeService } from '../challengeService';
import { supabase } from '@/integrations/supabase/client';

// Mock do logger para não poluir os testes
vi.mock('@/utils/logger', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

describe('challengeService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createChallenge', () => {
    it('should create challenge and return id on success', async () => {
      const mockId = 'challenge-123';
      const mockFrom = vi.fn().mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { id: mockId },
              error: null,
            }),
          }),
        }),
      });
      (supabase.from as Mock) = mockFrom;

      const result = await challengeService.createChallenge({
        challengerName: 'Test User',
        challengerScore: 100,
        gameMode: 'adaptive',
        challengeLink: 'abc123',
      });

      expect(result).toBe(mockId);
      expect(mockFrom).toHaveBeenCalledWith('user_challenges');
    });

    it('should return null on database error', async () => {
      const mockFrom = vi.fn().mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: { message: 'Database error' },
            }),
          }),
        }),
      });
      (supabase.from as Mock) = mockFrom;

      const result = await challengeService.createChallenge({
        challengerName: 'Test User',
        challengerScore: 100,
        gameMode: 'adaptive',
        challengeLink: 'abc123',
      });

      expect(result).toBeNull();
    });

    it('should handle missing challengerId', async () => {
      const mockId = 'challenge-456';
      const mockInsert = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { id: mockId },
            error: null,
          }),
        }),
      });
      const mockFrom = vi.fn().mockReturnValue({
        insert: mockInsert,
      });
      (supabase.from as Mock) = mockFrom;

      const result = await challengeService.createChallenge({
        challengerName: 'Guest User',
        challengerScore: 50,
        gameMode: 'decade',
        challengeLink: 'xyz789',
      });

      expect(result).toBe(mockId);
      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          challenger_id: null,
          challenger_name: 'Guest User',
          challenger_score: 50,
          game_mode: 'decade',
          challenge_link: 'xyz789',
          status: 'pending',
        })
      );
    });

    it('should include difficultyLevel when provided', async () => {
      const mockInsert = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { id: 'challenge-789' },
            error: null,
          }),
        }),
      });
      const mockFrom = vi.fn().mockReturnValue({
        insert: mockInsert,
      });
      (supabase.from as Mock) = mockFrom;

      await challengeService.createChallenge({
        challengerId: 'user-123',
        challengerName: 'Pro User',
        challengerScore: 200,
        gameMode: 'adaptive',
        difficultyLevel: 'dificil',
        challengeLink: 'link123',
      });

      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          challenger_id: 'user-123',
          difficulty_level: 'dificil',
        })
      );
    });

    it('should return null on exception', async () => {
      const mockFrom = vi.fn().mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockRejectedValue(new Error('Network error')),
          }),
        }),
      });
      (supabase.from as Mock) = mockFrom;

      const result = await challengeService.createChallenge({
        challengerName: 'Test',
        challengerScore: 10,
        gameMode: 'adaptive',
        challengeLink: 'test',
      });

      expect(result).toBeNull();
    });
  });

  describe('acceptChallenge', () => {
    it('should update challenge with challenged user and return true', async () => {
      const mockUpdate = vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null }),
      });
      const mockFrom = vi.fn().mockReturnValue({
        update: mockUpdate,
      });
      (supabase.from as Mock) = mockFrom;

      const result = await challengeService.acceptChallenge({
        challengeId: 'challenge-123',
        challengedId: 'user-456',
        challengedName: 'Challenged User',
      });

      expect(result).toBe(true);
      expect(mockUpdate).toHaveBeenCalledWith({
        challenged_id: 'user-456',
        challenged_name: 'Challenged User',
      });
    });

    it('should return false on database error', async () => {
      const mockFrom = vi.fn().mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            error: { message: 'Update failed' },
          }),
        }),
      });
      (supabase.from as Mock) = mockFrom;

      const result = await challengeService.acceptChallenge({
        challengeId: 'challenge-123',
        challengedId: 'user-456',
        challengedName: 'User',
      });

      expect(result).toBe(false);
    });

    it('should return false on exception', async () => {
      const mockFrom = vi.fn().mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockRejectedValue(new Error('Network error')),
        }),
      });
      (supabase.from as Mock) = mockFrom;

      const result = await challengeService.acceptChallenge({
        challengeId: 'challenge-123',
        challengedId: 'user-456',
        challengedName: 'User',
      });

      expect(result).toBe(false);
    });
  });

  describe('completeChallenge', () => {
    it('should find challenge by link and update with score', async () => {
      const mockEq = vi.fn().mockResolvedValue({ error: null });
      const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq });
      const mockLimit = vi.fn().mockResolvedValue({
        data: [{ id: 'challenge-123' }],
        error: null,
      });
      const mockEqPending = vi.fn().mockReturnValue({ limit: mockLimit });
      const mockEqLink = vi.fn().mockReturnValue({ eq: mockEqPending });
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEqLink });

      let callCount = 0;
      const mockFrom = vi.fn().mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          return { select: mockSelect };
        }
        return { update: mockUpdate };
      });
      (supabase.from as Mock) = mockFrom;

      const result = await challengeService.completeChallenge({
        challengeLink: 'abc123',
        challengedId: 'user-789',
        challengedName: 'Winner',
        challengedScore: 150,
      });

      expect(result).toBe(true);
      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          challenged_id: 'user-789',
          challenged_name: 'Winner',
          challenged_score: 150,
          status: 'completed',
        })
      );
    });

    it('should return false if challenge not found', async () => {
      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue({
                data: [],
                error: null,
              }),
            }),
          }),
        }),
      });
      (supabase.from as Mock) = mockFrom;

      const result = await challengeService.completeChallenge({
        challengeLink: 'nonexistent',
        challengedName: 'User',
        challengedScore: 100,
      });

      expect(result).toBe(false);
    });

    it('should return false on find error', async () => {
      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue({
                data: null,
                error: { message: 'Find error' },
              }),
            }),
          }),
        }),
      });
      (supabase.from as Mock) = mockFrom;

      const result = await challengeService.completeChallenge({
        challengeLink: 'abc123',
        challengedName: 'User',
        challengedScore: 100,
      });

      expect(result).toBe(false);
    });

    it('should return false on update error', async () => {
      const mockFrom = vi.fn()
        .mockReturnValueOnce({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                limit: vi.fn().mockResolvedValue({
                  data: [{ id: 'challenge-123' }],
                  error: null,
                }),
              }),
            }),
          }),
        })
        .mockReturnValueOnce({
          update: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({
              error: { message: 'Update error' },
            }),
          }),
        });
      (supabase.from as Mock) = mockFrom;

      const result = await challengeService.completeChallenge({
        challengeLink: 'abc123',
        challengedName: 'User',
        challengedScore: 100,
      });

      expect(result).toBe(false);
    });

    it('should handle missing challengedId', async () => {
      const mockUpdate = vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null }),
      });

      const mockFrom = vi.fn()
        .mockReturnValueOnce({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                limit: vi.fn().mockResolvedValue({
                  data: [{ id: 'challenge-123' }],
                  error: null,
                }),
              }),
            }),
          }),
        })
        .mockReturnValueOnce({ update: mockUpdate });
      (supabase.from as Mock) = mockFrom;

      await challengeService.completeChallenge({
        challengeLink: 'abc123',
        challengedName: 'Guest',
        challengedScore: 50,
      });

      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          challenged_id: null,
        })
      );
    });

    it('should return false on exception', async () => {
      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              limit: vi.fn().mockRejectedValue(new Error('Network error')),
            }),
          }),
        }),
      });
      (supabase.from as Mock) = mockFrom;

      const result = await challengeService.completeChallenge({
        challengeLink: 'abc123',
        challengedName: 'User',
        challengedScore: 100,
      });

      expect(result).toBe(false);
    });
  });

  describe('findChallengeByLink', () => {
    it('should return challenge id when found', async () => {
      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue({
              data: [{ id: 'challenge-found' }],
              error: null,
            }),
          }),
        }),
      });
      (supabase.from as Mock) = mockFrom;

      const result = await challengeService.findChallengeByLink('valid-link');

      expect(result).toBe('challenge-found');
    });

    it('should return null if challenge not found', async () => {
      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue({
              data: [],
              error: null,
            }),
          }),
        }),
      });
      (supabase.from as Mock) = mockFrom;

      const result = await challengeService.findChallengeByLink('nonexistent');

      expect(result).toBeNull();
    });

    it('should return null on database error', async () => {
      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue({
              data: null,
              error: { message: 'Query error' },
            }),
          }),
        }),
      });
      (supabase.from as Mock) = mockFrom;

      const result = await challengeService.findChallengeByLink('some-link');

      expect(result).toBeNull();
    });

    it('should return null on exception', async () => {
      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            limit: vi.fn().mockRejectedValue(new Error('Network error')),
          }),
        }),
      });
      (supabase.from as Mock) = mockFrom;

      const result = await challengeService.findChallengeByLink('some-link');

      expect(result).toBeNull();
    });
  });
});
