
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Send } from "lucide-react";
import { useAnalytics } from "@/hooks/use-analytics";

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
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-2">
        <Input
          type="text"
          value={guess}
          onChange={(e) => setGuess(e.target.value)}
          placeholder="Digite o nome do jogador..."
          disabled={disabled || isProcessing}
          className="flex-1 text-base md:text-lg py-2 md:py-3 px-3 md:px-4 border-2 border-flu-verde/30 focus:border-flu-verde"
          autoComplete="off"
        />
        <Button
          type="submit"
          disabled={!guess.trim() || disabled || isProcessing}
          className="bg-flu-grena hover:bg-flu-grena/90 text-white px-4 md:px-6 py-2 md:py-3 text-base md:text-lg font-semibold sm:w-auto"
        >
          {isProcessing ? (
            <Loader2 className="w-4 h-4 md:w-5 md:h-5 animate-spin" />
          ) : (
            <Send className="w-4 h-4 md:w-5 md:h-5" />
          )}
        </Button>
      </div>
    </form>
  );
};
