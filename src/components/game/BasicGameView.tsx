
import React, { useState, useEffect } from "react";
import { Player } from "@/types/guess-game";
import { useToast } from "@/components/ui/use-toast";
import { isCorrectGuess } from "@/utils/name-processor";

interface BasicGameViewProps {
  players: Player[];
}

export const BasicGameView = ({ players }: BasicGameViewProps) => {
  const { toast } = useToast();
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [guess, setGuess] = useState("");
  const [score, setScore] = useState(0);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  console.log('🎮 BasicGameView - Players recebidos:', players?.length || 0);

  // Função para selecionar um jogador aleatório
  const selectRandomPlayer = () => {
    if (!players || players.length === 0) {
      console.warn('⚠️ Nenhum jogador disponível');
      return;
    }

    const randomIndex = Math.floor(Math.random() * players.length);
    const selected = players[randomIndex];
    
    console.log('✅ Jogador selecionado:', selected.name, 'URL:', selected.image_url);
    
    setCurrentPlayer(selected);
    setGuess("");
    setImageLoaded(false);
    setImageError(false);
  };

  // Selecionar primeiro jogador
  useEffect(() => {
    if (players && players.length > 0 && !currentPlayer) {
      console.log('🚀 Selecionando primeiro jogador');
      selectRandomPlayer();
    }
  }, [players, currentPlayer]);

  // Processar palpite
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentPlayer || !guess.trim()) return;

    console.log('🎮 Processando palpite:', guess, 'para:', currentPlayer.name);

    const isCorrect = isCorrectGuess(guess, currentPlayer.name);

    if (isCorrect) {
      setScore(prev => prev + 5);
      toast({
        title: "Parabéns! 🎉",
        description: `Você acertou! Era ${currentPlayer.name}. +5 pontos`,
      });
      
      setTimeout(() => {
        selectRandomPlayer();
      }, 2000);
    } else {
      toast({
        variant: "destructive",
        title: "Resposta incorreta",
        description: `O jogador era ${currentPlayer.name}. Tente novamente!`,
      });
      
      setTimeout(() => {
        selectRandomPlayer();
      }, 3000);
    }
  };

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

  // Loading state
  if (!players || players.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Carregando jogadores...</p>
      </div>
    );
  }

  // No player selected
  if (!currentPlayer) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600 mb-4">Preparando jogo...</p>
        <button
          onClick={selectRandomPlayer}
          className="bg-flu-grena text-white px-6 py-2 rounded hover:bg-red-700"
        >
          Iniciar Jogo
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-flu-grena mb-2">Adivinhe o Jogador</h1>
        <p className="text-lg text-gray-600">Pontuação: {score}</p>
      </div>

      {/* Imagem do Jogador - VERSÃO BÁSICA */}
      <div className="flex justify-center">
        <div className="bg-white rounded-lg shadow-lg border-2 border-flu-verde p-4">
          <div className="w-80 h-96 flex items-center justify-center bg-gray-50 rounded">
            {/* Loading State */}
            {!imageLoaded && !imageError && (
              <div className="text-center">
                <div className="w-8 h-8 border-4 border-flu-grena border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                <p className="text-gray-600">Carregando...</p>
              </div>
            )}

            {/* Error State */}
            {imageError && (
              <div className="text-center">
                <img 
                  src="/lovable-uploads/0aa3609f-0584-4bf4-8303-e03f50f7e131.png" 
                  alt="Escudo Fluminense" 
                  className="w-16 h-16 mx-auto mb-2 opacity-50"
                />
                <p className="text-gray-600 text-sm">Imagem não disponível</p>
              </div>
            )}

            {/* Imagem Principal */}
            <img
              src={currentPlayer.image_url}
              alt={`Jogador ${currentPlayer.name}`}
              className={`max-w-full max-h-full object-contain ${imageLoaded ? 'block' : 'hidden'}`}
              onLoad={handleImageLoad}
              onError={handleImageError}
            />
          </div>
        </div>
      </div>

      {/* Formulário */}
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
          />
        </div>
        
        <button
          type="submit"
          disabled={!guess.trim()}
          className="w-full bg-flu-grena text-white py-3 px-6 rounded-lg hover:bg-red-700 disabled:opacity-50 text-lg font-medium"
        >
          Enviar Palpite
        </button>
      </form>

      {/* Botão para próximo jogador */}
      <div className="text-center">
        <button
          onClick={selectRandomPlayer}
          className="bg-flu-verde text-white px-6 py-2 rounded hover:bg-green-700"
        >
          Próximo Jogador
        </button>
      </div>

      {/* Debug Info */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-6 p-4 bg-gray-100 rounded text-sm">
          <h4 className="font-semibold mb-2">Debug Info:</h4>
          <p>Jogador: {currentPlayer.name}</p>
          <p>ID: {currentPlayer.id}</p>
          <p>URL da Imagem: {currentPlayer.image_url}</p>
          <p>Imagem Carregada: {imageLoaded ? 'SIM' : 'NÃO'}</p>
          <p>Erro na Imagem: {imageError ? 'SIM' : 'NÃO'}</p>
          <p>Total de Jogadores: {players.length}</p>
        </div>
      )}
    </div>
  );
};
