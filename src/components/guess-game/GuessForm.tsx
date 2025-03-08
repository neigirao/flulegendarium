
import { useState } from "react";

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
    <div className="space-y-2">
      <div className="flex gap-4">
        <input
          type="text"
          value={guess}
          onChange={(e) => setGuess(e.target.value)}
          placeholder="Nome ou apelido do jogador..."
          className="flex-1 px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-flu-grena"
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          disabled={disabled}
        />
        <button
          onClick={handleSubmit}
          disabled={!guess || disabled}
          className="bg-flu-grena text-white px-6 py-2 rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flu-shadow"
        >
          Adivinhar
        </button>
      </div>
      
      <div className="text-xs text-gray-500 italic">
        Dica: Você pode usar o nome completo, primeiro nome, sobrenome ou apelido conhecido.
      </div>
    </div>
  );
};
