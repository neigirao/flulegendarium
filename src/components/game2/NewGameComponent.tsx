
import React, { useState, useEffect, useCallback, useRef } from "react";
import { Player } from "@/types/guess-game";
import { useToast } from "@/hooks/use-toast";
import { isCorrectGuess } from "@/utils/name-processor";
import { Timer, Play, RotateCcw } from "lucide-react";

interface NewGameComponentProps {
  players: Player[];
}

export const NewGameComponent = ({ players }: NewGameComponentProps) => {
  const { toast } = useToast();
  
  // Game state
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [guess, setGuess] = useState("");
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  
  // Refs
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const visibilityRef = useRef<boolean>(true);
  
  // Sorted players by difficulty (easier first)
  const sortedPlayers = players.sort((a, b) => {
    const difficultyOrder = { 'muito_facil': 1, 'facil': 2, 'medio': 3, 'dificil': 4, 'muito_dificil': 5 };
    const aLevel = a.difficulty_level || 'medio';
    const bLevel = b.difficulty_level || 'medio';
    return (difficultyOrder[aLevel] || 3) - (difficultyOrder[bLevel] || 3);
  });

  console.log('🎮 NewGameComponent - Players:', players.length, 'Sorted:', sortedPlayers.length);

  // Tab visibility detection
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && gameStarted && !gameOver) {
        console.log('🚫 Tab mudou - Game Over!');
        endGame('Você não pode trocar de aba durante o jogo!');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [gameStarted, gameOver]);

  // Timer logic
  useEffect(() => {
    if (isTimerRunning && timeRemaining > 0) {
      timerRef.current = setTimeout(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            endGame('Tempo esgotado!');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [isTimerRunning, timeRemaining]);

  // Select random player from sorted list
  const selectRandomPlayer = useCallback(() => {
    if (!sortedPlayers || sortedPlayers.length === 0) return;
    
    const randomIndex = Math.floor(Math.random() * sortedPlayers.length);
    const selected = sortedPlayers[randomIndex];
    
    console.log('✅ Jogador selecionado:', selected.name, 'Dificuldade:', selected.difficulty_level);
    setCurrentPlayer(selected);
    setGuess("");
  }, [sortedPlayers]);

  // Start game
  const startGame = useCallback(() => {
    console.log('🚀 Iniciando jogo...');
    setGameStarted(true);
    setGameOver(false);
    setScore(0);
    setTimeRemaining(60);
    setIsTimerRunning(true);
    selectRandomPlayer();
  }, [selectRandomPlayer]);

  // End game
  const endGame = useCallback((reason: string) => {
    console.log('🏁 Fim de jogo:', reason);
    setGameOver(true);
    setIsTimerRunning(false);
    setGameStarted(false);
    
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    
    toast({
      variant: "destructive",
      title: "Game Over!",
      description: reason + ` Pontuação final: ${score}`,
    });
  }, [score, toast]);

  // Reset game
  const resetGame = useCallback(() => {
    console.log('🔄 Resetando jogo...');
    setGameStarted(false);
    setGameOver(false);
    setScore(0);
    setTimeRemaining(60);
    setIsTimerRunning(false);
    setCurrentPlayer(null);
    setGuess("");
    
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
  }, []);

  // Handle guess submission
  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentPlayer || !guess.trim() || gameOver) return;
    
    console.log('🎮 Processando palpite:', guess, 'para:', currentPlayer.name);
    
    const isCorrect = isCorrectGuess(guess, currentPlayer.name);
    
    if (isCorrect) {
      console.log('🎯 ACERTOU!');
      setScore(prev => prev + 5);
      
      toast({
        title: "Parabéns! 🎉",
        description: `Você acertou! Era ${currentPlayer.name}. +5 pontos`,
      });
      
      // Continue to next player
      setTimeout(() => {
        selectRandomPlayer();
        setTimeRemaining(60); // Reset timer for next player
      }, 2000);
    } else {
      console.log('❌ ERROU!');
      endGame(`O jogador era ${currentPlayer.name}.`);
    }
  }, [currentPlayer, guess, gameOver, selectRandomPlayer, endGame, toast]);

  // Don't render if no players
  if (!players || players.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Carregando jogadores...</p>
      </div>
    );
  }

  // Game not started - show start screen
  if (!gameStarted) {
    return (
      <div className="max-w-2xl mx-auto text-center">
        <div className="bg-white rounded-lg shadow-lg p-8 border-2 border-flu-verde">
          <h2 className="text-3xl font-bold text-flu-grena mb-6">Pronto para começar?</h2>
          <p className="text-lg text-gray-600 mb-8">
            {sortedPlayers.length} jogadores carregados e ordenados por dificuldade
          </p>
          
          <button
            onClick={startGame}
            className="bg-flu-grena text-white px-8 py-4 rounded-lg hover:bg-red-700 text-xl font-semibold flex items-center gap-3 mx-auto"
          >
            <Play className="w-6 h-6" />
            Iniciar Jogo
          </button>
        </div>
      </div>
    );
  }

  // Game over screen
  if (gameOver) {
    return (
      <div className="max-w-2xl mx-auto text-center">
        <div className="bg-white rounded-lg shadow-lg p-8 border-2 border-red-500">
          <h2 className="text-3xl font-bold text-red-600 mb-4">Game Over!</h2>
          <p className="text-xl text-gray-700 mb-4">Pontuação Final: {score}</p>
          {currentPlayer && (
            <p className="text-lg text-gray-600 mb-6">
              O jogador era: <span className="font-semibold text-flu-grena">{currentPlayer.name}</span>
            </p>
          )}
          
          <button
            onClick={resetGame}
            className="bg-flu-verde text-white px-8 py-4 rounded-lg hover:bg-green-700 text-xl font-semibold flex items-center gap-3 mx-auto"
          >
            <RotateCcw className="w-6 h-6" />
            Jogar Novamente
          </button>
        </div>
      </div>
    );
  }

  // Main game screen
  return (
    <div className="max-w-2xl mx-auto">
      {/* Game Status */}
      <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-6 mb-8 border-2 border-flu-verde">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="text-2xl font-bold text-flu-grena">
              Pontos: {score}
            </div>
            <div className="text-sm text-gray-600">
              Dificuldade: {currentPlayer?.difficulty_level || 'Médio'}
            </div>
          </div>
          
          <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
            timeRemaining <= 10 ? 'bg-red-100 text-red-700' : 
            timeRemaining <= 30 ? 'bg-orange-100 text-orange-700' : 
            'bg-green-100 text-green-700'
          }`}>
            <Timer className="w-5 h-5" />
            <span className="font-bold text-xl">{timeRemaining}s</span>
          </div>
        </div>
      </div>

      {/* Player Image */}
      <div className="mb-8">
        <div className="bg-white rounded-lg shadow-lg border-2 border-flu-verde overflow-hidden max-w-md mx-auto">
          <div className="aspect-[4/5] min-h-[400px] flex items-center justify-center p-4">
            {currentPlayer?.image_url ? (
              <img
                src={currentPlayer.image_url}
                alt="Jogador do Fluminense"
                className="max-w-full max-h-full object-contain rounded"
                onError={(e) => {
                  console.error('❌ Erro na imagem');
                  e.currentTarget.src = "/lovable-uploads/0aa3609f-0584-4bf4-8303-e03f50f7e131.png";
                }}
              />
            ) : (
              <div className="text-center">
                <img 
                  src="/lovable-uploads/0aa3609f-0584-4bf4-8303-e03f50f7e131.png" 
                  alt="Escudo do Fluminense" 
                  className="w-16 h-16 mx-auto mb-2 opacity-50"
                />
                <p className="text-gray-600">Imagem não disponível</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Guess Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="guess" className="block text-lg font-medium text-gray-700 mb-2">
            Quem é este jogador?
          </label>
          <input
            type="text"
            id="guess"
            value={guess}
            onChange={(e) => setGuess(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-flu-verde focus:border-transparent text-lg"
            placeholder="Digite o nome do jogador..."
            autoComplete="off"
            autoFocus
          />
        </div>
        
        <button
          type="submit"
          disabled={!guess.trim()}
          className="w-full bg-flu-grena text-white py-3 px-6 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-lg font-medium"
        >
          Enviar Resposta (1 tentativa apenas!)
        </button>
      </form>

      {/* Debug Info */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-8 p-4 bg-gray-100 rounded-lg text-sm">
          <h4 className="font-semibold mb-2">Debug Info:</h4>
          <p>Jogador: {currentPlayer?.name}</p>
          <p>Dificuldade: {currentPlayer?.difficulty_level}</p>
          <p>Timer: {isTimerRunning ? 'Rodando' : 'Parado'}</p>
          <p>Total players: {sortedPlayers.length}</p>
        </div>
      )}
    </div>
  );
};
