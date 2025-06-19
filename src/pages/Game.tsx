
import React, { useEffect } from "react";
import { Loader as GameLoader } from "lucide-react";

import { SEOHead } from "@/components/SEOHead";
import { ErrorDisplay } from "@/components/guess-game/ErrorDisplay";
import { EmptyPlayersDisplay } from "@/components/guess-game/EmptyPlayersDisplay";
import { GameHeader } from "@/components/game/GameHeader";
import { GameContainer } from "@/components/guess-game/GameContainer";

import { useAuth } from "@/hooks/useAuth";
import { useAnalytics } from "@/hooks/use-analytics";
import { usePlayersData } from "@/hooks/use-players-data";
import { useDirectPlayerSelection } from "@/hooks/use-direct-player-selection";

const Game = () => {
  console.log("🎮 Game component iniciando...");
  
  const { user } = useAuth();
  const { trackGameStart, trackPageView, trackEvent } = useAnalytics();
  
  // Carregar dados dos jogadores
  const { players, isLoading, error } = usePlayersData();
  
  // Seleção direta de jogadores
  const { currentPlayer, selectRandomPlayer } = useDirectPlayerSelection(players);

  // Track page view
  useEffect(() => {
    trackPageView('/jogar-quiz-fluminense');
  }, [trackPageView]);

  console.log("📋 Estado do Game:", {
    playersCount: players?.length || 0,
    isLoading,
    hasError: !!error,
    currentPlayerName: currentPlayer?.name || 'Nenhum'
  });

  // Loading state
  if (isLoading) {
    console.log("🔄 Mostrando loading...");
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <GameLoader className="w-8 h-8 animate-spin mx-auto mb-4 text-flu-grena" />
          <p className="text-lg font-medium text-flu-grena">Carregando jogadores...</p>
          <p className="text-sm text-gray-600 mt-2">Aguarde enquanto preparamos o jogo</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    console.error("❌ Erro ao carregar jogadores:", error);
    return <ErrorDisplay error={error} />;
  }

  // Empty players state
  if (!players || players.length === 0) {
    console.warn("⚠️ Nenhum jogador disponível");
    return <EmptyPlayersDisplay />;
  }

  console.log("✅ Renderizando jogo com jogadores carregados");

  return (
    <>
      <SEOHead 
        title="Jogar Quiz Fluminense - Adivinhe os Jogadores | Lendas do Flu"
        description="🎮 Jogue agora o quiz oficial do Fluminense! Adivinhe os jogadores pelas fotos, ganhe pontos e entre no ranking tricolor. Desafio gratuito!"
        keywords="jogar quiz fluminense, adivinhar jogador fluminense, jogo tricolor, quiz futebol online, teste fluminense grátis"
        url="https://flulegendarium.lovable.app/jogar-quiz-fluminense"
        canonical="https://flulegendarium.lovable.app/jogar-quiz-fluminense"
      />
      
      <div className="min-h-screen bg-gradient-to-b from-flu-verde to-white">
        <GameHeader user={user} trackEvent={trackEvent} />
        
        <div className="py-8 px-4">
          <div className="container mx-auto max-w-4xl">
            <GameContainer
              currentPlayer={currentPlayer}
              gameKey={Date.now().toString()}
              attempts={0}
              score={0}
              gameOver={false}
              timeRemaining={60}
              MAX_ATTEMPTS={1}
              handleGuess={() => {}}
              selectRandomPlayer={selectRandomPlayer}
              handlePlayerImageFixed={() => {}}
              isProcessingGuess={false}
              hasLost={false}
              startGameForPlayer={() => {}}
              isTimerRunning={false}
              gamesPlayed={0}
              currentStreak={0}
              maxStreak={0}
              forceRefresh={selectRandomPlayer}
              playerChangeCount={0}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default Game;
