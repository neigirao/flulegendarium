import { useState, useEffect } from 'react';
import { RootLayout } from '@/components/RootLayout';
import { SEOHead } from '@/components/SEOHead';
import { TopNavigation } from '@/components/navigation/TopNavigation';
import { Button } from '@/components/ui/button';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Users, ArrowLeft } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { WeeklyLeaderboard } from '@/components/social/WeeklyLeaderboard';
import { ChallengeSystem, decodeChallengeLink } from '@/components/social/ChallengeSystem';
import { ChallengeAcceptCard } from '@/components/social/ChallengeAcceptCard';
import { AnimatePresence } from 'framer-motion';

interface ChallengeData {
  challengerId: string;
  challengerName: string;
  score: number;
  gameMode: 'adaptive' | 'decade';
  difficulty?: string;
  timestamp: number;
}

const SocialPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [challenge, setChallenge] = useState<ChallengeData | null>(null);
  
  // Get last game score from session storage
  const lastGameData = sessionStorage.getItem('last_game_result');
  const parsedGameData = lastGameData ? JSON.parse(lastGameData) : null;

  useEffect(() => {
    const challengeParam = searchParams.get('challenge');
    if (challengeParam) {
      const decoded = decodeChallengeLink(challengeParam);
      if (decoded) {
        setChallenge(decoded);
      }
    }
  }, [searchParams]);

  const handleDismissChallenge = () => {
    setChallenge(null);
    setSearchParams({});
  };

  return (
    <>
      <SEOHead 
        title="Social - Lendas do Flu"
        description="Interaja com outros fãs do Fluminense, veja o ranking semanal e desafie seus amigos!"
      />
      <RootLayout>
        <TopNavigation />
        <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 pt-16">
          <div className="container mx-auto px-4 py-8">
            {/* Header */}
            <div className="mb-8">
              <Button
                variant="outline"
                onClick={() => navigate(-1)}
                className="mb-4 flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Voltar
              </Button>
              
              <div className="text-center">
                <h1 className="text-4xl font-bold text-primary mb-4">
                  Comunidade Tricolor
                </h1>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                  Veja o ranking semanal, desafie seus amigos e celebre o conhecimento tricolor!
                </p>
              </div>
            </div>

            {/* Challenge Accept Card */}
            <AnimatePresence>
              {challenge && (
                <div className="max-w-md mx-auto mb-8">
                  <ChallengeAcceptCard 
                    challenge={challenge} 
                    onDismiss={handleDismissChallenge} 
                  />
                </div>
              )}
            </AnimatePresence>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
              {/* Weekly Leaderboard */}
              <WeeklyLeaderboard />
              
              {/* Challenge System */}
              <ChallengeSystem 
                lastScore={parsedGameData?.score}
                gameMode={parsedGameData?.gameMode || 'adaptive'}
                difficulty={parsedGameData?.difficulty}
              />
            </div>

            {/* Call to Action */}
            <div className="text-center">
              <Card className="max-w-2xl mx-auto bg-gradient-to-r from-primary/10 to-secondary/10">
                <CardContent className="p-8">
                  <Users className="w-16 h-16 text-primary mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-primary mb-4">
                    Junte-se à Comunidade!
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    Jogue para aparecer no ranking semanal e desafiar seus amigos tricolores.
                  </p>
                  <div className="space-y-3">
                    <Button 
                      onClick={() => navigate('/selecionar-modo-jogo')}
                      className="w-full"
                    >
                      Começar a Jogar
                    </Button>
                    <Button 
                      onClick={() => navigate('/auth')}
                      variant="outline"
                      className="w-full"
                    >
                      Fazer Login
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </RootLayout>
    </>
  );
};

export default SocialPage;
