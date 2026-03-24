import React, { useEffect } from "react";
import { RootLayout } from "@/components/RootLayout";
import { SEOManager } from "@/components/seo/SEOManager";
import { Button } from "@/components/ui/button";
import { ArrowLeft, LogIn, Trophy, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useAnalytics } from "@/hooks/analytics";
import { CoachMark, useOnboarding } from "@/components/onboarding";
import { TimerSelector } from "@/components/game-settings/TimerSelector";

// Custom SVG Icons
const BrainIcon = () => (
  <svg viewBox="0 0 64 64" className="w-10 h-10" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M32 8C24 8 18 14 18 20c-4 2-6 6-6 10 0 4 2 8 6 10 0 6 4 10 8 12 2 1 4 2 6 2s4-1 6-2c4-2 8-6 8-12 4-2 6-6 6-10 0-4-2-8-6-10 0-6-6-12-14-12z" stroke="hsl(351 98% 24%)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M32 8v48M24 20c2 2 6 4 8 4s6-2 8-4M22 32c2 2 6 3 10 3s8-1 10-3M26 44c2 1 4 2 6 2s4-1 6-2" stroke="hsl(351 98% 24%)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.6"/>
  </svg>
);

const CalendarIcon = () => (
  <svg viewBox="0 0 64 64" className="w-10 h-10" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="10" y="14" width="44" height="40" rx="4" stroke="hsl(351 98% 24%)" strokeWidth="2.5"/>
    <path d="M10 26h44" stroke="hsl(351 98% 24%)" strokeWidth="2.5"/>
    <path d="M22 8v12M42 8v12" stroke="hsl(351 98% 24%)" strokeWidth="2.5" strokeLinecap="round"/>
    <rect x="18" y="32" width="6" height="6" rx="1" fill="hsl(351 98% 24%)" opacity="0.3"/>
    <rect x="29" y="32" width="6" height="6" rx="1" fill="hsl(351 98% 24%)" opacity="0.5"/>
    <rect x="40" y="32" width="6" height="6" rx="1" fill="hsl(351 98% 24%)" opacity="0.3"/>
    <rect x="18" y="42" width="6" height="6" rx="1" fill="hsl(351 98% 24%)" opacity="0.5"/>
    <rect x="29" y="42" width="6" height="6" rx="1" fill="hsl(351 98% 24%)" opacity="0.3"/>
    <rect x="40" y="42" width="6" height="6" rx="1" fill="hsl(351 98% 24%)" opacity="0.5"/>
  </svg>
);

const JerseyIcon = () => (
  <svg viewBox="0 0 64 64" className="w-10 h-10" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 12L10 20v8l6 2v22h32V30l6-2v-8L44 12c0 0-2 6-12 6S20 12 20 12z" stroke="hsl(351 98% 24%)" strokeWidth="2.5" strokeLinejoin="round"/>
    <path d="M24 12c0 0 2 4 8 4s8-4 8-4" stroke="hsl(351 98% 24%)" strokeWidth="2" strokeLinecap="round" opacity="0.6"/>
    <path d="M28 30h8M32 26v8" stroke="hsl(351 98% 24%)" strokeWidth="2" strokeLinecap="round" opacity="0.4"/>
  </svg>
);

