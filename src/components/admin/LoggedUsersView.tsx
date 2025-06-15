
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from "@/components/ui/pagination";
import { Search, Users, UserCheck, Trophy, Calendar } from "lucide-react";

const ITEMS_PER_PAGE = 15;

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

export const LoggedUsersView = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const { data: loggedUsers = [], isLoading } = useQuery({
    queryKey: ['logged-users'],
    queryFn: async (): Promise<LoggedUser[]> => {
      try {
        console.log('🔍 Buscando usuários logados...');
        
        // Buscar todos os perfis de usuários
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('*');
        
        if (profilesError) {
          console.error('❌ Erro ao buscar perfis:', profilesError);
          return [];
        }

        console.log('👥 Perfis encontrados:', profiles?.length || 0);

        if (!profiles || profiles.length === 0) {
          console.log('⚠️ Nenhum perfil encontrado');
          return [];
        }

        // Buscar histórico de jogos para todos os usuários
        const { data: gameHistory, error: gameHistoryError } = await supabase
          .from('user_game_history')
          .select('*');
        
        if (gameHistoryError) {
          console.error('❌ Erro ao buscar histórico de jogos:', gameHistoryError);
        }

        console.log('🎮 Histórico de jogos encontrado:', gameHistory?.length || 0);

        // Buscar rankings para obter dados adicionais
        const { data: rankings, error: rankingsError } = await supabase
          .from('rankings')
          .select('*')
          .not('user_id', 'is', null);
        
        if (rankingsError) {
          console.error('❌ Erro ao buscar rankings:', rankingsError);
        }

        console.log('🏆 Rankings encontrados:', rankings?.length || 0);

        // Processar dados para criar a visualização de usuários logados
        const usersWithGames: LoggedUser[] = [];
        
        profiles.forEach(profile => {
          // Buscar histórico de jogos do usuário
          const userGameHistory = gameHistory?.filter(gh => gh.user_id === profile.id) || [];
          const userRankings = rankings?.filter(r => r.user_id === profile.id) || [];
          
          // Se o usuário tem jogos ou rankings, incluir na lista
          if (userGameHistory.length > 0 || userRankings.length > 0) {
            const totalGames = userGameHistory.length;
            let bestScore = 0;
            let totalAttempts = 0;
            let correctGuesses = 0;
            let lastPlayedDate = new Date();

            // Calcular estatísticas do histórico de jogos
            if (userGameHistory.length > 0) {
              bestScore = Math.max(...userGameHistory.map(gh => gh.score || 0));
              totalAttempts = userGameHistory.reduce((sum, gh) => sum + (gh.total_attempts || 0), 0);
              correctGuesses = userGameHistory.reduce((sum, gh) => sum + (gh.correct_guesses || 0), 0);
              
              const dates = userGameHistory.map(gh => new Date(gh.created_at));
              lastPlayedDate = new Date(Math.max(...dates.map(d => d.getTime())));
            }

            // Se não há histórico, usar dados dos rankings
            if (userGameHistory.length === 0 && userRankings.length > 0) {
              bestScore = Math.max(...userRankings.map(r => r.score || 0));
              const rankingDates = userRankings.map(r => new Date(r.created_at));
              lastPlayedDate = new Date(Math.max(...rankingDates.map(d => d.getTime())));
            }

            const accuracyRate = totalAttempts > 0 ? (correctGuesses / totalAttempts) * 100 : 0;

            usersWithGames.push({
              id: profile.id,
              full_name: profile.full_name,
              email: profile.email,
              avatar_url: profile.avatar_url,
              created_at: profile.created_at,
              total_games: totalGames || userRankings.length,
              best_score: bestScore,
              last_played: lastPlayedDate.toISOString(),
              total_attempts: totalAttempts,
              correct_guesses: correctGuesses,
              accuracy_rate: Math.round(accuracyRate * 100) / 100
            });
          }
        });

        console.log('✅ Usuários com jogos processados:', usersWithGames.length);
        return usersWithGames.sort((a, b) => new Date(b.last_played).getTime() - new Date(a.last_played).getTime());
        
      } catch (error) {
        console.error('❌ Erro na consulta de usuários logados:', error);
        return [];
      }
    },
    staleTime: 5 * 60 * 1000,
    retry: 1
  });

  // Filter users based on search term
  const filteredUsers = useMemo(() => {
    return loggedUsers.filter(user =>
      (user.full_name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (user.email?.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [loggedUsers, searchTerm]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentUsers = filteredUsers.slice(startIndex, endIndex);

  // Reset to first page when search changes
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  // Calculate summary stats
  const totalLoggedUsers = loggedUsers.length;
  const totalGamesPlayed = loggedUsers.reduce((sum, user) => sum + user.total_games, 0);
  const averageGamesPerUser = totalLoggedUsers > 0 ? Math.round((totalGamesPlayed / totalLoggedUsers) * 100) / 100 : 0;
  const activeUsersLastWeek = loggedUsers.filter(user => {
    const lastPlayed = new Date(user.last_played);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return lastPlayed >= weekAgo;
  }).length;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="w-8 h-8 border-4 border-flu-grena border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuários Logados</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalLoggedUsers}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Partidas</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalGamesPlayed}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Média por Usuário</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageGamesPerUser}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ativos (7 dias)</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeUsersLastWeek}</div>
          </CardContent>
        </Card>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Usuários Logados que Jogaram</CardTitle>
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <Input
                placeholder="Buscar por nome ou email..."
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {currentUsers.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {searchTerm ? 'Nenhum usuário encontrado para a busca.' : 'Nenhum usuário logado jogou ainda.'}
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">Avatar</TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Partidas</TableHead>
                    <TableHead>Melhor Score</TableHead>
                    <TableHead>Taxa de Acerto</TableHead>
                    <TableHead>Último Jogo</TableHead>
                    <TableHead>Cadastro</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        {user.avatar_url ? (
                          <img
                            src={user.avatar_url}
                            alt={user.full_name || 'Avatar'}
                            className="w-10 h-10 rounded-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/placeholder.svg';
                            }}
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                            <UserCheck size={20} className="text-gray-500" />
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="font-medium">
                        {user.full_name || 'Nome não informado'}
                      </TableCell>
                      <TableCell>{user.email || 'Email não informado'}</TableCell>
                      <TableCell>{user.total_games}</TableCell>
                      <TableCell>{user.best_score}</TableCell>
                      <TableCell>{user.accuracy_rate}%</TableCell>
                      <TableCell>
                        {new Date(user.last_played).toLocaleDateString('pt-BR')}
                      </TableCell>
                      <TableCell>
                        {new Date(user.created_at).toLocaleDateString('pt-BR')}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-6 flex justify-center">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious 
                          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                          className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        />
                      </PaginationItem>
                      
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <PaginationItem key={page}>
                          <PaginationLink 
                            onClick={() => setCurrentPage(page)}
                            isActive={currentPage === page}
                            className="cursor-pointer"
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      ))}
                      
                      <PaginationItem>
                        <PaginationNext 
                          onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                          className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}

              <div className="mt-4 text-sm text-gray-500 text-center">
                Mostrando {startIndex + 1} - {Math.min(endIndex, filteredUsers.length)} de {filteredUsers.length} usuários
                {searchTerm && ` (filtrados de ${loggedUsers.length} total)`}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
