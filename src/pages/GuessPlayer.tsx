import { useEffect, useState } from "react";
import { RootLayout } from "@/components/RootLayout";
import { useGuessGame } from "@/hooks/use-guess-game";
import { RankingForm } from "@/components/guess-game/RankingForm";
import { GuessingForm } from "@/components/guess-game/GuessingForm";
import { PlayerDisplay } from "@/components/guess-game/PlayerDisplay";
import { GameEnd } from "@/components/guess-game/GameEnd";
import { Loader } from "lucide-react";

export default function GuessPlayer() {
  const {
    currentPlayer,
    score,
    attempts,
    hasGuessed,
    isLoading,
    isGameOver,
    startNewGame,
    guessPlayer,
    handleCorrectGuess,
  } = useGuessGame();

  const [showRankingForm, setShowRankingForm] = useState(false);

  useEffect(() => {
    if (isGameOver && !showRankingForm) {
      // Delay the ranking form to allow the game end modal to be seen
      const timer = setTimeout(() => {
        setShowRankingForm(true);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [isGameOver, showRankingForm]);

  const handleSaveRanking = () => {
    setShowRankingForm(false);
    startNewGame();
  };

  const handleCancelRanking = () => {
    setShowRankingForm(false);
    startNewGame();
  };

  // Get the current player info to pass to the footer
  const currentPlayerInfo = {
    name: currentPlayer?.name || "",
    id: currentPlayer?.id || "",
  };

  return (
    <RootLayout 
      currentPlayerName={currentPlayerInfo.name}
      currentPlayerId={currentPlayerInfo.id}
    >
      <div className="min-h-screen bg-flu-stripes">
        <div className="container mx-auto p-4 py-8">
          <div className="max-w-md mx-auto bg-white/90 backdrop-blur-sm rounded-xl shadow-xl overflow-hidden">
            {isLoading ? (
              <div className="flex items-center justify-center p-12">
                <Loader className="w-8 h-8 text-flu-grena animate-spin" />
              </div>
            ) : (
              <>
                <PlayerDisplay
                  currentPlayer={currentPlayer}
                  attempts={attempts}
                />

                {hasGuessed || isGameOver ? (
                  <GameEnd
                    isGameOver={isGameOver}
                    score={score}
                    attempts={attempts}
                    currentPlayer={currentPlayer}
                    startNewGame={startNewGame}
                    handleCorrectGuess={handleCorrectGuess}
                  />
                ) : (
                  <GuessingForm guessPlayer={guessPlayer} />
                )}

                {showRankingForm && (
                  <RankingForm
                    score={score}
                    onSaved={handleSaveRanking}
                    onCancel={handleCancelRanking}
                  />
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </RootLayout>
  );
}
