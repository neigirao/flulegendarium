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
import { useLastRankingScore } from '@/hooks/use-last-ranking-score';
import { useAuth } from '@/hooks/useAuth';

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
  const [challengeLink, setChallengeLink] = useState<string>('');
  const { user } = useAuth();
  
  // Get last ranking score from database for logged-in users
  const { data: lastRankingScore, isLoading: isLoadingRankingScore } = useLastRankingScore();
  
  // Get last game score from session storage as fallback
  const lastGameData = sessionStorage.getItem('last_game_result');
  const parsedGameData = lastGameData ? JSON.parse(lastGameData) : null;

  // Determine which score to use (prefer sessionStorage for freshness, fallback to ranking)
  const effectiveScore = parsedGameData?.score ?? lastRankingScore?.score;
  const effectiveGameMode = parsedGameData?.gameMode ?? lastRankingScore?.gameMode ?? 'adaptive';
  const effectiveDifficulty = parsedGameData?.difficulty ?? lastRankingScore?.difficulty;

  useEffect(() => {
    const challengeParam = searchParams.get('challenge');
    if (challengeParam) {
      const decoded = decodeChallengeLink(challengeParam);
      if (decoded) {
        setChallenge(decoded);
        setChallengeLink(`${window.location.origin}/social?challenge=${challengeParam}`);
      }
    }
  }, [searchParams]);

  const handleDismissChallenge = () => {
    setChallenge(null);
    setChallengeLink('');
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
              
              <div className="text-center">
                <h1 className="text-display-hero text-primary mb-4">
                  Comunidade Tricolor
                </h1>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-body">
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
                    challengeLink={challengeLink}
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
                lastScore={effectiveScore}
                gameMode={effectiveGameMode}
                difficulty={effectiveDifficulty}
                isLoadingScore={!user ? false : isLoadingRankingScore}
              />
            </div>

            {/* Call to Action */}
            <div className="text-center">
              <Card className="max-w-2xl mx-auto bg-gradient-to-r from-primary/10 to-secondary/10">
                <CardContent className="p-8">
                  <Users className="w-16 h-16 text-primary mx-auto mb-4" />
                  <h3 className="text-display-subtitle text-primary mb-4">
                    Junte-se à Comunidade!
                  </h3>
                  <p className="text-muted-foreground mb-6 font-body">
                    Jogue para aparecer no ranking semanal e desafiar seus amigos tricolores.
                  </p>
                  <div className="space-y-3">
                    <Button 
                      onClick={() => navigate('/selecionar-modo-jogo')}
                      className="w-full touch-target-lg font-display"
                    >
                      Começar a Jogar
                    </Button>
                    {!user && (
                      <Button 
                        onClick={() => navigate('/auth')}
                        variant="outline"
                        className="w-full touch-target font-display"
                      >
                        Fazer Login
                      </Button>
                    )}
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
