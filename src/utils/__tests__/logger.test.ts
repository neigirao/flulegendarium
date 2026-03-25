import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// We need to test the logger module
// First, let's mock console methods
const mockConsoleLog = vi.fn();
const mockConsoleInfo = vi.fn();
const mockConsoleWarn = vi.fn();
const mockConsoleError = vi.fn();

describe('logger', () => {
  const originalEnv = process.env.NODE_ENV;
  
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'log').mockImplementation(mockConsoleLog);
    vi.spyOn(console, 'info').mockImplementation(mockConsoleInfo);
    vi.spyOn(console, 'warn').mockImplementation(mockConsoleWarn);
    vi.spyOn(console, 'error').mockImplementation(mockConsoleError);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    process.env.NODE_ENV = originalEnv;
  });

  // Since the Logger class checks NODE_ENV at instantiation time,
  // we need to re-import the module to test different environments
  describe('log levels', () => {
    it('should log info messages with correct prefix', async () => {
      const { logger } = await import('../logger');
      logger.info('Test info message', 'TEST');
      
      expect(mockConsoleInfo).toHaveBeenCalled();
      const call = mockConsoleInfo.mock.calls[0];
      expect(call[0]).toContain('TEST');
      expect(call[0]).toContain('Test info message');
    });

    it('should log warn messages with correct prefix', async () => {
      const { logger } = await import('../logger');
      logger.warn('Test warn message', 'WARN_CTX');
      
      expect(mockConsoleWarn).toHaveBeenCalled();
      const call = mockConsoleWarn.mock.calls[0];
      expect(call[0]).toContain('WARN_CTX');
      expect(call[0]).toContain('Test warn message');
    });

    it('should log error messages with correct prefix', async () => {
      const { logger } = await import('../logger');
      logger.error('Test error message', 'ERROR_CTX');
      
      expect(mockConsoleError).toHaveBeenCalled();
      const call = mockConsoleError.mock.calls[0];
      expect(call[0]).toContain('ERROR_CTX');
      expect(call[0]).toContain('Test error message');
    });

    it('should include data when provided', async () => {
      const { logger } = await import('../logger');
      const testData = { key: 'value', count: 42 };
      logger.info('Message with data', 'CTX', testData);
      
      expect(mockConsoleInfo).toHaveBeenCalled();
      const call = mockConsoleInfo.mock.calls[0];
      expect(call[1]).toMatchObject({ data: testData });
    });

    it('should handle undefined context gracefully', async () => {
      const { logger } = await import('../logger');
      logger.info('Message without context');
      
      expect(mockConsoleInfo).toHaveBeenCalled();
    });

    it('should handle undefined data gracefully', async () => {
      const { logger } = await import('../logger');
      logger.info('Message', 'CTX', undefined);
      
      expect(mockConsoleInfo).toHaveBeenCalled();
    });
  });

  describe('game-specific methods', () => {
    it('gameAction should log with GAME context', async () => {
      const { logger } = await import('../logger');
      logger.gameAction('player_selected', 'Romário', { score: 100 });
      
      expect(mockConsoleLog).toHaveBeenCalled();
      const call = mockConsoleLog.mock.calls[0];
      expect(call[0]).toContain('GAME');
      expect(call[0]).toContain('player_selected');
    });

    it('gameAction should include player name in data', async () => {
      const { logger } = await import('../logger');
      logger.gameAction('correct_guess', 'Fred');
      
      expect(mockConsoleLog).toHaveBeenCalled();
      const call = mockConsoleLog.mock.calls[0];
      expect(call[1]).toMatchObject({ data: { playerName: 'Fred' } });
    });

    it('imageLoad should log success with IMAGE context', async () => {
      const { logger } = await import('../logger');
      logger.imageLoad('Romário', true, 'https://example.com/image.jpg');
      
      expect(mockConsoleLog).toHaveBeenCalled();
      const call = mockConsoleLog.mock.calls[0];
      expect(call[0]).toContain('IMAGE');
      expect(call[0]).toContain('Romário');
    });

    it('imageLoad should log failure as warning', async () => {
      const { logger } = await import('../logger');
      logger.imageLoad('Romário', false, 'https://example.com/broken.jpg');
      
      expect(mockConsoleWarn).toHaveBeenCalled();
      const call = mockConsoleWarn.mock.calls[0];
      expect(call[0]).toContain('IMAGE');
      expect(call[0]).toContain('failed');
    });

    it('timer should log with TIMER context', async () => {
      const { logger } = await import('../logger');
      logger.timer('started', 60);
      
      expect(mockConsoleLog).toHaveBeenCalled();
      const call = mockConsoleLog.mock.calls[0];
      expect(call[0]).toContain('TIMER');
      expect(call[1]).toMatchObject({ data: { timeRemaining: 60 } });
    });

    it('timer should handle undefined timeRemaining', async () => {
      const { logger } = await import('../logger');
      logger.timer('stopped');
      
      expect(mockConsoleLog).toHaveBeenCalled();
    });
  });

  describe('debug logging in development', () => {
    it('should log debug messages in development mode', async () => {
      // In test environment, debug might be skipped
      // This test verifies the debug method exists and can be called
      const { logger } = await import('../logger');
      
      // Should not throw
      expect(() => logger.debug('Debug message', 'DEBUG_CTX')).not.toThrow();
    });
  });

  describe('message formatting', () => {
    it('should format message with context prefix', async () => {
      const { logger } = await import('../logger');
      logger.info('Formatted message', 'CONTEXT');
      
      const call = mockConsoleInfo.mock.calls[0];
      expect(call[0]).toMatch(/\[CONTEXT\]/);
    });

    it('should handle empty message', async () => {
      const { logger } = await import('../logger');
      logger.info('', 'CTX');
      
      expect(mockConsoleInfo).toHaveBeenCalled();
    });

    it('should handle special characters in message', async () => {
      const { logger } = await import('../logger');
      logger.info('Message with "quotes" and <brackets>', 'CTX');
      
      expect(mockConsoleInfo).toHaveBeenCalled();
    });

    it('should handle unicode characters', async () => {
      const { logger } = await import('../logger');
      logger.info('Mensagem com acentos: José Ângelo 🏆', 'CTX');
      
      expect(mockConsoleInfo).toHaveBeenCalled();
    });
  });

  describe('data handling', () => {
    it('should handle complex nested objects', async () => {
      const { logger } = await import('../logger');
      const complexData = {
        player: {
          name: 'Fred',
          stats: {
            goals: 100,
            games: 200
          }
        },
        array: [1, 2, 3]
      };
      
      logger.info('Complex data', 'CTX', complexData);
      
      const call = mockConsoleInfo.mock.calls[0];
      expect(call[1]).toMatchObject({ data: complexData });
    });

    it('should handle null data', async () => {
      const { logger } = await import('../logger');
      logger.info('Null data', 'CTX', null);
      
      expect(mockConsoleInfo).toHaveBeenCalled();
    });

    it('should handle array data', async () => {
      const { logger } = await import('../logger');
      const arrayData = ['item1', 'item2', 'item3'];
      
      logger.info('Array data', 'CTX', arrayData);
      
      const call = mockConsoleInfo.mock.calls[0];
      expect(call[1]).toMatchObject({ data: arrayData });
    });
  });


  describe('maintenance diagnostics', () => {
    it('should store recent logs for maintenance', async () => {
      const { logger } = await import('../logger');
      logger.clearRecentLogs();
      logger.maintenance('cache-refreshed', { items: 3 });

      const logs = logger.getRecentLogs(5);
      expect(logs.length).toBeGreaterThan(0);
      expect(logs[0]).toMatchObject({
        context: 'MAINTENANCE',
        message: 'Maintenance: cache-refreshed'
      });
    });
  });
});
