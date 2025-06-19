
import React, { useEffect } from "react";
import { Loader as GameLoader } from "lucide-react";

import { SEOHead } from "@/components/SEOHead";
import { ErrorDisplay } from "@/components/guess-game/ErrorDisplay";
import { EmptyPlayersDisplay } from "@/components/guess-game/EmptyPlayersDisplay";
import { GameHeader } from "@/components/game/GameHeader";
import { GameContent } from "@/components/game/GameContent";
import { GameModals } from "@/components/game/GameModals";

import { useSimpleGuessGame } from "@/hooks/use-simple-guess-game";
import { useAuth } from "@/hooks/useAuth";
import { useAnalytics } from "@/hooks/use-analytics";
import { useDebug } from "@/hooks/use-debug";
import { usePlayersData } from "@/hooks/use-players-data";
import { useGameState } from "@/hooks/use-game-state";
import { useGameHandlers } from "@/hooks/game/use-game-handlers";

const Game = () => {
  console.log("🎮 Game component iniciando...");
  
  const { user } = useAuth();
  const { trackGameStart, trackGameEnd, trackPageView, trackEvent } = useAnalytics();
  const { showImageUrl } = useDebug();
  
  // Carregar dados dos jogadores primeiro
  const { players, isLoading, error } = usePlayersData();

  // Track page view
  useEffect(() => {
    trackPageView('/jogar-quiz-fluminense');
  }, [trackPageView]);

  console.log("📋 Estado dos players:", {
    playersCount: players?.length || 0,
    isLoading,
    hasError: !!error,
    firstPlayer: players?.[0]?.name || 'N/A'
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

  console.log("✅ Jogadores carregados, iniciando game logic...");

  return <GameWithPlayers players={players} />;
};

// Componente separado para garantir que o game logic só rode com players carregados
const GameWithPlayers = ({ players }: { players: any[] }) => {
  const { user } = useAuth();
  const { trackGameStart, trackEvent } = useAnalytics();
  const { showImageUrl } = useDebug();

  // Inicializar lógica do jogo com players garantidos
  const gameLogic = useSimpleGuessGame(players);

  const {
    currentPlayer,
    gameKey,
    attempts,
    score,
    gameOver,
    timeRemaining,
    MAX_ATTEMPTS,
    handleGuess,
    selectRandomPlayer,
    forceRefresh,
    handlePlayerImageFixed,
    isProcessingGuess,
    hasLost,
    startGameForPlayer,
    isTimerRunning,
    resetScore,
    gamesPlayed,
    currentStreak,
    maxStreak,
    playerChangeCount
  } = gameLogic;

  // Game state management
  const {
    showGameOverDialog,
    showTutorial,
    gameStarted,
    isAuthenticatedGame,
    showGuestNameForm,
    guestPlayerName,
    handleGameOverClose,
    handleTutorialComplete,
    handleSkipTutorial,
    handleGuestNameSubmitted,
    handleGuestNameCancel
  } = useGameState({ hasLost });

  // Game handlers
  const { onTutorialComplete, onSkipTutorial, onGameOverClose } = useGameHandlers({
    user,
    trackGameStart,
    handleTutorialComplete,
    handleSkipTutorial,
    handleGameOverClose,
    selectRandomPlayer
  });

  console.log('🎮 GameWithPlayers render - Estado:', {
    currentPlayerName: currentPlayer?.name || 'Nenhum',
    gameStarted,
    playersCount: players?.length || 0,
    gameLogicReady: !!gameLogic
  });

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
        
        <GameContent
          gameStarted={gameStarted}
          showImageUrl={showImageUrl}
          currentPlayer={currentPlayer}
          gameKey={gameKey.toString()}
          attempts={attempts ? attempts.length : 0}
          score={score}
          gameOver={gameOver}
          timeRemaining={timeRemaining}
          MAX_ATTEMPTS={MAX_ATTEMPTS}
          handleGuess={handleGuess}
          selectRandomPlayer={selectRandomPlayer}
          handlePlayerImageFixed={handlePlayerImageFixed}
          isProcessingGuess={isProcessingGuess}
          hasLost={hasLost}
          startGameForPlayer={startGameForPlayer}
          isTimerRunning={isTimerRunning}
          gamesPlayed={gamesPlayed}
          currentStreak={currentStreak}
          maxStreak={maxStreak}
          forceRefresh={forceRefresh}
          playerChangeCount={playerChangeCount}
        />

        <GameModals
          showTutorial={showTutorial}
          showGuestNameForm={showGuestNameForm}
          showGameOverDialog={showGameOverDialog}
          currentPlayer={currentPlayer}
          gameStarted={gameStarted}
          score={score}
          isAuthenticatedGame={isAuthenticatedGame}
          guestPlayerName={guestPlayerName}
          onTutorialComplete={onTutorialComplete}
          onSkipTutorial={onSkipTutorial}
          handleGuestNameSubmitted={handleGuestNameSubmitted}
          handleGuestNameCancel={handleGuestNameCancel}
          handleGameOverClose={onGameOverClose}
          resetScore={resetScore}
        />
      </div>
    </>
  );
};

export default Game;
