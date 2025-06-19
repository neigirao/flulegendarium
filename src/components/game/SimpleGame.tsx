
import React, { useState, useEffect } from "react";
import { Player } from "@/types/guess-game";
import { useToast } from "@/hooks/use-toast";
import { isCorrectGuess } from "@/utils/name-processor";

interface SimpleGameProps {
  players: Player[];
}

export const SimpleGame = ({ players }: SimpleGameProps) => {
  const { toast } = useToast();
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [guess, setGuess] = useState("");
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [usedPlayerIds, setUsedPlayerIds] = useState<Set<string>>(new Set());
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  console.log('🎮 SimpleGame - Players recebidos:', players?.length || 0);

  // Selecionar jogador aleatório
  const selectRandomPlayer = () => {
    if (!players || players.length === 0) {
      console.warn('⚠️ Nenhum jogador disponível');
      return;
    }

    console.log('🎲 Selecionando jogador...');
    
    // Se todos foram usados, resetar
    let availablePlayers = players.filter(p => !usedPlayerIds.has(p.id));
    if (availablePlayers.length === 0) {
      setUsedPlayerIds(new Set());
      availablePlayers = players;
    }

    const randomIndex = Math.floor(Math.random() * availablePlayers.length);
    const selected = availablePlayers[randomIndex];
    
    console.log('✅ Jogador selecionado:', selected.name);
    
    setCurrentPlayer(selected);
    setUsedPlayerIds(prev => new Set([...prev, selected.id]));
    setGameOver(false);
    setGuess("");
    setImageLoaded(false);
    setImageError(false);
  };

  // Processar palpite
  const handleGuess = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentPlayer || !guess.trim()) return;

    console.log('🎮 Processando palpite:', guess, 'para:', currentPlayer.name);

    const isCorrect = isCorrectGuess(guess, currentPlayer.name);

    if (isCorrect) {
      console.log('🎯 ACERTOU!');
      setScore(prev => prev + 5);
      toast({
        title: "Parabéns!",
        description: `Você acertou! Era ${currentPlayer.name}. +5 pontos`,
      });
      
      setTimeout(() => {
        selectRandomPlayer();
      }, 1500);
    } else {
      console.log('❌ ERROU!');
      setGameOver(true);
      toast({
        variant: "destructive",
        title: "Game Over!",
        description: `O jogador era ${currentPlayer.name}. Pontuação final: ${score}`,
      });
    }
  };

  // Selecionar primeiro jogador
  useEffect(() => {
    if (players && players.length > 0 && !currentPlayer) {
      console.log('🚀 Selecionando primeiro jogador');
      selectRandomPlayer();
    }
  }, [players, currentPlayer]);

  const handleImageLoad = () => {
    console.log('✅ Imagem carregada com sucesso');
    setImageLoaded(true);
    setImageError(false);
  };

  const handleImageError = () => {
    console.error('❌ Erro ao carregar imagem');
    setImageError(true);
    setImageLoaded(false);
  };

  if (!players || players.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Carregando jogadores...</p>
      </div>
    );
  }

  if (!currentPlayer) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Preparando jogo...</p>
        <button
          onClick={selectRandomPlayer}
          className="mt-4 px-4 py-2 bg-flu-grena text-white rounded hover:bg-red-700"
        >
          Iniciar Jogo
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      {/* Header do Jogo */}
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-flu-grena mb-2">Adivinhe o Jogador</h1>
        <p className="text-lg text-gray-600">Pontuação: {score}</p>
      </div>

      {/* Imagem do Jogador */}
      <div className="mb-8">
        <div className="bg-white rounded-lg shadow-lg border-2 border-flu-verde overflow-hidden max-w-md mx-auto">
          <div className="aspect-[4/5] min-h-[400px] flex items-center justify-center p-4 relative">
            
            {/* Loading State */}
            {!imageLoaded && !imageError && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
                <div className="text-center">
                  <div className="w-8 h-8 border-4 border-flu-grena border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                  <p className="text-gray-600">Carregando imagem...</p>
                </div>
              </div>
            )}

            {/* Error State */}
            {imageError && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
                <div className="text-center p-4">
                  <img 
                    src="/lovable-uploads/0aa3609f-0584-4bf4-8303-e03f50f7e131.png" 
                    alt="Escudo do Fluminense" 
                    className="w-16 h-16 mx-auto mb-2 opacity-50"
                  />
                  <p className="text-gray-600 text-sm">Imagem não disponível</p>
                  <p className="text-xs text-gray-500 mt-1">Continue jogando normalmente</p>
                </div>
              </div>
            )}

            {/* Imagem Principal */}
            <img
              src={currentPlayer.image_url}
              alt={`Jogador do Fluminense`}
              className={`max-w-full max-h-full object-contain rounded ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
              onLoad={handleImageLoad}
              onError={handleImageError}
              style={{ 
                transition: 'opacity 0.3s ease-in-out'
              }}
            />
          </div>
        </div>
      </div>

      {/* Formulário de Palpite */}
      {!gameOver ? (
        <form onSubmit={handleGuess} className="space-y-4">
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
            />
          </div>
          <button
            type="submit"
            disabled={!guess.trim()}
            className="w-full bg-flu-grena text-white py-3 px-6 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-lg font-medium"
          >
            Enviar Palpite
          </button>
        </form>
      ) : (
        <div className="text-center space-y-4">
          <p className="text-xl font-semibold text-gray-800">
            O jogador era: <span className="text-flu-grena">{currentPlayer.name}</span>
          </p>
          <p className="text-lg text-gray-600">Pontuação final: {score}</p>
          <button
            onClick={() => {
              setScore(0);
              setGameOver(false);
              setUsedPlayerIds(new Set());
              selectRandomPlayer();
            }}
            className="bg-flu-verde text-white py-3 px-6 rounded-lg hover:bg-green-700 text-lg font-medium"
          >
            Jogar Novamente
          </button>
        </div>
      )}

      {/* Botão para próximo jogador (apenas durante o jogo) */}
      {!gameOver && (
        <div className="text-center mt-4">
          <button
            onClick={selectRandomPlayer}
            className="bg-flu-verde text-white px-6 py-2 rounded hover:bg-green-700"
          >
            Próximo Jogador
          </button>
        </div>
      )}

      {/* Debug Info */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-8 p-4 bg-gray-100 rounded-lg text-sm">
          <h4 className="font-semibold mb-2">Debug Info:</h4>
          <p>Jogador: {currentPlayer.name}</p>
          <p>ID: {currentPlayer.id}</p>
          <p>Imagem: {currentPlayer.image_url}</p>
          <p>Total players: {players.length}</p>
          <p>Usados: {usedPlayerIds.size}</p>
          <p>Imagem carregada: {imageLoaded ? 'SIM' : 'NÃO'}</p>
          <p>Erro na imagem: {imageError ? 'SIM' : 'NÃO'}</p>
        </div>
      )}
    </div>
  );
};
