
import { HelpCircle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export const GameRulesTooltip = () => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button className="text-gray-500 hover:text-flu-grena transition-colors">
            <HelpCircle size={20} />
          </button>
        </TooltipTrigger>
        <TooltipContent side="left" className="max-w-xs">
          <div className="space-y-2 text-sm">
            <p><strong>Regras do Jogo:</strong></p>
            <p>• Você tem 30 segundos por jogador</p>
            <p>• Apenas 1 tentativa por jogador</p>
            <p>• Use nomes oficiais ou apelidos</p>
            <p>• Acerto: +5 pontos</p>
            <p>• Erro ou tempo esgotado: Game Over</p>
            <p className="text-red-600 font-semibold">• ⚠️ Não troque de aba: Game Over</p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
