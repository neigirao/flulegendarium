
import { Loader2, User2, Zap } from "lucide-react";
import { LoadingCard } from "@/components/ui/loading-states";
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
          title: "Preparando jogador...",
          description: "Buscando uma lenda do Fluminense",
          icon: "user" as const
        };
      case "processing":
        return {
          title: "Processando resposta...",
          description: "Verificando seu palpite",
          icon: "general" as const
        };
      default:
        return {
          title: message || "Carregando...",
          description: "Aguarde um momento",
          icon: "general" as const
        };
    }
  };

  const content = getContent();

  return (
    <div className="flex flex-col items-center justify-center py-8 sm:py-12 px-4">
      <LoadingCard
        title={content.title}
        description={content.description}
        icon={content.icon}
        size="md"
        className="w-full max-w-sm sm:max-w-md mx-auto"
      />
    </div>
  );
};
