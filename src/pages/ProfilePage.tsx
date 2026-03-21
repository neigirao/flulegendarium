import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { RootLayout } from '@/components/RootLayout';
import { SEOManager } from '@/components/seo/SEOManager';
import { TopNavigation } from '@/components/navigation/TopNavigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { useUserProfile } from '@/hooks/use-user-profile';
import { 
  User, Trophy, Target, Zap, Clock, TrendingUp, 
  Swords, ArrowLeft, Send, Inbox, CheckCircle, XCircle,
  BarChart3, Award
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { motion } from 'framer-motion';

const StatCard = ({ icon: Icon, label, value, subValue }: { 
  icon: React.ElementType; 
  label: string; 
  value: string | number;
  subValue?: string;
}) => (
  <Card className="hover:shadow-md transition-shadow">
    <CardContent className="p-4">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10">
          <Icon className="w-5 h-5 text-primary" />
        </div>
        <div>
          <p className="text-2xl font-display font-bold text-primary">{value}</p>
          <p className="text-sm text-muted-foreground font-body">{label}</p>
          {subValue && <p className="text-xs text-muted-foreground/70 font-body">{subValue}</p>}
        </div>
      </div>
    </CardContent>
  </Card>
);

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { stats, weeklyRanking, challenges, isLoading } = useUserProfile();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  if (authLoading || !user) {
    return (
      <RootLayout>
        <div className="min-h-screen flex items-center justify-center bg-tricolor-vertical-border safe-area-top safe-area-bottom">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
        </div>
      </RootLayout>
    );
  }

  const formatPlayTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  return (
    <>
      <SEOHead 
        title="Meu Perfil - Lendas do Flu"
        description="Veja suas estatísticas, histórico de desafios e evolução no ranking semanal."
      />
      <RootLayout>
        <TopNavigation />
        <div className="min-h-screen bg-tricolor-vertical-border pt-16 safe-area-top safe-area-bottom">
          <div className="container mx-auto px-4 py-8">
            {/* Header */}
            <div className="mb-8">
              <Button
                variant="outline"
                onClick={() => navigate(-1)}
                className="mb-4 flex items-center gap-2 touch-target"
              >
                <ArrowLeft className="w-4 h-4" />
                Voltar
              </Button>

              <div className="flex items-center gap-4">
                <div className="p-4 rounded-full bg-primary/10">
                  <User className="w-12 h-12 text-primary" />
                </div>
                <div>
                  <h1 className="text-display-title text-primary">
                    {user.user_metadata?.full_name || 'Tricolor'}
                  </h1>
                  <p className="text-muted-foreground font-body">{user.email}</p>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="mb-8">
              <h2 className="text-display-sm text-foreground mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Estatísticas Gerais
              </h2>
              
              {isLoading ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[...Array(8)].map((_, i) => (
                    <Card key={i} className="animate-pulse">
                      <CardContent className="p-4 h-20 bg-muted/20" />
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <StatCard icon={Trophy} label="Partidas" value={stats?.totalGames || 0} />
                  <StatCard icon={Award} label="Melhor Score" value={stats?.bestScore || 0} />
                  <StatCard icon={Target} label="Média" value={stats?.averageScore || 0} />
                  <StatCard icon={Zap} label="Maior Streak" value={stats?.maxStreak || 0} />
                  <StatCard icon={CheckCircle} label="Acertos" value={stats?.totalCorrectGuesses || 0} />
                  <StatCard 
                    icon={TrendingUp} 
                    label="Precisão" 
                    value={`${stats?.averageAccuracy || 0}%`} 
                  />
                  <StatCard 
                    icon={Clock} 
                    label="Tempo Total" 
                    value={formatPlayTime(stats?.totalPlayTime || 0)} 
                  />
                  <StatCard 
                    icon={Trophy} 
                    label="Pontos Totais" 
                    value={stats?.totalScore || 0} 
                  />
                </div>
              )}
            </div>

            {/* Tabs for Weekly Ranking and Challenges */}
            <Tabs defaultValue="ranking" className="space-y-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="ranking" className="flex items-center gap-2 font-display">
                  <TrendingUp className="w-4 h-4" />
                  Evolução Semanal
                </TabsTrigger>
                <TabsTrigger value="challenges" className="flex items-center gap-2 font-display">
                  <Swords className="w-4 h-4" />
                  Desafios
                </TabsTrigger>
              </TabsList>

              {/* Weekly Ranking Evolution */}
              <TabsContent value="ranking">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 font-display">
                      <TrendingUp className="w-5 h-5 text-primary" />
                      Evolução no Ranking Semanal
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="space-y-3">
                        {[...Array(4)].map((_, i) => (
                          <div key={i} className="h-12 bg-muted/20 rounded animate-pulse" />
                        ))}
                      </div>
                    ) : weeklyRanking && weeklyRanking.length > 0 ? (
                      <div className="space-y-2">
                        {weeklyRanking.map((week, index) => (
                          <motion.div
                            key={week.week}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-sm font-display text-muted-foreground w-16">
                                {week.week}
                              </span>
                              {week.rank ? (
                                <Badge variant="outline" className="font-display">
                                  #{week.rank}
                                </Badge>
                              ) : (
                                <Badge variant="secondary">Sem jogos</Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-4">
                              <span className="text-sm text-muted-foreground font-body">
                                {week.gamesPlayed} {week.gamesPlayed === 1 ? 'jogo' : 'jogos'}
                              </span>
                              <span className="font-display font-bold text-primary">
                                {week.score} pts
                              </span>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground font-body">
                        <TrendingUp className="w-12 h-12 mx-auto mb-3 opacity-30" />
                        <p>Nenhum dado de ranking ainda.</p>
                        <Button 
                          onClick={() => navigate('/selecionar-modo-jogo')} 
                          className="mt-4 touch-target font-display"
                        >
                          Começar a Jogar
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Challenges */}
              <TabsContent value="challenges">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Sent Challenges */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg font-display">
                        <Send className="w-5 h-5 text-primary" />
                        Desafios Enviados
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {isLoading ? (
                        <div className="space-y-2">
                          {[...Array(3)].map((_, i) => (
                            <div key={i} className="h-16 bg-muted/20 rounded animate-pulse" />
                          ))}
                        </div>
                      ) : challenges?.sent && challenges.sent.length > 0 ? (
                        <div className="space-y-2">
                          {challenges.sent.map((challenge) => (
                            <div 
                              key={challenge.id}
                              className="p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                            >
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-display truncate">
                                  {challenge.challenged_name || 'Aguardando...'}
                                </span>
                                <Badge 
                                  variant={challenge.status === 'completed' ? 'default' : 'secondary'}
                                  className={challenge.status === 'completed' 
                                    ? (challenge.challenger_score > (challenge.challenged_score || 0) 
                                      ? 'bg-green-500' 
                                      : 'bg-red-500')
                                    : ''
                                  }
                                >
                                  {challenge.status === 'completed' 
                                    ? (challenge.challenger_score > (challenge.challenged_score || 0) 
                                      ? 'Você ganhou!' 
                                      : 'Você perdeu')
                                    : 'Pendente'}
                                </Badge>
                              </div>
                              <div className="flex items-center justify-between text-sm text-muted-foreground font-body">
                                <span>Seu score: {challenge.challenger_score}</span>
                                {challenge.challenged_score && (
                                  <span>Score deles: {challenge.challenged_score}</span>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground/70 mt-1">
                                {format(new Date(challenge.created_at), "dd/MM/yyyy", { locale: ptBR })}
                              </p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-6 text-muted-foreground font-body">
                          <Send className="w-8 h-8 mx-auto mb-2 opacity-30" />
                          <p className="text-sm">Nenhum desafio enviado</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Received Challenges */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg font-display">
                        <Inbox className="w-5 h-5 text-primary" />
                        Desafios Recebidos
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {isLoading ? (
                        <div className="space-y-2">
                          {[...Array(3)].map((_, i) => (
                            <div key={i} className="h-16 bg-muted/20 rounded animate-pulse" />
                          ))}
                        </div>
                      ) : challenges?.received && challenges.received.length > 0 ? (
                        <div className="space-y-2">
                          {challenges.received.map((challenge) => (
                            <div 
                              key={challenge.id}
                              className="p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                            >
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-display truncate">
                                  {challenge.challenger_name}
                                </span>
                                <Badge 
                                  variant={challenge.status === 'completed' ? 'default' : 'secondary'}
                                  className={challenge.status === 'completed' 
                                    ? ((challenge.challenged_score || 0) > challenge.challenger_score 
                                      ? 'bg-green-500' 
                                      : 'bg-red-500')
                                    : ''
                                  }
                                >
                                  {challenge.status === 'completed' 
                                    ? ((challenge.challenged_score || 0) > challenge.challenger_score 
                                      ? 'Você ganhou!' 
                                      : 'Você perdeu')
                                    : 'Pendente'}
                                </Badge>
                              </div>
                              <div className="flex items-center justify-between text-sm text-muted-foreground font-body">
                                <span>Score a bater: {challenge.challenger_score}</span>
                                {challenge.challenged_score && (
                                  <span>Seu score: {challenge.challenged_score}</span>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground/70 mt-1">
                                {format(new Date(challenge.created_at), "dd/MM/yyyy", { locale: ptBR })}
                              </p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-6 text-muted-foreground font-body">
                          <Inbox className="w-8 h-8 mx-auto mb-2 opacity-30" />
                          <p className="text-sm">Nenhum desafio recebido</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>

            {/* CTA */}
            <div className="mt-8 text-center">
              <Button onClick={() => navigate('/social')} variant="outline" className="mr-2 touch-target font-display">
                <Swords className="w-4 h-4 mr-2" />
                Desafiar Amigos
              </Button>
              <Button onClick={() => navigate('/selecionar-modo-jogo')} className="touch-target font-display">
                <Trophy className="w-4 h-4 mr-2" />
                Jogar Agora
              </Button>
            </div>
          </div>
        </div>
      </RootLayout>
    </>
  );
};

export default ProfilePage;
