import React, { useEffect } from "react";
import { RootLayout } from "@/components/RootLayout";
import { SEOManager } from "@/components/seo/SEOManager";
import { GameModeCard } from "@/components/GameModeCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, LogIn, Trophy, Star, Settings, Shirt } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useFunnelAnalytics } from "@/hooks/use-funnel-analytics";
import { CoachMark, useOnboarding } from "@/components/onboarding";
import { DailyChallengeWidget } from "@/components/challenges";
import { TimerSelector } from "@/components/game-settings/TimerSelector";

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
      <DynamicSEO
        customTitle="Escolha seu Modo de Jogo - Quiz de Jogadores e Camisas | Lendas do Flu"
        customDescription="🎮 3 modos de quiz: Adaptativo, Por Década e Camisas Históricas. Teste seus conhecimentos sobre os ídolos do Fluminense!"
      />
      <RootLayout>
        <div data-testid="game-mode-page" className="min-h-screen bg-gradient-to-br from-secondary via-primary/80 to-secondary/90 relative overflow-hidden bg-tricolor-vertical-border">
          {/* Diagonal Stripe Pattern */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute inset-0 bg-gradient-to-br from-secondary/30 via-transparent to-primary/30 transform -skew-y-12"></div>
            <div className="absolute inset-0 bg-gradient-to-tl from-primary/20 via-transparent to-secondary/20 transform skew-y-12"></div>
          </div>
          
          <div className="relative z-10 container mx-auto px-4 pt-8 pb-8 safe-area-top">
            {/* Header with Back Button and Timer Settings */}
            <div className="flex items-center justify-between mb-8">
              <Button
                variant="outline"
                onClick={() => navigate('/')}
                className="flex items-center gap-2 bg-background/20 border-border/30 text-primary-foreground hover:bg-background/30 touch-target"
              >
                <ArrowLeft className="w-4 h-4" />
                Voltar ao Início
              </Button>
              
              {/* Timer Settings */}
              <div className="flex items-center gap-2">
                <Settings className="w-4 h-4 text-primary-foreground/70" />
                <TimerSelector compact className="bg-background/20 border-border/30 text-primary-foreground hover:bg-background/30" />
              </div>
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
                      className="bg-warning hover:bg-warning/90 text-warning-foreground font-bold whitespace-nowrap touch-target font-display tracking-wide"
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
              
              <h1 className="text-display-title text-primary-foreground mb-2 drop-shadow-lg">
                ESCOLHA SEU MODO DE JOGO
              </h1>
            </div>

            {/* Game Modes Grid */}
            <div className="max-w-6xl mx-auto mb-12">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Quiz Adaptativo com CoachMark */}
                <CoachMark
                  step="game-mode-selection"
                  title="Escolha um Modo de Jogo"
                  description="O Quiz Adaptativo ajusta a dificuldade conforme você joga. Recomendamos começar por aqui!"
                  position="top"
                >
                  <div className="bg-card/95 backdrop-blur-sm rounded-2xl p-6 shadow-xl relative h-full">
                    <div className="text-center mb-4">
                      <div className="w-14 h-14 mx-auto bg-primary rounded-full flex items-center justify-center mb-3">
                        <div className="w-7 h-7 border-4 border-primary-foreground rounded-full relative">
                          <div className="absolute top-0.5 right-0.5 w-1.5 h-1.5 bg-primary-foreground rounded-full"></div>
                        </div>
                      </div>
                      <h2 className="text-xl font-display text-primary mb-2">Quiz Adaptativo</h2>
                      <span className="inline-block bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-medium">
                        Adaptável
                      </span>
                    </div>
                    
                    <p className="text-muted-foreground text-center mb-4 text-sm font-body">
                      Sistema inteligente que se adapta ao seu nível de conhecimento
                    </p>
                    
                    <ul className="space-y-1.5 mb-6 text-sm">
                      <li className="flex items-center text-muted-foreground">
                        <span className="w-1.5 h-1.5 bg-primary rounded-full mr-2"></span>
                        Dificuldade ajusta automaticamente
                      </li>
                      <li className="flex items-center text-muted-foreground">
                        <span className="w-1.5 h-1.5 bg-primary rounded-full mr-2"></span>
                        Sistema de pontuação inteligente
                      </li>
                      <li className="flex items-center text-muted-foreground">
                        <span className="w-1.5 h-1.5 bg-primary rounded-full mr-2"></span>
                        Desafios personalizados
                      </li>
                    </ul>
                    
                    <Button 
                      data-testid="game-mode-adaptativo"
                      onClick={() => handleGameModeClick('adaptive', '/quiz-adaptativo')}
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-display py-2.5 text-base tracking-wide touch-target-lg"
                    >
                      JOGAR AGORA
                    </Button>
                  </div>
                </CoachMark>

                {/* Quiz por Década */}
                <div className="bg-card/95 backdrop-blur-sm rounded-2xl p-6 shadow-xl relative h-full">
                  <div className="text-center mb-4">
                    <div className="w-14 h-14 mx-auto bg-secondary rounded-full flex items-center justify-center mb-3">
                      <div className="text-secondary-foreground text-xl">🏆</div>
                    </div>
                    <h2 className="text-xl font-display text-primary mb-2">Quiz por Década</h2>
                    <span className="inline-block bg-secondary/10 text-secondary px-3 py-1 rounded-full text-xs font-medium">
                      Variável
                    </span>
                  </div>
                  
                  <p className="text-muted-foreground text-center mb-4 text-sm font-body">
                    Teste seus conhecimentos sobre jogadores de épocas específicas
                  </p>
                  
                  <ul className="space-y-1.5 mb-6 text-sm">
                    <li className="flex items-center text-muted-foreground">
                      <span className="w-1.5 h-1.5 bg-secondary rounded-full mr-2"></span>
                      Dos anos 70 até hoje
                    </li>
                    <li className="flex items-center text-muted-foreground">
                      <span className="w-1.5 h-1.5 bg-secondary rounded-full mr-2"></span>
                      Lendas de cada época
                    </li>
                    <li className="flex items-center text-muted-foreground">
                      <span className="w-1.5 h-1.5 bg-secondary rounded-full mr-2"></span>
                      História tricolor completa
                    </li>
                  </ul>
                  
                  <Button 
                    data-testid="game-mode-decada"
                    onClick={() => handleGameModeClick('decade', '/quiz-decada')}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-display py-2.5 text-base tracking-wide touch-target-lg"
                  >
                    JOGAR AGORA
                  </Button>
                </div>

                {/* Quiz das Camisas */}
                <div className="bg-card/95 backdrop-blur-sm rounded-2xl p-6 shadow-xl relative h-full">
                  <div className="absolute top-3 right-3">
                    <span className="bg-warning text-warning-foreground text-xs px-2 py-0.5 rounded-full font-bold">POPULAR</span>
                  </div>
                  
                  <div className="text-center mb-4">
                    <div className="w-14 h-14 mx-auto bg-accent rounded-full flex items-center justify-center mb-3">
                      <Shirt className="w-7 h-7 text-accent-foreground" />
                    </div>
                    <h2 className="text-xl font-display text-primary mb-2">Quiz das Camisas</h2>
                    <span className="inline-block bg-accent/10 text-accent px-3 py-1 rounded-full text-xs font-medium">
                      Histórico
                    </span>
                  </div>
                  
                  <p className="text-muted-foreground text-center mb-4 text-sm font-body">
                    Adivinhe o ano das camisas históricas do Fluminense
                  </p>
                  
                  <ul className="space-y-1.5 mb-6 text-sm">
                    <li className="flex items-center text-muted-foreground">
                      <span className="w-1.5 h-1.5 bg-accent rounded-full mr-2"></span>
                      Camisas desde 1902
                    </li>
                    <li className="flex items-center text-muted-foreground">
                      <span className="w-1.5 h-1.5 bg-accent rounded-full mr-2"></span>
                      Uniformes históricos
                    </li>
                    <li className="flex items-center text-muted-foreground">
                      <span className="w-1.5 h-1.5 bg-accent rounded-full mr-2"></span>
                      Pontuação por aproximação
                    </li>
                  </ul>
                  
                  <Button 
                    data-testid="game-mode-camisas"
                    onClick={() => handleGameModeClick('jersey', '/quiz-camisas')}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-display py-2.5 text-base tracking-wide touch-target-lg"
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
                    <h3 className="text-display-sm text-warning mb-3">
                      DICA PARA TRICOLORES
                    </h3>
                    <p className="text-primary-foreground/90 leading-relaxed font-body">
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