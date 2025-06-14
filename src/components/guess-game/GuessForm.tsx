
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
      <div className="w-full max-w-md mx-auto">
        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:gap-2">
            <Input
              type="text"
              value={guess}
              onChange={(e) => setGuess(e.target.value)}
              placeholder="Digite o nome do jogador..."
              disabled={disabled || isProcessing}
              className="flex-1 text-base py-3 px-4 border-2 border-flu-verde/30 focus:border-flu-verde rounded-lg"
              autoComplete="off"
            />
            <Button
              type="submit"
              disabled={!guess.trim() || disabled || isProcessing}
              className="bg-flu-grena hover:bg-flu-grena/90 text-white px-6 py-3 text-base font-semibold sm:w-auto w-full sm:min-w-[100px]"
            >
              {isProcessing ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Send className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-0" />
                  <span className="sm:hidden">Enviar Palpite</span>
                </>
              )}
            </Button>
          </div>
          
          {guess.trim() && (
            <p className="text-xs sm:text-sm text-gray-600 text-center px-2">
              ⚠️ Lembre-se: você tem apenas uma tentativa por jogador!
            </p>
          )}
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
