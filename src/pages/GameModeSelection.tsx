import React, { useEffect } from "react";
import { RootLayout } from "@/components/RootLayout";
import { SEOHead } from "@/components/SEOHead";
import { GameModeCard } from "@/components/GameModeCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, LogIn, Trophy, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useFunnelAnalytics } from "@/hooks/use-funnel-analytics";
import { CoachMark, useOnboarding } from "@/components/onboarding";
import { DailyChallengeWidget } from "@/components/challenges";

const GameModeSelection = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { trackPageView, trackGameModeClick, trackAuthPromptShown } = useFunnelAnalytics();
  const { isOnboardingActive, goToStep } = useOnboarding();

  // Track page view on mount
  useEffect(() => {
    trackPageView('game_selection');
  }, [trackPageView]);

  // Ativar step de seleção de modo quando entrar na página
  useEffect(() => {
    if (isOnboardingActive) {
      goToStep('game-mode-selection');
    }
  }, [isOnboardingActive, goToStep]);

  const handleGameModeClick = (mode: string, path: string) => {
    trackGameModeClick(mode);
    navigate(path);
  };

  const handleAuthClick = () => {
    trackAuthPromptShown('game_selection_banner');
    navigate('/auth');
  };

  return (
    <>
      <SEOHead 
        title="Escolha seu Modo de Jogo - Lendas do Flu"
        description="🎮 Escolha entre diferentes modos de jogo: Quiz Adaptativo ou Quiz por Década. Teste seus conhecimentos sobre o Fluminense!"
        keywords="modos de jogo fluminense, quiz adaptativo, quiz por década, tricolor"
        url="https://flulegendarium.lovable.app/selecionar-modo-jogo"
      />
      <RootLayout>
        <div className="min-h-screen bg-gradient-to-br from-secondary via-primary/80 to-secondary/90 relative overflow-hidden">
          {/* Diagonal Stripe Pattern */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute inset-0 bg-gradient-to-br from-secondary/30 via-transparent to-primary/30 transform -skew-y-12"></div>
            <div className="absolute inset-0 bg-gradient-to-tl from-primary/20 via-transparent to-secondary/20 transform skew-y-12"></div>
          </div>
          
          <div className="relative z-10 container mx-auto px-4 pt-8 pb-8">
            {/* Back Button */}
            <div className="mb-8">
              <Button
                variant="outline"
                onClick={() => navigate('/')}
                className="flex items-center gap-2 bg-background/20 border-border/30 text-primary-foreground hover:bg-background/30"
              >
                <ArrowLeft className="w-4 h-4" />
                Voltar ao Início
              </Button>
            </div>

            {/* Login Banner */}
            {!user && (
              <Card className="bg-gradient-to-r from-warning/20 to-warning/30 backdrop-blur-sm border-warning/30 mb-8">
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-warning/20 rounded-full flex items-center justify-center">
                        <Trophy className="w-6 h-6 text-warning" />
                      </div>
                      <div className="text-center sm:text-left">
                        <p className="text-primary-foreground font-bold">Crie sua conta e desbloqueie conquistas!</p>
                        <p className="text-primary-foreground/70 text-sm">Salve sua pontuação automaticamente no ranking</p>
                      </div>
                    </div>
                    <Button
                      onClick={handleAuthClick}
                      className="bg-warning hover:bg-warning/90 text-warning-foreground font-bold whitespace-nowrap"
                    >
                      <LogIn className="w-4 h-4 mr-2" />
                      Criar Conta Grátis
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Welcome Message for Logged Users */}
            {user && (
              <div className="text-center mb-6">
                <p className="text-primary-foreground/90 text-lg">
                  👋 Olá, <span className="font-bold text-warning">{user.user_metadata?.full_name || 'Tricolor'}</span>!
                </p>
                <p className="text-primary-foreground/70 text-sm flex items-center justify-center gap-2">
                  <Star className="w-4 h-4 text-warning" />
                  Sua pontuação será salva automaticamente no ranking
                </p>
              </div>
            )}

            {/* Daily Challenges Widget */}
            {user && (
              <div className="max-w-md mx-auto mb-8">
                <DailyChallengeWidget compact maxChallenges={2} />
              </div>
            )}
            {/* Shield Logo */}
            <div className="text-center mb-8">
              <div className="w-24 h-24 mx-auto bg-card/90 backdrop-blur-sm rounded-full flex items-center justify-center mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center">
                  <span className="text-3xl text-primary-foreground font-bold">?</span>
                </div>
              </div>
              
              <h1 className="text-4xl md:text-5xl font-bold text-primary-foreground mb-2 tracking-wide">
                ESCOLHA SEU MODO DE JOGO
              </h1>
            </div>

            {/* Game Modes Grid */}
            <div className="max-w-4xl mx-auto mb-12">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Quiz Adaptativo com CoachMark */}
                <CoachMark
                  step="game-mode-selection"
                  title="Escolha um Modo de Jogo"
                  description="O Quiz Adaptativo ajusta a dificuldade conforme você joga. Recomendamos começar por aqui!"
                  position="top"
                >
                  <div className="bg-card/95 backdrop-blur-sm rounded-2xl p-8 shadow-xl relative">
                    <div className="text-center mb-6">
                      <div className="w-16 h-16 mx-auto bg-primary rounded-full flex items-center justify-center mb-4">
                        <div className="w-8 h-8 border-4 border-primary-foreground rounded-full relative">
                          <div className="absolute top-1 right-1 w-2 h-2 bg-primary-foreground rounded-full"></div>
                        </div>
                      </div>
                      <h2 className="text-2xl font-bold text-primary mb-2">Quiz Adaptativo</h2>
                      <span className="inline-block bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">
                        Adaptável
                      </span>
                    </div>
                    
                    <p className="text-muted-foreground text-center mb-6">
                      Sistema inteligente que se adapta ao seu nível de conhecimento sobre o Fluminense
                    </p>
                    
                    <ul className="space-y-2 mb-8">
                      <li className="flex items-center text-muted-foreground">
                        <span className="w-2 h-2 bg-primary rounded-full mr-3"></span>
                        Dificuldade ajusta automaticamente
                      </li>
                      <li className="flex items-center text-muted-foreground">
                        <span className="w-2 h-2 bg-primary rounded-full mr-3"></span>
                        Sistema de pontuação inteligente
                      </li>
                      <li className="flex items-center text-muted-foreground">
                        <span className="w-2 h-2 bg-primary rounded-full mr-3"></span>
                        Desafios personalizados
                      </li>
                    </ul>
                    
                    <Button 
                      onClick={() => handleGameModeClick('adaptive', '/quiz-adaptativo')}
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3 text-lg"
                    >
                      JOGAR AGORA
                    </Button>
                  </div>
                </CoachMark>

                {/* Quiz por Década */}
                <div className="bg-card/95 backdrop-blur-sm rounded-2xl p-8 shadow-xl relative">
                  <div className="absolute top-4 right-4">
                    <span className="bg-secondary text-secondary-foreground text-xs px-3 py-1 rounded-full font-bold">NOVO</span>
                  </div>
                  
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 mx-auto bg-secondary rounded-full flex items-center justify-center mb-4">
                      <div className="text-secondary-foreground text-2xl">🏆</div>
                    </div>
                    <h2 className="text-2xl font-bold text-primary mb-2">Quiz por Década</h2>
                    <span className="inline-block bg-secondary/10 text-secondary px-3 py-1 rounded-full text-sm font-medium">
                      Variável
                    </span>
                  </div>
                  
                  <p className="text-muted-foreground text-center mb-6">
                    Teste seus conhecimentos sobre jogadores de épocas específicas do Fluminense
                  </p>
                  
                  <ul className="space-y-2 mb-8">
                    <li className="flex items-center text-muted-foreground">
                      <span className="w-2 h-2 bg-secondary rounded-full mr-3"></span>
                      Dos anos 70 até hoje
                    </li>
                    <li className="flex items-center text-muted-foreground">
                      <span className="w-2 h-2 bg-secondary rounded-full mr-3"></span>
                      Lendas de cada época
                    </li>
                    <li className="flex items-center text-muted-foreground">
                      <span className="w-2 h-2 bg-secondary rounded-full mr-3"></span>
                      História tricolor completa
                    </li>
                  </ul>
                  
                  <Button 
                    onClick={() => handleGameModeClick('decade', '/quiz-decada')}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3 text-lg"
                  >
                    JOGAR AGORA
                  </Button>
                </div>
              </div>
            </div>

            {/* Tip Section */}
            <div className="max-w-4xl mx-auto">
              <div className="bg-background/20 backdrop-blur-sm rounded-2xl p-8 border border-border/20">
                <div className="flex items-start gap-4">
                  <div className="text-3xl">💡</div>
                  <div>
                    <h3 className="text-xl font-bold text-warning mb-3">
                      DICA PARA TRICOLORES
                    </h3>
                    <p className="text-primary-foreground/90 leading-relaxed">
                      Cada modo oferece uma experiência única! O Quiz Adaptativo é perfeito para 
                      testar seu conhecimento geral, enquanto o Quiz por Década permite focar 
                      em épocas específicas da rica história do Fluminense.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </RootLayout>
    </>
  );
};

export default GameModeSelection;