const GameModeSelection = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { trackFunnelPageView: trackPageView, trackGameModeClick, trackAuthPromptShown } = useAnalytics();
  const { isOnboardingActive, goToStep } = useOnboarding();

  useEffect(() => {
    trackPageView('game_selection');
  }, [trackPageView]);

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
      <SEOManager
        title="Escolha seu Modo de Jogo - Quiz de Jogadores e Camisas | Lendas do Flu"
        description="🎮 3 modos de quiz: Adaptativo, Por Década e Camisas Históricas. Teste seus conhecimentos sobre os ídolos do Fluminense!"
        schema="Game"
      />
      <RootLayout>
        <div data-testid="game-mode-page" className="min-h-screen relative overflow-hidden" style={{ background: '#F5F0E8' }}>
          {/* Watermark */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-[500px] h-[500px] opacity-[0.04] text-primary">
              <svg viewBox="0 0 200 200" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <circle cx="100" cy="100" r="95" stroke="currentColor" strokeWidth="3" fill="none"/>
                <text x="100" y="115" textAnchor="middle" fontSize="48" fontWeight="bold" fill="currentColor">FFC</text>
              </svg>
            </div>
          </div>

          <div className="relative z-10 container mx-auto px-4 pt-6 pb-8 safe-area-top max-w-xl">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <Button
                variant="outline"
                onClick={() => navigate('/')}
                className="flex items-center gap-2 border-primary/20 text-primary hover:bg-primary/5 touch-target"
              >
                <ArrowLeft className="w-4 h-4" />
                Voltar
              </Button>

              <div className="flex items-center gap-2">
                <Settings className="w-4 h-4 text-primary/50" />
                <TimerSelector compact className="border-primary/20 text-primary hover:bg-primary/5" />
              </div>
            </div>

            {/* Login Banner */}
            {!user && (
              <div className="rounded-xl p-4 mb-6 border" style={{ background: '#FFF8E7', borderColor: '#C4A265' }}>
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: '#C4A26520' }}>
                      <Trophy className="w-5 h-5" style={{ color: '#C4A265' }} />
                    </div>
                    <div className="text-center sm:text-left">
                      <p className="text-primary font-bold text-sm">Crie sua conta e desbloqueie conquistas!</p>
                      <p className="text-primary/60 text-xs">Salve sua pontuação no ranking</p>
                    </div>
                  </div>
                  <Button
                    onClick={handleAuthClick}
                    size="sm"
                    className="bg-primary hover:bg-primary/90 text-primary-foreground font-display tracking-wide whitespace-nowrap touch-target"
                  >
                    <LogIn className="w-4 h-4 mr-1.5" />
                    Criar Conta
                  </Button>
                </div>
              </div>
            )}

            {/* Title */}
            <h1 className="text-center text-2xl sm:text-3xl font-display text-primary mb-8 tracking-wide">
              ESCOLHA SEU MODO DE JOGO
            </h1>

            {/* Game Mode Cards - Vertical Stack */}
            <div className="flex flex-col gap-4 mb-8">
              {/* Quiz Adaptativo */}
              <CoachMark
                step="game-mode-selection"
                title="Escolha um Modo de Jogo"
                description="O Quiz Adaptativo ajusta a dificuldade conforme você joga. Recomendamos começar por aqui!"
                position="top"
              >
                <div
                  className="bg-card rounded-2xl p-5 shadow-sm flex items-center gap-5 border-2 transition-all hover:shadow-md hover:-translate-y-0.5"
                  style={{ borderColor: '#C4A265' }}
                >
                  <div className="shrink-0 w-16 h-16 rounded-full flex items-center justify-center border-2" style={{ background: '#F5F0E8', borderColor: '#C4A265' }}>
                    <BrainIcon />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-lg font-display text-primary mb-1">Quiz Adaptativo</h2>
                    <p className="text-muted-foreground text-sm mb-3 leading-snug">
                      Dificuldade que se adapta ao seu nível de conhecimento tricolor
                    </p>
                    <Button
                      data-testid="game-mode-adaptativo"
                      onClick={() => handleGameModeClick('adaptive', '/quiz-adaptativo')}
                      className="bg-primary hover:bg-primary/90 text-primary-foreground font-display text-sm tracking-wide touch-target h-9 px-6"
                    >
                      Jogar agora
                    </Button>
                  </div>
                </div>
              </CoachMark>

              {/* Quiz por Década */}
              <div
                className="bg-card rounded-2xl p-5 shadow-sm flex items-center gap-5 border-2 transition-all hover:shadow-md hover:-translate-y-0.5"
                style={{ borderColor: '#C4A265' }}
              >
                <div className="shrink-0 w-16 h-16 rounded-full flex items-center justify-center border-2" style={{ background: '#F5F0E8', borderColor: '#C4A265' }}>
                  <CalendarIcon />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg font-display text-primary mb-1">Quiz por Década</h2>
                  <p className="text-muted-foreground text-sm mb-3 leading-snug">
                    Teste seus conhecimentos sobre jogadores de épocas específicas
                  </p>
                  <Button
                    data-testid="game-mode-decada"
                    onClick={() => handleGameModeClick('decade', '/quiz-decada')}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground font-display text-sm tracking-wide touch-target h-9 px-6"
                  >
                    Jogar agora
                  </Button>
                </div>
              </div>

              {/* Quiz das Camisas */}
              <div
                className="bg-card rounded-2xl p-5 shadow-sm flex items-center gap-5 border-2 relative transition-all hover:shadow-md hover:-translate-y-0.5"
                style={{ borderColor: '#C4A265' }}
              >
                <span className="absolute top-3 right-3 text-xs px-2 py-0.5 rounded-full font-bold text-primary-foreground" style={{ background: '#C4A265' }}>
                  NOVO!
                </span>
                <div className="shrink-0 w-16 h-16 rounded-full flex items-center justify-center border-2" style={{ background: '#F5F0E8', borderColor: '#C4A265' }}>
                  <JerseyIcon />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg font-display text-primary mb-1">Quiz das Camisas</h2>
                  <p className="text-muted-foreground text-sm mb-3 leading-snug">
                    Adivinhe o ano das camisas históricas do Fluminense
                  </p>
                  <Button
                    data-testid="game-mode-camisas"
                    onClick={() => handleGameModeClick('jersey', '/quiz-camisas')}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground font-display text-sm tracking-wide touch-target h-9 px-6"
                  >
                    Jogar agora
                  </Button>
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
