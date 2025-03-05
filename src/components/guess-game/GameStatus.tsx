
interface GameStatusProps {
  attempts: number;
  maxAttempts: number;
  score: number;
  gameOver: boolean;
  onNextPlayer: () => void;
}

export const GameStatus = ({ 
  attempts, 
  maxAttempts, 
  score,
  gameOver,
  onNextPlayer
}: GameStatusProps) => {
  return (
    <div className="space-y-4">
      {gameOver && (
        <div className="text-center mt-4">
          <button
            onClick={onNextPlayer}
            className="bg-flu-grena text-white px-6 py-2 rounded-lg hover:opacity-90"
          >
            Próximo Jogador
          </button>
        </div>
      )}

      <div className="text-sm text-gray-600">
        <p>Tentativas restantes: {maxAttempts - attempts}</p>
        <p>Dicas desbloqueadas: {attempts}/{maxAttempts}</p>
        <p className="font-medium">Pontuação: {score}</p>
      </div>
    </div>
  );
};
