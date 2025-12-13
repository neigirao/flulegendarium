import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { RootLayout } from '@/components/RootLayout';
import { SEOHead } from '@/components/SEOHead';
import { TopNavigation } from '@/components/navigation/TopNavigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/hooks/useAuth';
import { useDailyChallengesModule } from '@/hooks/use-daily-challenges-module';
import { ChallengeCard } from '@/components/challenges/ChallengeCard';
import { 
  Calendar, ArrowLeft, Trophy, Target, Flame, 
  CheckCircle, Clock, Sparkles 
} from 'lucide-react';
import { motion } from 'framer-motion';

const DailyChallengesPage = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { challenges, isLoading } = useDailyChallengesModule();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  const completedCount = challenges.filter(c => c.progress?.is_completed).length;
  const totalChallenges = challenges.length;
  const totalRewards = challenges
    .filter(c => c.progress?.is_completed)
    .reduce((sum, c) => sum + (c.reward_points || 0), 0);
  const potentialRewards = challenges.reduce((sum, c) => sum + (c.reward_points || 0), 0);
  const progressPercent = totalChallenges > 0 ? (completedCount / totalChallenges) * 100 : 0;

  if (authLoading || !user) {
    return (
      <RootLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
        </div>
      </RootLayout>
    );
  }

  return (
    <>
      <SEOHead 
        title="Desafios Diários - Lendas do Flu"
        description="Complete desafios diários e ganhe pontos extras no Lendas do Flu!"
      />
      <RootLayout>
        <TopNavigation />
        <div className="min-h-screen bg-tricolor-vertical-border safe-area-top safe-area-bottom pt-16">
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

              <div className="flex items-center gap-4 mb-6">
                <div className="p-4 rounded-full bg-primary/10">
                  <Calendar className="w-10 h-10 text-primary" />
                </div>
                <div>
                  <h1 className="font-display text-display-title text-primary">
                    Desafios Diários
                  </h1>
                  <p className="font-body text-muted-foreground">
                    Complete desafios para ganhar pontos extras!
                  </p>
                </div>
              </div>

              {/* Progress Overview */}
              <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
                <CardContent className="p-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 font-display text-display-subtitle text-primary">
                        <CheckCircle className="w-6 h-6" />
                        {completedCount}
                      </div>
                      <p className="font-body text-sm text-muted-foreground">Completos</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 font-display text-display-subtitle text-muted-foreground">
                        <Target className="w-6 h-6" />
                        {totalChallenges - completedCount}
                      </div>
                      <p className="font-body text-sm text-muted-foreground">Restantes</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 font-display text-display-subtitle text-success">
                        <Trophy className="w-6 h-6" />
                        {totalRewards}
                      </div>
                      <p className="font-body text-sm text-muted-foreground">Pontos Ganhos</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 font-display text-display-subtitle text-warning">
                        <Sparkles className="w-6 h-6" />
                        {potentialRewards - totalRewards}
                      </div>
                      <p className="font-body text-sm text-muted-foreground">Pontos Disponíveis</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm font-body">
                      <span className="text-muted-foreground">Progresso do Dia</span>
                      <span className="font-medium text-foreground">{completedCount}/{totalChallenges}</span>
                    </div>
                    <Progress value={progressPercent} className="h-3" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Challenges List */}
            <div className="space-y-4">
              <h2 className="font-display text-display-sm flex items-center gap-2">
                <Flame className="w-5 h-5 text-warning" />
                Desafios Ativos
              </h2>
              
              {isLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <Card key={i} className="animate-pulse">
                      <CardContent className="p-4 h-24 bg-muted/20" />
                    </Card>
                  ))}
                </div>
              ) : challenges.length > 0 ? (
                <motion.div 
                  className="space-y-4"
                  initial="hidden"
                  animate="visible"
                  variants={{
                    visible: { transition: { staggerChildren: 0.1 } }
                  }}
                >
                  {challenges.map((challenge, index) => (
                    <motion.div
                      key={challenge.id}
                      variants={{
                        hidden: { opacity: 0, y: 20 },
                        visible: { opacity: 1, y: 0 }
                      }}
                    >
                      <ChallengeCard
                        id={challenge.id}
                        title={challenge.title}
                        description={challenge.description}
                        challengeType={challenge.challenge_type}
                        targetValue={challenge.target_value}
                        currentProgress={challenge.progress?.current_progress || 0}
                        rewardPoints={challenge.reward_points || 0}
                        isCompleted={challenge.progress?.is_completed || false}
                      />
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <Card className="border-dashed border-primary/30">
                  <CardContent className="p-12 text-center">
                    <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-30" />
                    <h3 className="font-display text-display-sm text-muted-foreground mb-2">
                      Nenhum desafio ativo
                    </h3>
                    <p className="font-body text-sm text-muted-foreground/70 mb-4">
                      Volte mais tarde para novos desafios diários!
                    </p>
                    <Button onClick={() => navigate('/selecionar-modo-jogo')} className="touch-target-lg">
                      <Trophy className="w-4 h-4 mr-2" />
                      Jogar Agora
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Tips */}
            <Card className="mt-8 border-primary/20">
              <CardHeader>
                <CardTitle className="font-display text-display-sm flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary" />
                  Dicas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 font-body text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-success mt-0.5 shrink-0" />
                    Os desafios são renovados diariamente à meia-noite.
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-success mt-0.5 shrink-0" />
                    Complete todos os desafios para maximizar seus pontos.
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-success mt-0.5 shrink-0" />
                    O progresso é atualizado automaticamente durante o jogo.
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* CTA */}
            <div className="mt-8 text-center">
              <Button onClick={() => navigate('/selecionar-modo-jogo')} size="lg" className="touch-target-lg">
                <Trophy className="w-5 h-5 mr-2" />
                Começar a Jogar
              </Button>
            </div>
          </div>
        </div>
      </RootLayout>
    </>
  );
};

export default DailyChallengesPage;
