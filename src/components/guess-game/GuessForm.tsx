
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface GuessFormProps {
  disabled: boolean;
  onSubmitGuess: (guess: string) => void;
}

export const GuessForm = ({ disabled, onSubmitGuess }: GuessFormProps) => {
  const [guess, setGuess] = useState("");

  const handleSubmit = () => {
    if (guess.trim()) {
      onSubmitGuess(guess);
      setGuess("");
    }
  };

  return (
    <div className="space-y-3">
      <input
        type="text"
        value={guess}
        onChange={(e) => setGuess(e.target.value)}
        placeholder="Nome ou apelido do jogador..."
        className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-flu-grena"
        onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
        disabled={disabled}
      />
      
      <Button
        onClick={handleSubmit}
        disabled={!guess || disabled}
        className="w-full bg-flu-grena text-white py-3 font-semibold flu-shadow"
        size="lg"
      >
        Adivinhar
      </Button>
      
      <div className="text-xs text-gray-500 italic">
        Dica: Você pode usar o nome completo, primeiro nome, sobrenome ou apelido conhecido.
      </div>
    </div>
  );
};
