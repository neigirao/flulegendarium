import { Loader2, Brain, Image, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingStateProps {
  type: 'general' | 'image' | 'thinking' | 'generating';
  message?: string;
  showProgress?: boolean;
  progress?: number;
}

export const LoadingState = ({ type, message, showProgress = false, progress = 0 }: LoadingStateProps) => {
  const loadingConfigs = {
    general: {
      icon: Loader2,
      color: "text-primary",
      bg: "bg-gradient-to-r from-primary/10 to-secondary/10",
      message: message || "Carregando...",
      animation: "animate-spin"
    },
    image: {
      icon: Image,
      color: "text-secondary",
      bg: "bg-gradient-to-r from-secondary/10 to-primary/10",
      message: message || "Carregando imagem...",
      animation: "animate-pulse"
    },
    thinking: {
      icon: Brain,
      color: "text-purple-600",
      bg: "bg-gradient-to-r from-purple-100 to-blue-100",
      message: message || "Processando...",
      animation: "animate-bounce"
    },
    generating: {
      icon: Sparkles,
      color: "text-yellow-600",
      bg: "bg-gradient-to-r from-yellow-100 to-orange-100",
      message: message || "Gerando conteúdo...",
      animation: "animate-pulse"
    }
  };

  const config = loadingConfigs[type];
  const Icon = config.icon;

  return (
    <div className="flex flex-col items-center justify-center p-6 space-y-4">
      {/* Main loading indicator */}
      <div className={cn(
        "relative flex items-center justify-center w-20 h-20 rounded-full",
        "border-4 border-white shadow-lg",
        config.bg
      )}>
        <Icon className={cn("w-8 h-8", config.color, config.animation)} />
        
        {/* Rotating border for general loading */}
        {type === 'general' && (
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-flu-grena animate-spin"></div>
        )}
      </div>

      {/* Message */}
      <div className="text-center space-y-2">
        <p className="text-lg font-medium text-foreground">
          {config.message}
        </p>
        
        {/* Animated dots */}
        <div className="flex justify-center space-x-1">
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
      </div>

      {/* Progress bar */}
      {showProgress && (
        <div className="w-full max-w-xs">
          <div className="flex justify-between text-sm text-muted-foreground mb-1">
            <span>Progresso</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-primary to-secondary h-2 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      )}
    </div>
  );
};

// Skeleton para cards de jogadores
export const PlayerCardSkeleton = () => {
  return (
    <div className="w-full max-w-sm mx-auto bg-white rounded-xl shadow-lg overflow-hidden animate-pulse">
      <div className="relative">
        {/* Image skeleton */}
        <div className="w-full aspect-square bg-muted"></div>
        
        {/* Content skeleton */}
        <div className="p-4 space-y-3">
          <div className="h-4 bg-muted rounded w-3/4"></div>
          <div className="h-3 bg-muted rounded w-1/2"></div>
          <div className="space-y-2">
            <div className="h-3 bg-muted rounded"></div>
            <div className="h-3 bg-muted rounded w-5/6"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Loading overlay para toda a tela
export const FullScreenLoading = ({ message = "Carregando aplicação..." }: { message?: string }) => {
  return (
    <div className="fixed inset-0 bg-white/90 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="text-center space-y-6">
        <div className="relative">
          <div className="w-24 h-24 border-4 border-primary/20 border-t-flu-grena rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-primary animate-pulse" />
          </div>
        </div>
        
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-primary">
            Flu Legendarium
          </h2>
          <p className="text-muted-foreground">
            {message}
          </p>
        </div>
      </div>
    </div>
  );
};