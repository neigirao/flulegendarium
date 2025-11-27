
import { useState } from "react";
import { Loader2, Send } from "lucide-react";
import { useAnalytics } from "@/hooks/analytics";
import { GuessConfirmDialog } from "./GuessConfirmDialog";
import { TouchOptimizedButton, TouchOptimizedInput } from "@/components/ux/TouchOptimized";

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
        <form onSubmit={handleSubmit} className="space-y-4" data-testid="guess-form">
          <TouchOptimizedInput
            value={guess}
            onChange={setGuess}
            placeholder="Digite o nome do jogador..."
            disabled={disabled || isProcessing}
            className="text-center font-medium text-lg"
            autoComplete="off"
            data-testid="guess-input"
          />
          
          <TouchOptimizedButton
            type="submit"
            disabled={!guess.trim() || disabled || isProcessing}
            variant="primary"
            size="lg"
            className="w-full"
            data-testid="guess-submit-btn"
          >
            {isProcessing ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <>
                <Send className="w-5 h-5" />
                <span>Confirmar Nome</span>
              </>
            )}
          </TouchOptimizedButton>
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
