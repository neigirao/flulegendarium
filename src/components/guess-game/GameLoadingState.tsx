
import { Loader2, Clock, Image } from "lucide-react";

interface GameLoadingStateProps {
  type: 'initial' | 'player' | 'image' | 'processing';
  message?: string;
}

export const GameLoadingState = ({ type, message }: GameLoadingStateProps) => {
  const getLoadingContent = () => {
    switch (type) {
      case 'initial':
        return {
          icon: <Loader2 className="w-8 h-8 animate-spin text-flu-verde" />,
          title: "Carregando jogo...",
          description: "Preparando os lendas do Fluminense para você"
        };
      case 'player':
        return {
          icon: <Clock className="w-8 h-8 animate-pulse text-flu-grena" />,
          title: "Selecionando jogador...",
          description: "Escolhendo um lenda tricolor"
        };
      case 'image':
        return {
          icon: <Image className="w-8 h-8 animate-pulse text-blue-500" />,
          title: "Carregando imagem...",
          description: "Preparando a foto do jogador"
        };
      case 'processing':
        return {
          icon: <Loader2 className="w-8 h-8 animate-spin text-yellow-500" />,
          title: "Processando resposta...",
          description: "Verificando seu palpite"
        };
      default:
        return {
          icon: <Loader2 className="w-8 h-8 animate-spin text-flu-verde" />,
          title: "Carregando...",
          description: message || "Aguarde um momento"
        };
    }
  };

  const content = getLoadingContent();

  return (
    <div className="flex flex-col items-center justify-center p-8 bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border-2 border-flu-verde/20">
      <div className="mb-4">
        {content.icon}
      </div>
      <h3 className="text-lg font-semibold text-flu-grena mb-2">
        {content.title}
      </h3>
      <p className="text-gray-600 text-center text-sm">
        {content.description}
      </p>
      
      {/* Barra de loading animada */}
      <div className="w-full max-w-xs mt-4">
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-flu-verde to-flu-grena animate-pulse"></div>
        </div>
      </div>
    </div>
  );
};
