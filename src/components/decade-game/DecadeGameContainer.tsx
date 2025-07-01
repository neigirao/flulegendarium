
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DecadeSelectionPage } from './DecadeSelectionPage';
import { GameContainer } from '@/components/guess-game/GameContainer';
import { useDecadePlayerSelection } from '@/hooks/use-decade-player-selection';
import { useSimpleGameLogic } from '@/hooks/use-simple-game-logic';
import { useSimpleGameCallbacks } from '@/hooks/use-simple-game-callbacks';
import { useSimpleGameMetrics } from '@/hooks/use-simple-game-metrics';
import { useGameTimer } from '@/hooks/use-game-timer';
import { useGameState } from '@/hooks/use-game-state';
import { Decade } from '@/types/decade-game';
import { decadePlayerService } from '@/services/decadePlayerService';
import { getDecadeInfo } from '@/data/decades';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, RotateCcw } from 'lucide-react';

export const DecadeGameContainer = () => {
  const navigate = useNavigate();
  const [selectedDecade, setSelectedDecade] = useState<Decade | null>(null);
  const [playerCounts, setPlayerCounts] = useState<Record<Decade, number>>({});
  const [gameKey, setGameKey] = useState(0);

  // Hooks do jogo
  const { 
    availablePlayers, 
    currentPlayer, 
    isLoading: playersLoading,
    selectRandomPlayer,
    handlePlayerImageFixed,
    playerChangeCount
  } = useDecadePlayerSelection(selectedDecade);

  const {
    score,
    addScore,
    gameOver,
    endGame,
    resetGame,
    attempts,
    incrementAttempts,
    MAX_ATTEMPTS,
    currentStreak,
    maxStreak,
    resetStreak,
    gamesPlayed
  } = useGameState();

  const {
    timeRemaining,
    isTimerRunning,
    startTimer,
    stopTimer,
    resetTimer
  } = useGameTimer({
    initialTime: 180,
    onTimeUp: () => console.log('Tempo esgotado')
  });

  const {
    startMetricsTracking,
    incrementCorrectGuesses,
    saveGameData,
    resetMetrics
  } = useSimpleGameMetrics();

  const gameCallbacks = useSimpleGameCallbacks({
    currentPlayer,
    gameActive: !gameOver,
    gameOver,
    score,
    endGame,
    resetStreak,
    saveGameData,
    setGameProgress: () => {}, // Não usado no modo década
    addScore,
    incrementCorrectGuesses,
    incrementAttempts
  });

  const { handleGuess, isProcessingGuess } = useSimpleGameLogic({
    currentPlayer,
    onCorrectGuess: gameCallbacks.handleCorrectGuess,
    onIncorrectGuess: gameCallbacks.handleIncorrectGuess,
    onGameEnd: gameCallbacks.handleGameEnd,
    selectRandomPlayer,
    stopTimer,
    startTimer
  });

  // Carregar contadores de jogadores por década
  useEffect(() => {
    const loadPlayerCounts = async () => {
      try {
        const availableDecades = await decadePlayerService.getAvailableDecades();
        const counts: Record<Decade, number> = {} as Record<Decade, number>;
        
        for (const decade of availableDecades) {
          const players = await decadePlayerService.getPlayersByDecade(decade);
          counts[decade] = players.length;
        }
        
        setPlayerCounts(counts);
      } catch (error) {
        console.error('❌ Erro ao carregar contadores de jogadores:', error);
      }
    };

    loadPlayerCounts();
  }, []);

  // Iniciar jogo quando jogador é selecionado
  useEffect(() => {
    if (currentPlayer && !gameOver) {
      startMetricsTracking();
      startTimer();
    }
  }, [currentPlayer, gameOver, startMetricsTracking, startTimer]);

  const handleDecadeSelect = (decade: Decade) => {
    console.log(`🎮 Década selecionada: ${decade}`);
    setSelectedDecade(decade);
    resetGame();
    resetMetrics();
    resetTimer();
    setGameKey(prev => prev + 1);
  };

  const handleBackToSelection = () => {
    setSelectedDecade(null);
    resetGame();
    resetMetrics();
    resetTimer();
  };

  const handleResetGame = () => {
    resetGame();
    resetMetrics();
    resetTimer();
    setGameKey(prev => prev + 1);
  };

  const forceRefresh = () => {
    setGameKey(prev => prev + 1);
  };

  // Se nenhuma década foi selecionada, mostrar página de seleção
  if (!selectedDecade) {
    return (
      <DecadeSelectionPage 
        onDecadeSelect={handleDecadeSelect}
        playerCounts={playerCounts}
      />
    );
  }

  const decadeInfo = getDecadeInfo(selectedDecade);

  return (
    <div className="min-h-screen bg-gradient-to-br from-flu-verde/10 via-white to-flu-grena/10 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header do Jogo */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={handleBackToSelection}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Escolher Década
            </Button>
            
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full ${decadeInfo.color} flex items-center justify-center text-white text-sm`}>
                {decadeInfo.icon}
              </div>
              <div>
                <h1 className="text-xl font-bold text-flu-grena">
                  Quiz {decadeInfo.label}
                </h1>
                <p className="text-sm text-gray-600">
                  {decadeInfo.description}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-flu-verde/10 text-flu-verde">
              {availablePlayers.length} jogadores disponíveis
            </Badge>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetGame}
              className="flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Reiniciar
            </Button>
          </div>
        </div>

        {/* Container do Jogo */}
        {playersLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-flu-grena border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Carregando jogadores dos {decadeInfo.label}...</p>
            </div>
          </div>
        ) : availablePlayers.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">😕</div>
            <h3 className="text-xl font-semibold text-flu-grena mb-2">
              Nenhum jogador encontrado
            </h3>
            <p className="text-gray-600 mb-4">
              Não há jogadores cadastrados para os {decadeInfo.label}.
            </p>
            <Button onClick={handleBackToSelection}>
              Escolher outra década
            </Button>
          </div>
        ) : (
          <GameContainer
            currentPlayer={currentPlayer}
            gameKey={gameKey.toString()}
            attempts={attempts}
            score={score}
            gameOver={gameOver}
            timeRemaining={timeRemaining}
            MAX_ATTEMPTS={MAX_ATTEMPTS}
            handleGuess={handleGuess}
            selectRandomPlayer={selectRandomPlayer}
            handlePlayerImageFixed={handlePlayerImageFixed}
            isProcessingGuess={isProcessingGuess}
            hasLost={gameOver}
            startGameForPlayer={() => {}}
            isTimerRunning={isTimerRunning}
            gamesPlayed={gamesPlayed}
            currentStreak={currentStreak}
            maxStreak={maxStreak}
            forceRefresh={forceRefresh}
            playerChangeCount={playerChangeCount}
          />
        )}
      </div>
    </div>
  );
};

export default DecadeGameContainer;
