
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Send } from "lucide-react";
import { useAnalytics } from "@/hooks/use-analytics";
import { GuessConfirmDialog } from "./GuessConfirmDialog";

interface GuessFormProps {
  disabled: boolean;
  onSubmitGuess: (guess: string) => void;
  isProcessing: boolean;
}

export const GuessForm = ({ disabled, onSubmitGuess, isProcessing }: GuessFormProps) => {
  const [guess, setGuess] = useState("");
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingGuess, setPendingGuess] = useState("");
  const { trackEvent } = useAnalytics();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guess.trim() || disabled || isProcessing) return;
    
    // Mostrar diálogo de confirmação
    setPendingGuess(guess.trim());
    setShowConfirmDialog(true);
  };

  const handleConfirmGuess = () => {
    trackEvent({
      action: 'guess_submitted',
      category: 'Game',
      label: 'player_guess'
    });
    
    onSubmitGuess(pendingGuess);
    setGuess("");
    setPendingGuess("");
    setShowConfirmDialog(false);
  };

  const handleCancelGuess = () => {
    setPendingGuess("");
    setShowConfirmDialog(false);
  };

  return (
    <>
      <div className="w-full">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="text"
            value={guess}
            onChange={(e) => setGuess(e.target.value)}
            placeholder="Digite o nome do jogador..."
            disabled={disabled || isProcessing}
            className="w-full text-lg py-4 px-6 border-2 border-gray-200 focus:border-flu-verde rounded-xl text-center font-medium placeholder:text-gray-400"
            autoComplete="off"
          />
          
          <Button
            type="submit"
            disabled={!guess.trim() || disabled || isProcessing}
            className="w-full bg-flu-grena hover:bg-flu-grena/90 text-white py-4 text-lg font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]"
          >
            {isProcessing ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              "Confirmar Nome"
            )}
          </Button>
        </form>
      </div>

      <GuessConfirmDialog
        open={showConfirmDialog}
        guess={pendingGuess}
        onConfirm={handleConfirmGuess}
        onCancel={handleCancelGuess}
      />
    </>
  );
};
