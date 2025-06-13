
import { ArrowLeft, Info } from "lucide-react";
import { Link } from "react-router-dom";
import { GameRulesTooltip } from "./GameRulesTooltip";

interface GameHeaderProps {
  score: number;
  onDebugClick: () => void;
}

export const GameHeader = ({ score, onDebugClick }: GameHeaderProps) => {
  return (
    <div className="flex items-center justify-between mb-8">
      <Link
        to="/"
        className="flex items-center text-flu-grena hover:opacity-80 transition-opacity"
      >
        <ArrowLeft className="mr-2" />
        Voltar
      </Link>
      <div className="flex flex-col items-center">
        <div className="text-flu-grena font-semibold">
          {score} pontos
        </div>
        <div className="flex items-center gap-2 mt-1">
          <GameRulesTooltip />
          <div 
            className="text-gray-500 cursor-default"
            onClick={onDebugClick}
          >
            <Info size={16} className="opacity-50 hover:opacity-70 transition-opacity" />
          </div>
        </div>
      </div>
    </div>
  );
};
