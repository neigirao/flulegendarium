
import { Loader2, User2, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface GameLoadingStateProps {
  type?: "player" | "processing" | "general";
  message?: string;
}

export const GameLoadingState = ({ 
  type = "general", 
  message 
}: GameLoadingStateProps) => {
  const getContent = () => {
    switch (type) {
      case "player":
        return {
          icon: <User2 className="w-6 h-6 sm:w-8 sm:h-8 text-flu-grena animate-pulse" />,
          title: "Preparando jogador...",
          subtitle: "Buscando uma lenda do Fluminense"
        };
      case "processing":
        return {
          icon: <Zap className="w-6 h-6 sm:w-8 sm:h-8 text-flu-verde animate-bounce" />,
          title: "Processando resposta...",
          subtitle: "Verificando seu palpite"
        };
      default:
        return {
          icon: <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 text-flu-grena animate-spin" />,
          title: message || "Carregando...",
          subtitle: "Aguarde um momento"
        };
    }
  };

  const content = getContent();

  return (
    <div className="flex flex-col items-center justify-center py-8 sm:py-12 px-4">
      <div className={cn(
        "bg-white/90 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-lg border border-gray-200",
        "p-6 sm:p-8 flex flex-col items-center gap-4 sm:gap-6",
        "w-full max-w-sm sm:max-w-md mx-auto"
      )}>
        {/* Ícone */}
        <div className="flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gray-50 rounded-full">
          {content.icon}
        </div>
        
        {/* Texto */}
        <div className="text-center space-y-2">
          <h3 className="font-semibold text-base sm:text-lg text-gray-900">
            {content.title}
          </h3>
          <p className="text-sm sm:text-base text-gray-600">
            {content.subtitle}
          </p>
        </div>
        
        {/* Barra de progresso animada */}
        <div className="w-full max-w-32 sm:max-w-40 h-1 bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full bg-flu-grena rounded-full animate-pulse" style={{
            animation: "loading-bar 2s ease-in-out infinite"
          }} />
        </div>
      </div>
      
      <style jsx>{`
        @keyframes loading-bar {
          0% { width: 0%; }
          50% { width: 70%; }
          100% { width: 100%; opacity: 0.5; }
        }
      `}</style>
    </div>
  );
};
