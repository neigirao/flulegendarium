
import { useState, memo, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { GuessConfirmDialog } from "./GuessConfirmDialog";

interface GuessFormProps {
  disabled: boolean;
  onSubmitGuess: (guess: string) => void;
  isProcessing?: boolean;
}

// Memoized component to prevent unnecessary re-renders
export const GuessForm = memo(({ disabled, onSubmitGuess, isProcessing = false }: GuessFormProps) => {
  const [guess, setGuess] = useState("");
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingGuess, setPendingGuess] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Focus the input field when component mounts or is enabled
  useEffect(() => {
    if (!disabled && inputRef.current) {
      // Small timeout to ensure the DOM is ready
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [disabled]);

  const handleSubmit = () => {
    if (guess.trim() && !isProcessing) {
      setPendingGuess(guess.trim());
      setShowConfirmDialog(true);
    }
  };

  const handleConfirmGuess = () => {
    onSubmitGuess(pendingGuess);
    setGuess("");
    setPendingGuess("");
    setShowConfirmDialog(false);
  };

  const handleCancelGuess = () => {
    setPendingGuess("");
    setShowConfirmDialog(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Only submit on Enter key
    if (e.key === "Enter") {
      e.preventDefault(); // Prevent form submission
      handleSubmit();
    }
  };

  return (
    <>
      <div className="flex flex-col gap-4">
        <Input
          ref={inputRef}
          type="text"
          value={guess}
          onChange={(e) => setGuess(e.target.value)}
          placeholder="Nome ou apelido do jogador..."
          className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-flu-grena"
          onKeyDown={handleKeyDown}
          disabled={disabled || isProcessing}
          autoComplete="off"
          aria-label="Palpite do nome do jogador"
        />
        
        <Button
          onClick={handleSubmit}
          disabled={!guess || disabled || isProcessing}
          className="w-full bg-flu-grena text-white font-semibold flu-shadow"
          size="lg"
          type="button"
        >
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processando...
            </>
          ) : (
            'Adivinhar'
          )}
        </Button>
      </div>

      <GuessConfirmDialog
        open={showConfirmDialog}
        guess={pendingGuess}
        onConfirm={handleConfirmGuess}
        onCancel={handleCancelGuess}
      />
    </>
  );
});

GuessForm.displayName = 'GuessForm';
