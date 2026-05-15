
import { useState } from "react";
import { Loader2, Send } from "lucide-react";
import { useAnalytics } from "@/hooks/analytics";
import { TouchOptimizedButton, TouchOptimizedInput } from "@/components/ux/TouchOptimized";

interface GuessFormProps {
  disabled: boolean;
  onSubmitGuess: (guess: string) => void;
  isProcessing: boolean;
}

export const GuessForm = ({ disabled, onSubmitGuess, isProcessing }: GuessFormProps) => {
  const [guess, setGuess] = useState("");
  const { trackEvent } = useAnalytics();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guess.trim() || disabled || isProcessing) return;

    trackEvent({
      action: 'guess_submitted',
      category: 'Game',
      label: 'player_guess'
    });

    onSubmitGuess(guess.trim());
    setGuess("");
  };

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="space-y-3" data-testid="guess-form">
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
          className="w-full font-display tracking-wide"
          data-testid="guess-submit-btn"
        >
          {isProcessing ? (
            <Loader2 className="w-6 h-6 animate-spin" />
          ) : (
            <>
              <Send className="w-5 h-5" />
              <span>Confirmar</span>
            </>
          )}
        </TouchOptimizedButton>
      </form>
    </div>
  );
};
