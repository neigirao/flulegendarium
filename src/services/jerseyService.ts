import { supabase } from '@/integrations/supabase/client';
import { Jersey, JerseyRankingEntry, JerseyGameSession, JerseyType } from '@/types/jersey-game';
import type { DifficultyLevel } from '@/types/guess-game';
import type { Json } from '@/integrations/supabase/types';
import { logger } from '@/utils/logger';

/**
 * Mapear dados do banco para tipo Jersey
 */
const mapDbToJersey = (row: Record<string, unknown>): Jersey => ({
  id: row.id as string,
  years: row.years as number[],
  image_url: row.image_url as string,
  type: (row.type as JerseyType) || 'home',
  manufacturer: row.manufacturer as string | null,
  season: row.season as string | null,
  title: row.title as string | null,
  fun_fact: row.fun_fact as string | null,
  nicknames: row.nicknames as string[] | null,
  difficulty_level: row.difficulty_level as DifficultyLevel | null,
  difficulty_score: row.difficulty_score as number | null,
  difficulty_confidence: row.difficulty_confidence as number | null,
  total_attempts: row.total_attempts as number | null,
  correct_attempts: row.correct_attempts as number | null,
  average_guess_time: row.average_guess_time as number | null,
  decades: row.decades as string[] | null,
  created_at: row.created_at as string,
});

/**
 * Serviço para gerenciamento de camisas do Fluminense
 */
