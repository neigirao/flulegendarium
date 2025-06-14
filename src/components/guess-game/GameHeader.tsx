
import { ArrowLeft, Info, Trophy, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { GameRulesTooltip } from "./GameRulesTooltip";
import { cn } from "@/lib/utils";

interface GameHeaderProps {
  score: number;
  onDebugClick: () => void;
}

export const GameHeader = ({ score, onDebugClick }: GameHeaderProps) => {
  console.log('🎮 GameHeader - Score recebido e exibindo:', score);
  
  const getScoreVariant = () => {
    if (score >= 50) return "legendary";
    if (score >= 30) return "excellent";
    if (score >= 15) return "good";
    if (score > 0) return "positive";
    return "zero";
  };

  const variant = getScoreVariant();

  const scoreStyles = {
    legendary: "bg-gradient-to-r from-purple-500 via-pink-500 to-purple-600 text-white shadow-purple-300 animate-pulse",
    excellent: "bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-green-300",
    good: "bg-gradient-to-r from-blue-500 to-cyan-600 text-white shadow-blue-300",
    positive: "bg-gradient-to-r from-flu-grena to-flu-grena/90 text-white shadow-flu-grena/30",
    zero: "bg-white/90 text-flu-grena border-2 border-flu-grena/30"
  };
  
  return (
    <header className="relative">
      {/* Background decorativo */}
      <div className="absolute inset-0 bg-gradient-to-r from-flu-verde/5 via-transparent to-flu-grena/5 rounded-2xl"></div>
      
      <div className="relative flex flex-col space-y-6 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between p-4 sm:p-6">
        
        {/* Botão Voltar com visual melhorado */}
        <Link
          to="/"
          className="group flex items-center text-flu-grena hover:text-flu-grena/80 transition-all duration-200 text-base font-medium self-start"
        >
          <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-white/70 hover:bg-white/90 border border-flu-grena/20 hover:border-flu-grena/30 transition-all duration-200 hover:shadow-md">
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-200" />
            <span>Voltar ao Menu</span>
          </div>
        </Link>
        
        {/* Container central com score e informações */}
        <div className="flex flex-col items-center space-y-4 flex-1 sm:flex-initial">
          
          {/* Score principal com visual aprimorado */}
          <div className={cn(
            "relative px-8 py-4 rounded-2xl shadow-lg transition-all duration-300 hover:scale-105 cursor-default",
            "min-w-[180px] text-center border backdrop-blur-sm",
            scoreStyles[variant]
          )}>
            {/* Efeito de brilho para scores altos */}
            {score >= 30 && (
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
            )}
            
            <div className="relative z-10 flex items-center justify-center gap-2">
              {score >= 50 && <Star className="w-5 h-5 animate-spin" />}
              {score >= 30 && <Trophy className="w-5 h-5" />}
              
              <div className="flex flex-col items-center">
                <span className="text-2xl sm:text-3xl font-bold tabular-nums">
                  {score}
                </span>
                <span className="text-sm opacity-90 font-medium">
                  {score === 1 ? "ponto" : "pontos"}
                </span>
              </div>
              
              {score >= 50 && <Star className="w-5 h-5 animate-spin" style={{ animationDirection: 'reverse' }} />}
            </div>

            {/* Badge de achievement */}
            {score >= 50 && (
              <div className="absolute -top-2 -right-2 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded-full shadow-lg animate-bounce">
                LENDA!
              </div>
            )}
            {score >= 30 && score < 50 && (
              <div className="absolute -top-2 -right-2 bg-green-400 text-green-900 text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                EXPERT!
              </div>
            )}
            {score >= 15 && score < 30 && (
              <div className="absolute -top-2 -right-2 bg-blue-400 text-blue-900 text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                BOM!
              </div>
            )}
          </div>
          
          {/* Controles e informações */}
          <div className="flex items-center gap-4">
            <GameRulesTooltip />
            <div 
              className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors cursor-pointer opacity-50 hover:opacity-70"
              onClick={onDebugClick}
              title="Informações de Debug"
            >
              <Info className="w-4 h-4 text-gray-600" />
            </div>
          </div>
        </div>

        {/* Espaço para balanceamento visual */}
        <div className="hidden sm:block w-[120px]"></div>
      </div>
    </header>
  );
};
