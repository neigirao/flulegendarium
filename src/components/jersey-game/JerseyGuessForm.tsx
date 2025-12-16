import { useState, useCallback } from "react";
import { Loader2, Send, Calendar } from "lucide-react";
import { useAnalytics } from "@/hooks/analytics";
import { TouchOptimizedButton } from "@/components/ux/TouchOptimized";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface JerseyGuessFormProps {
  disabled: boolean;
  onSubmitGuess: (year: number) => void;
  isProcessing: boolean;
  minYear?: number;
  maxYear?: number;
}

export const JerseyGuessForm = ({ 
  disabled, 
  onSubmitGuess, 
  isProcessing,
  minYear = 1902,
  maxYear = new Date().getFullYear()
}: JerseyGuessFormProps) => {
  const [guess, setGuess] = useState("");
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingGuess, setPendingGuess] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { trackEvent } = useAnalytics();

  const validateYear = useCallback((value: string): number | null => {
    const year = parseInt(value, 10);
    if (isNaN(year)) return null;
    if (year < minYear || year > maxYear) return null;
    return year;
  }, [minYear, maxYear]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 4);
    setGuess(value);
    setError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guess.trim() || disabled || isProcessing) return;
    
    const year = validateYear(guess);
    if (!year) {
      setError(`Digite um ano válido entre ${minYear} e ${maxYear}`);
      return;
    }
    
    setPendingGuess(year);
    setShowConfirmDialog(true);
  };

  const handleConfirmGuess = () => {
    if (pendingGuess === null) return;
    
    trackEvent({
      action: 'jersey_guess_submitted',
      category: 'JerseyGame',
      label: 'year_guess',
      value: pendingGuess
    });
    
    onSubmitGuess(pendingGuess);
    setGuess("");
    setPendingGuess(null);
    setShowConfirmDialog(false);
  };

  const handleCancelGuess = () => {
    setPendingGuess(null);
    setShowConfirmDialog(false);
  };

  return (
    <>
      <div className="w-full">
        <form onSubmit={handleSubmit} className="space-y-4" data-testid="jersey-guess-form">
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={guess}
              onChange={handleInputChange}
              placeholder="Digite o ano (ex: 1984)"
              disabled={disabled || isProcessing}
              className="text-center font-medium text-2xl tracking-widest pl-10 h-14"
              autoComplete="off"
              data-testid="jersey-guess-input"
            />
          </div>
          
          {error && (
            <p className="text-sm text-destructive text-center">{error}</p>
          )}
          
          <TouchOptimizedButton
            type="submit"
            disabled={!guess.trim() || disabled || isProcessing}
            variant="primary"
            size="lg"
            className="w-full"
            data-testid="jersey-guess-submit-btn"
          >
            {isProcessing ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <>
                <Send className="w-5 h-5" />
                <span>Confirmar Ano</span>
              </>
            )}
          </TouchOptimizedButton>
        </form>
      </div>

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Palpite</AlertDialogTitle>
            <AlertDialogDescription>
              Você está prestes a responder <span className="font-bold text-foreground text-2xl">{pendingGuess}</span>
              <br />
              Tem certeza que deseja confirmar?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelGuess}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmGuess}>
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};