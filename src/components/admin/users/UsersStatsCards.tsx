
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserCheck, Trophy, Users, Calendar } from "lucide-react";

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

interface UsersStatsCardsProps {
  users: LoggedUser[];
}

export const UsersStatsCards = ({ users }: UsersStatsCardsProps) => {
  const totalLoggedUsers = users.length;
  const totalGamesPlayed = users.reduce((sum, user) => sum + user.total_games, 0);
  const averageGamesPerUser = totalLoggedUsers > 0 ? Math.round((totalGamesPlayed / totalLoggedUsers) * 100) / 100 : 0;
  const activeUsersLastWeek = users.filter(user => {
    const lastPlayed = new Date(user.last_played);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return lastPlayed >= weekAgo;
  }).length;

  return (
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
  );
};
