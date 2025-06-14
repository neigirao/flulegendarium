
import { ArrowLeft, Info } from "lucide-react";
import { Link } from "react-router-dom";
import { GameRulesTooltip } from "./GameRulesTooltip";

interface GameHeaderProps {
  score: number;
  onDebugClick: () => void;
}

export const GameHeader = ({ score, onDebugClick }: GameHeaderProps) => {
  console.log('🎮 GameHeader - Score recebido e exibindo:', score);
  
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 md:mb-8 gap-4">
      <Link
        to="/"
        className="flex items-center text-flu-grena hover:opacity-80 transition-opacity text-sm md:text-base"
      >
        <ArrowLeft className="mr-2 w-4 h-4 md:w-5 md:h-5" />
        Voltar
      </Link>
      
      <div className="flex flex-col items-center w-full sm:w-auto">
        <div className="text-flu-grena font-bold text-lg md:text-xl bg-white/90 px-4 md:px-6 py-2 md:py-3 rounded-lg border border-flu-verde/30 shadow-lg">
          {score} pontos
        </div>
        <div className="flex items-center gap-2 mt-2">
          <GameRulesTooltip />
          <div 
            className="text-gray-500 cursor-default"
            onClick={onDebugClick}
          >
            <Info size={14} className="md:w-4 md:h-4 opacity-50 hover:opacity-70 transition-opacity" />
          </div>
        </div>
      </div>
    </div>
  );
};
