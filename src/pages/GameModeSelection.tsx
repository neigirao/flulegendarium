import React, { useEffect } from "react";
import { RootLayout } from "@/components/RootLayout";
import { SEOManager } from "@/components/seo/SEOManager";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, LogIn, Trophy, Star, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useAnalytics } from "@/hooks/analytics";


// Custom SVG Icons
const BrainIcon = () => (
  <svg viewBox="0 0 48 48" fill="none" className="w-12 h-12">
    <circle cx="24" cy="24" r="22" stroke="currentColor" strokeWidth="2" fill="none" />
    <path d="M24 10c-4 0-7 2-8 5-2 0-4 2-4 5s2 5 4 5c0 3 3 6 6 6h4c3 0 6-3 6-6 2 0 4-2 4-5s-2-5-4-5c-1-3-4-5-8-5z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" fill="none" />
    <path d="M24 10v21M18 18h12M17 24h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
  </svg>
);

const CalendarIcon = () => (
  <svg viewBox="0 0 48 48" fill="none" className="w-12 h-12">
    <rect x="6" y="10" width="36" height="32" rx="4" stroke="currentColor" strokeWidth="2" fill="none" />
    <path d="M6 20h36" stroke="currentColor" strokeWidth="2" />
    <path d="M16 6v8M32 6v8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <rect x="12" y="26" width="6" height="5" rx="1" fill="currentColor" opacity="0.3" />
    <rect x="21" y="26" width="6" height="5" rx="1" fill="currentColor" opacity="0.3" />
    <rect x="30" y="26" width="6" height="5" rx="1" fill="currentColor" opacity="0.3" />
    <rect x="12" y="34" width="6" height="5" rx="1" fill="currentColor" opacity="0.2" />
    <rect x="21" y="34" width="6" height="5" rx="1" fill="currentColor" opacity="0.2" />
  </svg>
);

const ShirtIcon = () => (
  <svg viewBox="0 0 48 48" fill="none" className="w-12 h-12">
    <path d="M16 6L6 14v8l6-2v22h24V20l6 2v-8L32 6h-4c0 2-2 4-4 4s-4-2-4-4h-4z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" fill="none" />
    <path d="M18 20v4M24 18v6M30 20v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
  </svg>
);

const GameModeSelection = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { trackFunnelPageView: trackPageView, trackGameModeClick, trackAuthPromptShown } = useAnalytics();

  useEffect(() => {
    trackPageView('game_selection');
  }, [trackPageView]);

  const handleGameModeClick = (mode: string, path: string) => {
    trackGameModeClick(mode);
    navigate(path);
  };

  const handleAuthClick = () => {
    trackAuthPromptShown('game_selection_banner');
    navigate('/auth');
  };

  const gameModes = [
    {
      id: 'adaptive',
      title: 'Advinhe o Jogador',
      description: 'Sistema inteligente que se adapta ao seu nível. Acerte para aumentar a dificuldade!',
      icon: BrainIcon,
      path: '/quiz-adaptativo',
      mode: 'adaptive',
      badge: 'Adaptável',
      iconColor: 'text-primary',
      iconBg: 'bg-primary/10',
      borderColor: 'border-primary/20',
    },
    {
      id: 'decade',
      title: 'Advinhe o Jogador por Década',
      description: 'Escolha uma era do Fluminense e teste seus conhecimentos sobre os ídolos de cada época.',
      icon: CalendarIcon,
      path: '/quiz-decada',
      mode: 'decade',
      badge: '6 décadas',
      iconColor: 'text-secondary',
      iconBg: 'bg-secondary/10',
      borderColor: 'border-secondary/20',
    },
    {
      id: 'jersey',
      title: 'Quiz das Camisas',
      description: 'Veja uma camisa histórica e escolha o ano correto entre 3 opções!',
      icon: ShirtIcon,
      path: '/quiz-camisas',
      mode: 'jersey',
      badge: 'NOVO!',
      badgeColor: 'bg-warning text-warning-foreground',
      iconColor: 'text-gold',
      iconBg: 'bg-gold/10',
      borderColor: 'border-gold/30',
    },
  ];

  return (
    <>
      <SEOManager
        title="Escolha seu Modo de Jogo - Quiz de Jogadores e Camisas | Lendas do Flu"
        description="🎮 3 modos de quiz: Adaptativo, Por Década e Camisas Históricas. Teste seus conhecimentos sobre os ídolos do Fluminense!"
        schema="Game"
      />
      <RootLayout>
        <div data-testid="game-mode-page" className="min-h-screen page-warm bg-tricolor-vertical-border relative overflow-hidden">
          <div className="relative z-10 container mx-auto px-4 pt-8 pb-8 safe-area-top">
            {/* Header with Back Button and Timer Settings */}
            <div className="flex items-center justify-between mb-8">
              <Button
                variant="outline"
                onClick={() => navigate('/')}
                className="flex items-center gap-2 touch-target"
              >
                <ArrowLeft className="w-4 h-4" />
                Voltar ao Início
              </Button>
              
            </div>

            {/* Login Banner */}
            {!user && (
              <Card className="bg-card border border-gold/30 shadow-md mb-8">
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-warning/10 rounded-full flex items-center justify-center">
                        <Trophy className="w-6 h-6 text-warning" />
                      </div>
                      <div className="text-center sm:text-left">
                        <p className="text-foreground font-bold">Crie sua conta e desbloqueie conquistas!</p>
                        <p className="text-muted-foreground text-sm">Salve sua pontuação automaticamente no ranking</p>
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
                <p className="text-muted-foreground text-lg">
                  👋 Olá, <span className="font-bold text-primary">{user.user_metadata?.full_name || 'Tricolor'}</span>!
                </p>
                <p className="text-muted-foreground text-sm flex items-center justify-center gap-2">
                  <Star className="w-4 h-4 text-warning" />
                  Sua pontuação será salva automaticamente no ranking
                </p>
              </div>
            )}

            {/* Title */}
            <div className="text-center mb-10">
              <h1 className="text-display-title text-primary mb-2 drop-shadow-sm">
                ESCOLHA SEU MODO DE JOGO
              </h1>
            </div>

            {/* Game Mode Cards — Vertical Stack */}
            <div className="max-w-xl mx-auto space-y-4 mb-12">
              {gameModes.map((gm) => {
                const Icon = gm.icon;
                return (
                  <Card
                    key={gm.id}
                    className={`bg-card border ${gm.borderColor} shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer group`}
                    onClick={() => handleGameModeClick(gm.mode, gm.path)}
                    data-testid={`game-mode-${gm.id}`}
                  >
                    <CardContent className="p-5 flex items-center gap-5">
                      {/* Icon */}
                      <div className={`shrink-0 w-16 h-16 rounded-full ${gm.iconBg} flex items-center justify-center ${gm.iconColor} group-hover:scale-110 transition-transform`}>
                        <Icon />
                      </div>

                      {/* Text */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h2 className="font-display text-lg text-foreground">{gm.title}</h2>
                          {gm.badge && (
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${gm.badgeColor || 'bg-muted text-muted-foreground'}`}>
                              {gm.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground font-body line-clamp-2">
                          {gm.description}
                        </p>
                      </div>

                      {/* Arrow */}
                      <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0 group-hover:translate-x-1 group-hover:text-primary transition-all" />
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      </RootLayout>
    </>
  );
};

export default GameModeSelection;
