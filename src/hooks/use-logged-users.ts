
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface LoggedUser {
  id: string;
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
  created_at: string;
  total_games: number;
  best_score: number;
  last_played: string;
  total_attempts: number;
  correct_guesses: number;
  accuracy_rate: number;
}

export const useLoggedUsers = () => {
  const { data: loggedUsers = [], isLoading } = useQuery({
    queryKey: ['logged-users'],
    queryFn: async (): Promise<LoggedUser[]> => {
      try {
        console.log('🔍 Iniciando busca de usuários logados...');
        
        // Primeiro, vamos buscar todos os perfis
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('*');
        
        if (profilesError) {
          console.error('❌ Erro ao buscar perfis:', profilesError);
          throw profilesError;
        }

        console.log('👥 Total de perfis encontrados:', profiles?.length || 0);
        console.log('👥 Perfis encontrados:', profiles);

        if (!profiles || profiles.length === 0) {
          console.log('⚠️ Nenhum perfil encontrado na tabela profiles');
          return [];
        }

        // Buscar usuários logados da tabela auth.users
        const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
        
        if (authError) {
          console.error('❌ Erro ao buscar usuários auth:', authError);
        } else {
          console.log('🔐 Total de usuários auth encontrados:', authUsers?.users?.length || 0);
        }

        // Buscar rankings para ver quem tem pontuação
        const { data: rankings, error: rankingsError } = await supabase
          .from('rankings')
          .select('*')
          .not('user_id', 'is', null);
        
        if (rankingsError) {
          console.error('❌ Erro ao buscar rankings:', rankingsError);
        } else {
          console.log('🏆 Rankings de usuários logados encontrados:', rankings?.length || 0);
        }

        // Buscar histórico de jogos
        const { data: gameHistory, error: gameHistoryError } = await supabase
          .from('user_game_history')
          .select('*');
        
        if (gameHistoryError) {
          console.error('❌ Erro ao buscar histórico de jogos:', gameHistoryError);
        } else {
          console.log('🎮 Histórico de jogos encontrado:', gameHistory?.length || 0);
        }

        // Processar dados dos usuários logados
        const loggedUsersData: LoggedUser[] = [];
        
        for (const profile of profiles) {
          console.log(`👤 Processando perfil:`, profile.id, profile.email);
          
          // Verificar se tem rankings
          const userRankings = rankings?.filter(r => r.user_id === profile.id) || [];
          const userGameHistory = gameHistory?.filter(gh => gh.user_id === profile.id) || [];
          
          console.log(`📊 Usuário ${profile.email}: ${userRankings.length} rankings, ${userGameHistory.length} jogos`);
          
          // Se tem rankings ou histórico, é um usuário ativo
          if (userRankings.length > 0 || userGameHistory.length > 0) {
            let bestScore = 0;
            let totalGames = 0;
            let totalAttempts = 0;
            let correctGuesses = 0;
            let lastPlayedDate = new Date(profile.created_at);

            // Calcular estatísticas dos rankings
            if (userRankings.length > 0) {
              bestScore = Math.max(...userRankings.map(r => r.score || 0));
              totalGames += userRankings.length;
              
              const rankingDates = userRankings.map(r => new Date(r.created_at));
              const maxRankingDate = new Date(Math.max(...rankingDates.map(d => d.getTime())));
              if (maxRankingDate > lastPlayedDate) {
                lastPlayedDate = maxRankingDate;
              }
            }

            // Calcular estatísticas do histórico
            if (userGameHistory.length > 0) {
              const historyBestScore = Math.max(...userGameHistory.map(gh => gh.score || 0));
              if (historyBestScore > bestScore) {
                bestScore = historyBestScore;
              }
              
              totalGames += userGameHistory.length;
              totalAttempts = userGameHistory.reduce((sum, gh) => sum + (gh.total_attempts || 0), 0);
              correctGuesses = userGameHistory.reduce((sum, gh) => sum + (gh.correct_guesses || 0), 0);
              
              const historyDates = userGameHistory.map(gh => new Date(gh.created_at));
              const maxHistoryDate = new Date(Math.max(...historyDates.map(d => d.getTime())));
              if (maxHistoryDate > lastPlayedDate) {
                lastPlayedDate = maxHistoryDate;
              }
            }

            const accuracyRate = totalAttempts > 0 ? (correctGuesses / totalAttempts) * 100 : 0;

            const userData: LoggedUser = {
              id: profile.id,
              full_name: profile.full_name,
              email: profile.email,
              avatar_url: profile.avatar_url,
              created_at: profile.created_at,
              total_games: totalGames,
              best_score: bestScore,
              last_played: lastPlayedDate.toISOString(),
              total_attempts: totalAttempts,
              correct_guesses: correctGuesses,
              accuracy_rate: Math.round(accuracyRate * 100) / 100
            };

            loggedUsersData.push(userData);
            console.log(`✅ Usuário ativo adicionado:`, userData.email, userData);
          } else {
            console.log(`⚠️ Usuário sem atividade:`, profile.email);
          }
        }

        console.log('✅ Total de usuários logados ativos processados:', loggedUsersData.length);
        
        // Ordenar por última jogada (mais recente primeiro)
        return loggedUsersData.sort((a, b) => new Date(b.last_played).getTime() - new Date(a.last_played).getTime());
        
      } catch (error) {
        console.error('❌ Erro geral na consulta de usuários logados:', error);
        return [];
      }
    },
    staleTime: 5 * 60 * 1000,
    retry: 1
  });

  return { loggedUsers, isLoading };
};
