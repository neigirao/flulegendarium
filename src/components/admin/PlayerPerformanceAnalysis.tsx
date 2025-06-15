
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { usePlayerPerformance } from "@/hooks/admin-stats/use-player-performance";
import { TrendingUp, TrendingDown, Eye, EyeOff, BarChart3, Users } from "lucide-react";
import { memo } from "react";

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case 'Muito Fácil':
      return 'default';
    case 'Fácil':
      return 'outline';
    case 'Médio':
      return 'secondary';
    case 'Difícil':
      return 'destructive';
    case 'Muito Difícil':
      return 'destructive';
    default:
      return 'outline';
  }
};

const getDifficultyIcon = (difficulty: string) => {
  return difficulty === 'Difícil' || difficulty === 'Muito Difícil' ? 
    <EyeOff className="h-3 w-3" /> : 
    <Eye className="h-3 w-3" />;
};

const PlayerTable = memo(({ players, title, icon }: { 
  players: any[], 
  title: string, 
  icon: React.ReactNode 
}) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        {icon}
        {title}
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Jogador</TableHead>
              <TableHead className="text-center">Tentativas</TableHead>
              <TableHead className="text-center">Taxa de Acerto</TableHead>
              <TableHead className="text-center">Dificuldade</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {players.map((player, index) => (
              <TableRow key={player.player_name}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">#{index + 1}</span>
                    {player.player_name}
                  </div>
                </TableCell>
                <TableCell className="text-center">{player.total_attempts}</TableCell>
                <TableCell className="text-center">
                  <span className={`font-semibold ${
                    player.recognition_rate >= 70 ? 'text-green-600' :
                    player.recognition_rate >= 50 ? 'text-yellow-600' :
                    player.recognition_rate >= 30 ? 'text-orange-600' :
                    'text-red-600'
                  }`}>
                    {player.recognition_rate.toFixed(1)}%
                  </span>
                </TableCell>
                <TableCell className="text-center">
                  <Badge 
                    variant={getDifficultyColor(player.difficulty_level)}
                    className="flex items-center gap-1 w-fit mx-auto"
                  >
                    {getDifficultyIcon(player.difficulty_level)}
                    {player.difficulty_level}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </CardContent>
  </Card>
));

PlayerTable.displayName = 'PlayerTable';

export const PlayerPerformanceAnalysis = memo(() => {
  const {
    mostRecognized,
    leastRecognized,
    trendingPlayers,
    averageDifficulty,
    playerPerformance,
    isLoading
  } = usePlayerPerformance();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Análise de Performance por Jogador
            </CardTitle>
            <CardDescription>Carregando análise de performance...</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="animate-pulse space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-24 bg-gray-200 rounded-lg" />
                ))}
              </div>
              <div className="h-64 bg-gray-200 rounded-lg" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Análise de Performance por Jogador
          </CardTitle>
          <CardDescription>
            Estatísticas detalhadas de reconhecimento e dificuldade por jogador
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">Total de Jogadores</span>
              </div>
              <p className="text-2xl font-bold text-blue-900">{playerPerformance.length}</p>
            </div>
            
            <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg">
              <div className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium text-green-800">Taxa Média de Acerto</span>
              </div>
              <p className="text-2xl font-bold text-green-900">{averageDifficulty.toFixed(1)}%</p>
            </div>
            
            <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-purple-600" />
                <span className="text-sm font-medium text-purple-800">Em Tendência</span>
              </div>
              <p className="text-2xl font-bold text-purple-900">{trendingPlayers.length}</p>
            </div>
          </div>

          <Tabs defaultValue="most-recognized" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="most-recognized" className="flex items-center gap-2">
                <TrendingUp size={16} />
                Mais Reconhecidos
              </TabsTrigger>
              <TabsTrigger value="least-recognized" className="flex items-center gap-2">
                <TrendingDown size={16} />
                Menos Reconhecidos
              </TabsTrigger>
              <TabsTrigger value="trending" className="flex items-center gap-2">
                <BarChart3 size={16} />
                Em Tendência
              </TabsTrigger>
            </TabsList>

            <TabsContent value="most-recognized">
              <PlayerTable 
                players={mostRecognized}
                title="Jogadores Mais Reconhecidos"
                icon={<TrendingUp className="h-5 w-5 text-green-600" />}
              />
            </TabsContent>

            <TabsContent value="least-recognized">
              <PlayerTable 
                players={leastRecognized}
                title="Jogadores Menos Reconhecidos"
                icon={<TrendingDown className="h-5 w-5 text-red-600" />}
              />
            </TabsContent>

            <TabsContent value="trending">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-purple-600" />
                    Jogadores em Tendência (últimos 7 dias)
                  </CardTitle>
                  <CardDescription>
                    Jogadores com mais tentativas recentes
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Jogador</TableHead>
                          <TableHead className="text-center">Tentativas Recentes</TableHead>
                          <TableHead className="text-center">Total Geral</TableHead>
                          <TableHead className="text-center">Taxa de Acerto</TableHead>
                          <TableHead className="text-center">Dificuldade</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {trendingPlayers.map((player, index) => (
                          <TableRow key={player.player_name}>
                            <TableCell className="font-medium">
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-500">#{index + 1}</span>
                                {player.player_name}
                              </div>
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge variant="outline" className="bg-purple-50">
                                {player.recent_attempts}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-center">{player.total_attempts}</TableCell>
                            <TableCell className="text-center">
                              <span className={`font-semibold ${
                                player.recognition_rate >= 70 ? 'text-green-600' :
                                player.recognition_rate >= 50 ? 'text-yellow-600' :
                                player.recognition_rate >= 30 ? 'text-orange-600' :
                                'text-red-600'
                              }`}>
                                {player.recognition_rate.toFixed(1)}%
                              </span>
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge 
                                variant={getDifficultyColor(player.difficulty_level)}
                                className="flex items-center gap-1 w-fit mx-auto"
                              >
                                {getDifficultyIcon(player.difficulty_level)}
                                {player.difficulty_level}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
});

PlayerPerformanceAnalysis.displayName = 'PlayerPerformanceAnalysis';
