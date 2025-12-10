import { describe, it, expect, vi, beforeEach, afterEach, Mock } from 'vitest';
import { reportsService } from '../reportsService';
import { supabase } from '@/integrations/supabase/client';

describe('reportsService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-06-15T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('getUserEngagementReport', () => {
    it('should return engagement data for specified days', async () => {
      const mockGameHistory = [
        { user_id: 'user-1', created_at: '2024-06-14T10:00:00Z', game_duration: 300 },
        { user_id: 'user-1', created_at: '2024-06-14T15:00:00Z', game_duration: 200 },
        { user_id: 'user-2', created_at: '2024-06-14T12:00:00Z', game_duration: 180 },
      ];

      const mockProfiles = [
        { id: 'user-1', created_at: '2024-06-14T09:00:00Z' },
      ];

      let callCount = 0;
      const mockFrom = vi.fn().mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          return {
            select: vi.fn().mockReturnValue({
              gte: vi.fn().mockReturnValue({
                order: vi.fn().mockResolvedValue({ data: mockGameHistory, error: null }),
              }),
            }),
          };
        }
        return {
          select: vi.fn().mockReturnValue({
            gte: vi.fn().mockResolvedValue({ data: mockProfiles, error: null }),
          }),
        };
      });
      (supabase.from as Mock) = mockFrom;

      const result = await reportsService.getUserEngagementReport(7);

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(7);
      
      const june14Data = result.find(d => d.date === '2024-06-14');
      expect(june14Data).toBeDefined();
      expect(june14Data?.daily_active_users).toBe(2);
      expect(june14Data?.new_users).toBe(1);
    });

    it('should return empty array on error', async () => {
      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          gte: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({ data: null, error: { message: 'Error' } }),
          }),
        }),
      });
      (supabase.from as Mock) = mockFrom;

      const result = await reportsService.getUserEngagementReport(7);

      expect(result).toEqual([]);
    });

    it('should calculate returning users correctly', async () => {
      // User-1 played on day 1 and day 2 (returning on day 2)
      const mockGameHistory = [
        { user_id: 'user-1', created_at: '2024-06-13T10:00:00Z', game_duration: 300 },
        { user_id: 'user-1', created_at: '2024-06-14T10:00:00Z', game_duration: 200 },
      ];

      const mockFrom = vi.fn()
        .mockReturnValueOnce({
          select: vi.fn().mockReturnValue({
            gte: vi.fn().mockReturnValue({
              order: vi.fn().mockResolvedValue({ data: mockGameHistory, error: null }),
            }),
          }),
        })
        .mockReturnValueOnce({
          select: vi.fn().mockReturnValue({
            gte: vi.fn().mockResolvedValue({ data: [], error: null }),
          }),
        });
      (supabase.from as Mock) = mockFrom;

      const result = await reportsService.getUserEngagementReport(7);

      const june14Data = result.find(d => d.date === '2024-06-14');
      expect(june14Data?.returning_users).toBe(1);
    });

    it('should calculate bounce rate from short sessions', async () => {
      const mockGameHistory = [
        { user_id: 'user-1', created_at: '2024-06-14T10:00:00Z', game_duration: 30 }, // short
        { user_id: 'user-2', created_at: '2024-06-14T12:00:00Z', game_duration: 300 }, // normal
      ];

      const mockFrom = vi.fn()
        .mockReturnValueOnce({
          select: vi.fn().mockReturnValue({
            gte: vi.fn().mockReturnValue({
              order: vi.fn().mockResolvedValue({ data: mockGameHistory, error: null }),
            }),
          }),
        })
        .mockReturnValueOnce({
          select: vi.fn().mockReturnValue({
            gte: vi.fn().mockResolvedValue({ data: [], error: null }),
          }),
        });
      (supabase.from as Mock) = mockFrom;

      const result = await reportsService.getUserEngagementReport(7);

      const june14Data = result.find(d => d.date === '2024-06-14');
      expect(june14Data?.bounce_rate).toBe(50); // 1 of 2 sessions was short
    });

    it('should handle exception gracefully', async () => {
      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          gte: vi.fn().mockReturnValue({
            order: vi.fn().mockRejectedValue(new Error('Network error')),
          }),
        }),
      });
      (supabase.from as Mock) = mockFrom;

      const result = await reportsService.getUserEngagementReport(7);

      expect(result).toEqual([]);
    });
  });

  describe('getNPSReport', () => {
    it('should calculate NPS from feedback ratings', async () => {
      const mockFeedback = [
        { rating: 5, created_at: '2024-06-14T10:00:00Z' }, // Promoter (converted to 9)
        { rating: 5, created_at: '2024-06-14T11:00:00Z' }, // Promoter
        { rating: 3, created_at: '2024-06-14T12:00:00Z' }, // Passive (converted to 4.5)
        { rating: 1, created_at: '2024-06-14T13:00:00Z' }, // Detractor (converted to 0)
      ];

      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          gte: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({ data: mockFeedback, error: null }),
          }),
        }),
      });
      (supabase.from as Mock) = mockFrom;

      const result = await reportsService.getNPSReport(7);

      const june14Data = result.find(d => d.date === '2024-06-14');
      expect(june14Data).toBeDefined();
      expect(june14Data?.total_responses).toBe(4);
      expect(june14Data?.promoters).toBeGreaterThanOrEqual(0);
    });

    it('should return empty array on error', async () => {
      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          gte: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({ data: null, error: { message: 'Error' } }),
          }),
        }),
      });
      (supabase.from as Mock) = mockFrom;

      const result = await reportsService.getNPSReport(7);

      expect(result).toEqual([]);
    });

    it('should handle no feedback data', async () => {
      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          gte: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({ data: [], error: null }),
          }),
        }),
      });
      (supabase.from as Mock) = mockFrom;

      const result = await reportsService.getNPSReport(7);

      expect(Array.isArray(result)).toBe(true);
      result.forEach(day => {
        expect(day.nps_score).toBe(0);
        expect(day.total_responses).toBe(0);
      });
    });

    it('should handle exception gracefully', async () => {
      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          gte: vi.fn().mockReturnValue({
            order: vi.fn().mockRejectedValue(new Error('Timeout')),
          }),
        }),
      });
      (supabase.from as Mock) = mockFrom;

      const result = await reportsService.getNPSReport(7);

      expect(result).toEqual([]);
    });
  });

  describe('getErrorMetricsReport', () => {
    it('should categorize errors by type', async () => {
      const mockBugs = [
        { id: '1', description: 'Problema de carregamento de página', created_at: '2024-06-14T10:00:00Z' },
        { id: '2', description: 'Imagem não aparece', created_at: '2024-06-14T11:00:00Z' },
        { id: '3', description: 'Erro de login', created_at: '2024-06-14T12:00:00Z' },
        { id: '4', description: 'Pontuação incorreta', created_at: '2024-06-14T13:00:00Z' },
        { id: '5', description: 'Bug aleatório', created_at: '2024-06-14T14:00:00Z' },
      ];

      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          gte: vi.fn().mockResolvedValue({ data: mockBugs, error: null }),
        }),
      });
      (supabase.from as Mock) = mockFrom;

      const result = await reportsService.getErrorMetricsReport(7);

      const june14Data = result.find(d => d.date === '2024-06-14');
      expect(june14Data?.total_errors).toBe(5);
      expect(june14Data?.top_errors.length).toBeGreaterThan(0);
      
      const errorTypes = june14Data?.top_errors.map(e => e.error_type);
      expect(errorTypes).toContain('Carregamento');
      expect(errorTypes).toContain('Imagens');
    });

    it('should return empty array on error', async () => {
      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          gte: vi.fn().mockResolvedValue({ data: null, error: { message: 'Error' } }),
        }),
      });
      (supabase.from as Mock) = mockFrom;

      const result = await reportsService.getErrorMetricsReport(7);

      expect(result).toEqual([]);
    });

    it('should handle no bugs data', async () => {
      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          gte: vi.fn().mockResolvedValue({ data: [], error: null }),
        }),
      });
      (supabase.from as Mock) = mockFrom;

      const result = await reportsService.getErrorMetricsReport(7);

      expect(Array.isArray(result)).toBe(true);
      result.forEach(day => {
        expect(day.total_errors).toBe(0);
      });
    });

    it('should handle exception gracefully', async () => {
      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          gte: vi.fn().mockRejectedValue(new Error('Database error')),
        }),
      });
      (supabase.from as Mock) = mockFrom;

      const result = await reportsService.getErrorMetricsReport(7);

      expect(result).toEqual([]);
    });
  });

  describe('getSupportTicketsReport', () => {
    it('should process support tickets data', async () => {
      const mockTickets = [
        { id: '1', status: 'resolved', priority: 'high', created_at: '2024-06-14T10:00:00Z' },
        { id: '2', status: 'pending', priority: 'medium', created_at: '2024-06-14T11:00:00Z' },
        { id: '3', status: 'pending', priority: 'low', created_at: '2024-06-14T12:00:00Z' },
      ];

      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          gte: vi.fn().mockResolvedValue({ data: mockTickets, error: null }),
        }),
      });
      (supabase.from as Mock) = mockFrom;

      const result = await reportsService.getSupportTicketsReport(30);

      const june14Data = result.find(d => d.date === '2024-06-14');
      expect(june14Data?.new_tickets).toBe(3);
      expect(june14Data?.resolved_tickets).toBe(1);
      expect(june14Data?.pending_tickets).toBe(2);
      expect(june14Data?.priority_breakdown.high).toBe(1);
      expect(june14Data?.priority_breakdown.medium).toBe(1);
      expect(june14Data?.priority_breakdown.low).toBe(1);
    });

    it('should return empty array on error', async () => {
      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          gte: vi.fn().mockResolvedValue({ data: null, error: { message: 'Error' } }),
        }),
      });
      (supabase.from as Mock) = mockFrom;

      const result = await reportsService.getSupportTicketsReport(30);

      expect(result).toEqual([]);
    });

    it('should handle no tickets', async () => {
      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          gte: vi.fn().mockResolvedValue({ data: [], error: null }),
        }),
      });
      (supabase.from as Mock) = mockFrom;

      const result = await reportsService.getSupportTicketsReport(30);

      expect(Array.isArray(result)).toBe(true);
      result.forEach(day => {
        expect(day.new_tickets).toBe(0);
      });
    });

    it('should handle exception gracefully', async () => {
      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          gte: vi.fn().mockRejectedValue(new Error('Query failed')),
        }),
      });
      (supabase.from as Mock) = mockFrom;

      const result = await reportsService.getSupportTicketsReport(30);

      expect(result).toEqual([]);
    });
  });

  describe('getFeedbackReport', () => {
    it('should process feedback data with categories', async () => {
      const mockFeedback = [
        { id: '1', rating: 5, category: 'gameplay', created_at: '2024-06-14T10:00:00Z' },
        { id: '2', rating: 4, category: 'gameplay', created_at: '2024-06-14T11:00:00Z' },
        { id: '3', rating: 2, category: 'ui', created_at: '2024-06-14T12:00:00Z' },
        { id: '4', rating: 3, category: 'performance', created_at: '2024-06-14T13:00:00Z' },
      ];

      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          gte: vi.fn().mockResolvedValue({ data: mockFeedback, error: null }),
        }),
      });
      (supabase.from as Mock) = mockFrom;

      const result = await reportsService.getFeedbackReport(30);

      const june14Data = result.find(d => d.date === '2024-06-14');
      expect(june14Data?.total_feedback).toBe(4);
      expect(june14Data?.positive_feedback).toBe(2); // ratings 4 and 5
      expect(june14Data?.negative_feedback).toBe(1); // rating 2
      expect(june14Data?.neutral_feedback).toBe(1); // rating 3
      expect(june14Data?.categories.length).toBeGreaterThan(0);
    });

    it('should return empty array on error', async () => {
      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          gte: vi.fn().mockResolvedValue({ data: null, error: { message: 'Error' } }),
        }),
      });
      (supabase.from as Mock) = mockFrom;

      const result = await reportsService.getFeedbackReport(30);

      expect(result).toEqual([]);
    });

    it('should handle feedback without category', async () => {
      const mockFeedback = [
        { id: '1', rating: 5, category: null, created_at: '2024-06-14T10:00:00Z' },
      ];

      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          gte: vi.fn().mockResolvedValue({ data: mockFeedback, error: null }),
        }),
      });
      (supabase.from as Mock) = mockFrom;

      const result = await reportsService.getFeedbackReport(30);

      const june14Data = result.find(d => d.date === '2024-06-14');
      expect(june14Data?.categories.some(c => c.category === 'general')).toBe(true);
    });

    it('should calculate average rating correctly', async () => {
      const mockFeedback = [
        { id: '1', rating: 5, category: 'test', created_at: '2024-06-14T10:00:00Z' },
        { id: '2', rating: 5, category: 'test', created_at: '2024-06-14T11:00:00Z' },
      ];

      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          gte: vi.fn().mockResolvedValue({ data: mockFeedback, error: null }),
        }),
      });
      (supabase.from as Mock) = mockFrom;

      const result = await reportsService.getFeedbackReport(30);

      const june14Data = result.find(d => d.date === '2024-06-14');
      expect(june14Data?.avg_rating).toBeGreaterThan(0);
    });

    it('should handle exception gracefully', async () => {
      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          gte: vi.fn().mockRejectedValue(new Error('Connection refused')),
        }),
      });
      (supabase.from as Mock) = mockFrom;

      const result = await reportsService.getFeedbackReport(30);

      expect(result).toEqual([]);
    });

    it('should handle empty feedback array', async () => {
      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          gte: vi.fn().mockResolvedValue({ data: [], error: null }),
        }),
      });
      (supabase.from as Mock) = mockFrom;

      const result = await reportsService.getFeedbackReport(30);

      expect(Array.isArray(result)).toBe(true);
      result.forEach(day => {
        expect(day.total_feedback).toBe(0);
        expect(day.avg_rating).toBe(0);
      });
    });
  });
});
