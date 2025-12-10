import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';

interface CreateChallengeParams {
  challengerId?: string;
  challengerName: string;
  challengerScore: number;
  gameMode: 'adaptive' | 'decade';
  difficultyLevel?: string;
  challengeLink: string;
}

interface AcceptChallengeParams {
  challengeId: string;
  challengedId: string;
  challengedName: string;
}

interface CompleteChallengeParams {
  challengeLink: string;
  challengedId?: string;
  challengedName: string;
  challengedScore: number;
}

export const challengeService = {
  /**
   * Create a new challenge and persist to database
   */
  async createChallenge(params: CreateChallengeParams): Promise<string | null> {
    try {
      const { data, error } = await supabase
        .from('user_challenges')
        .insert({
          challenger_id: params.challengerId || null,
          challenger_name: params.challengerName,
          challenger_score: params.challengerScore,
          game_mode: params.gameMode,
          difficulty_level: params.difficultyLevel || null,
          challenge_link: params.challengeLink,
          status: 'pending',
        })
        .select('id')
        .single();

      if (error) {
        logger.error('Error creating challenge:', error.message);
        return null;
      }

      logger.info('Challenge created:', data.id);
      return data.id;
    } catch (error) {
      logger.error('Error in createChallenge:', error instanceof Error ? error.message : 'Unknown error');
      return null;
    }
  },

  /**
   * Accept a challenge (register who accepted)
   */
  async acceptChallenge(params: AcceptChallengeParams): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_challenges')
        .update({
          challenged_id: params.challengedId,
          challenged_name: params.challengedName,
        })
        .eq('id', params.challengeId);

      if (error) {
        logger.error('Error accepting challenge:', error.message);
        return false;
      }

      logger.info('Challenge accepted:', params.challengeId);
      return true;
    } catch (error) {
      logger.error('Error in acceptChallenge:', error instanceof Error ? error.message : 'Unknown error');
      return false;
    }
  },

  /**
   * Complete a challenge with the final score
   */
  async completeChallenge(params: CompleteChallengeParams): Promise<boolean> {
    try {
      // Find challenge by link
      const { data: challenges, error: findError } = await supabase
        .from('user_challenges')
        .select('id')
        .eq('challenge_link', params.challengeLink)
        .eq('status', 'pending')
        .limit(1);

      if (findError || !challenges || challenges.length === 0) {
        logger.warn('Challenge not found or already completed:', params.challengeLink);
        return false;
      }

      const challengeId = challenges[0].id;

      const { error } = await supabase
        .from('user_challenges')
        .update({
          challenged_id: params.challengedId || null,
          challenged_name: params.challengedName,
          challenged_score: params.challengedScore,
          status: 'completed',
          completed_at: new Date().toISOString(),
        })
        .eq('id', challengeId);

      if (error) {
        logger.error('Error completing challenge:', error.message);
        return false;
      }

      logger.info('Challenge completed:', challengeId);
      return true;
    } catch (error) {
      logger.error('Error in completeChallenge:', error instanceof Error ? error.message : 'Unknown error');
      return false;
    }
  },

  /**
   * Find challenge by encoded link data
   */
  async findChallengeByLink(challengeLink: string): Promise<string | null> {
    try {
      const { data, error } = await supabase
        .from('user_challenges')
        .select('id')
        .eq('challenge_link', challengeLink)
        .limit(1);

      if (error || !data || data.length === 0) {
        return null;
      }

      return data[0].id;
    } catch (error) {
      logger.error('Error finding challenge:', error instanceof Error ? error.message : 'Unknown error');
      return null;
    }
  },
};