export const jerseyService = {
  /**
   * Buscar todas as camisas
   */
  async getAllJerseys(): Promise<Jersey[]> {
    try {
      const { data, error } = await supabase
        .from('jerseys')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        logger.error('Erro ao buscar camisas:', error.message);
        throw error;
      }

      return (data || []).map(mapDbToJersey);
    } catch (error) {
      logger.error('Falha ao buscar camisas:', String(error));
      return [];
    }
  },

  /**
   * Buscar camisas por década
   */
  async getJerseysByDecade(decade: string): Promise<Jersey[]> {
    try {
      const { data, error } = await supabase
        .from('jerseys')
        .select('*')
        .contains('decades', [decade])
        .order('created_at', { ascending: false });

      if (error) {
        logger.error('Erro ao buscar camisas por década:', error.message);
        throw error;
      }

      return (data || []).map(mapDbToJersey);
    } catch (error) {
      logger.error('Falha ao buscar camisas por década:', String(error));
      return [];
    }
  },

  /**
   * Buscar camisas por dificuldade
   */
  async getJerseysByDifficulty(level: DifficultyLevel): Promise<Jersey[]> {
    try {
      const { data, error } = await supabase
        .from('jerseys')
        .select('*')
        .eq('difficulty_level', level)
        .order('created_at', { ascending: false });

      if (error) {
        logger.error('Erro ao buscar camisas por dificuldade:', error.message);
        throw error;
      }

      return (data || []).map(mapDbToJersey);
    } catch (error) {
      logger.error('Falha ao buscar camisas por dificuldade:', String(error));
      return [];
    }
  },

  /**
   * Selecionar camisa aleatória respeitando dificuldade e exclusões
   */
  selectJerseyByDifficulty(
    jerseys: Jersey[],
    difficulty: DifficultyLevel,
    usedIds: Set<string>
  ): Jersey | null {
    const availableJerseys = jerseys.filter(
      (jersey) => 
        jersey.difficulty_level === difficulty && 
        !usedIds.has(jersey.id)
    );

    if (availableJerseys.length === 0) {
      logger.warn(`Nenhuma camisa disponível para dificuldade: ${difficulty}`);
      return null;
    }

    const randomIndex = Math.floor(Math.random() * availableJerseys.length);
    return availableJerseys[randomIndex];
  },

  /**
   * Selecionar camisa aleatória (fallback sem filtro de dificuldade)
   */
  selectRandomJersey(jerseys: Jersey[], usedIds: Set<string>): Jersey | null {
    const availableJerseys = jerseys.filter((jersey) => !usedIds.has(jersey.id));

    if (availableJerseys.length === 0) {
      logger.warn('Nenhuma camisa disponível');
      return null;
    }

    const randomIndex = Math.floor(Math.random() * availableJerseys.length);
    return availableJerseys[randomIndex];
  },

  /**
   * Registrar tentativa para cálculo de dificuldade
   */
  async recordDifficultyStat(
    jerseyId: string,
    guessTime: number,
    yearDifference: number,
    isCorrect: boolean,
    userId?: string,
    sessionId?: string,
    deviceType: string = 'desktop'
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('jersey_difficulty_stats')
        .insert({
          jersey_id: jerseyId,
          user_id: userId || null,
          session_id: sessionId || null,
          guess_time: guessTime,
          year_difference: yearDifference,
          is_correct: isCorrect,
          device_type: deviceType,
        });

      if (error) {
        logger.error('Erro ao registrar stat de dificuldade:', error.message);
      }
    } catch (error) {
      logger.error('Falha ao registrar stat:', String(error));
    }
  },

  /**
   * Salvar entrada no ranking
   */
  async saveRanking(entry: Omit<JerseyRankingEntry, 'id' | 'createdAt'>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('jersey_game_rankings')
        .insert({
          user_id: entry.userId || null,
          player_name: entry.playerName,
          score: entry.score,
          correct_guesses: entry.correctGuesses,
          total_attempts: entry.totalAttempts,
          max_streak: entry.maxStreak,
          difficulty_level: entry.difficultyLevel || null,
          game_mode: entry.gameMode || 'adaptive',
          game_duration: entry.gameDuration || null,
        });

      if (error) {
        logger.error('Erro ao salvar ranking:', error.message);
        return false;
      }

      logger.info('Ranking salvo com sucesso');
      return true;
    } catch (error) {
      logger.error('Falha ao salvar ranking:', String(error));
      return false;
    }
  },

  /**
   * Buscar rankings
   */
  async getRankings(limit: number = 100): Promise<JerseyRankingEntry[]> {
    try {
      const { data, error } = await supabase
        .from('jersey_game_rankings')
        .select('*')
        .order('score', { ascending: false })
        .limit(limit);

      if (error) {
        logger.error('Erro ao buscar rankings:', error.message);
        throw error;
      }

      return (data || []).map((row) => ({
        id: row.id,
        userId: row.user_id,
        playerName: row.player_name,
        score: row.score,
        correctGuesses: row.correct_guesses,
        totalAttempts: row.total_attempts,
        maxStreak: row.max_streak,
        difficultyLevel: row.difficulty_level,
        gameMode: row.game_mode,
        gameDuration: row.game_duration,
        createdAt: row.created_at,
      }));
    } catch (error) {
      logger.error('Falha ao buscar rankings:', String(error));
      return [];
    }
  },

  /**
   * Salvar sessão do jogo
   */
  async saveSession(session: Omit<JerseyGameSession, 'id'>): Promise<string | null> {
    try {
      const insertData = {
        user_id: session.userId || null,
        game_mode: session.gameMode,
        final_score: session.finalScore,
        correct_guesses: session.correctGuesses,
        total_attempts: session.totalAttempts,
        max_streak: session.maxStreak,
        difficulty_level: session.difficultyLevel || null,
        started_at: session.startedAt,
        ended_at: session.endedAt || new Date().toISOString(),
        metadata: (session.metadata || {}) as Json,
      };

      const { data, error } = await supabase
        .from('jersey_game_sessions')
        .insert([insertData])
        .select('id')
        .single();

      if (error) {
        logger.error('Erro ao salvar sessão:', error.message);
        return null;
      }

      return data?.id || null;
    } catch (error) {
      logger.error('Falha ao salvar sessão:', String(error));
      return null;
    }
  },

  /**
   * Calcular pontos baseado na diferença de anos
   */
  calculatePoints(
    yearDifference: number,
    difficultyMultiplier: number,
    timeRemaining: number,
    totalTime: number
  ): { points: number; bonus: number } {
    let basePoints = 0;
    let bonus = 0;

    // Pontuação base por precisão
    if (yearDifference === 0) {
      basePoints = 10; // Acerto exato
      bonus = 5; // Bônus por acerto exato
    } else if (yearDifference <= 1) {
      basePoints = 5; // ±1 ano
    } else if (yearDifference <= 2) {
      basePoints = 3; // ±2 anos
    } else {
      basePoints = 0; // Erro
    }

    // Aplicar multiplicador de dificuldade
    const pointsWithMultiplier = Math.round(basePoints * difficultyMultiplier);

    // Bônus por tempo (se acertou)
    if (basePoints > 0 && totalTime > 0) {
      const timePercentage = timeRemaining / totalTime;
      if (timePercentage > 0.7) {
        bonus += 2; // Resposta rápida
      } else if (timePercentage > 0.4) {
        bonus += 1; // Resposta média
      }
    }

    return {
      points: pointsWithMultiplier,
      bonus: Math.round(bonus * difficultyMultiplier),
    };
  },

  /**
   * Verificar se o palpite está correto (apenas acerto exato)
   */
  checkGuess(
    guessYear: number,
    validYears: number[]
  ): { isCorrect: boolean; yearDifference: number; hint?: 'higher' | 'lower'; matchedYear?: number } {
    // Encontrar o ano mais próximo do palpite
    let closestYear = validYears[0];
    let minDifference = Math.abs(guessYear - validYears[0]);
    let exactMatch: number | undefined;
    
    for (const year of validYears) {
      const diff = Math.abs(guessYear - year);
      if (diff < minDifference) {
        minDifference = diff;
        closestYear = year;
      }
      if (diff === 0) {
        exactMatch = year;
      }
    }
    
    // Acerto apenas se for exato (diferença 0)
    const isCorrect = minDifference === 0;

    return {
      isCorrect,
      yearDifference: minDifference,
      matchedYear: exactMatch,
      hint: !isCorrect ? (guessYear < closestYear ? 'higher' : 'lower') : undefined,
    };
  },
};
