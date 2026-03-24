
import { AlertTriangle, RefreshCw, Home, Wifi, Database } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ErrorStateProps {
  type?: "network" | "database" | "notfound" | "generic" | "game";
  title?: string;
  description?: string;
  onRetry?: () => void;
  onGoHome?: () => void;
  className?: string;
  showRetry?: boolean;
  showHome?: boolean;
}

export const ErrorState = ({
  type = "generic",
  title,
  description,
  onRetry,
  onGoHome,
  className,
  showRetry = true,
  showHome = true
}: ErrorStateProps) => {
  const errorConfig = {
    network: {
      icon: Wifi,
      title: title || "Problema de conexão",
      description: description || "Verifique sua conexão com a internet e tente novamente.",
      color: "text-orange-600",
      bgColor: "bg-orange-100"
    },
    database: {
      icon: Database,
      title: title || "Erro no servidor",
      description: description || "Problemas temporários com nossos servidores. Tente novamente em alguns instantes.",
      color: "text-red-600", 
      bgColor: "bg-red-100"
    },
    notfound: {
      icon: AlertTriangle,
      title: title || "Página não encontrada",
      description: description || "A página que você procura não existe ou foi movida.",
      color: "text-yellow-600",
      bgColor: "bg-yellow-100"
    },
    game: {
      icon: AlertTriangle,
      title: title || "Erro no jogo",
      description: description || "Ocorreu um problema durante o jogo. Suas estatísticas foram salvas.",
      color: "text-primary",
      bgColor: "bg-secondary/10"
    },
    generic: {
      icon: AlertTriangle,
      title: title || "Algo deu errado",
      description: description || "Ocorreu um erro inesperado. Tente novamente ou volte ao início.",
      color: "text-red-600",
      bgColor: "bg-red-100"
    }
  };

  const config = errorConfig[type];
  const IconComponent = config.icon;

  return (
    <Card className={cn("w-full max-w-md mx-auto", className)}>
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <div className={cn("w-16 h-16 rounded-full flex items-center justify-center", config.bgColor)}>
            <IconComponent className={cn("w-8 h-8", config.color)} />
          </div>
        </div>
        <CardTitle className={config.color}>{config.title}</CardTitle>
        <CardDescription>{config.description}</CardDescription>
      </CardHeader>
      
      {(showRetry || showHome) && (
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            {showRetry && onRetry && (
              <Button 
                onClick={onRetry}
                className="flex-1 bg-primary hover:bg-primary/90"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Tentar Novamente
              </Button>
            )}
            
            {showHome && (
              <Button 
                variant="outline" 
                onClick={onGoHome || (() => window.location.href = '/')}
                className="flex-1"
              >
                <Home className="w-4 h-4 mr-2" />
                Início
              </Button>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
};

export const InlineError = ({ 
  message = "Erro ao carregar dados",
  onRetry 
}: { 
  message?: string;
  onRetry?: () => void;
}) => (
  <div className="flex items-center justify-center gap-2 py-4 px-4 bg-red-50 rounded-lg border border-red-200">
    <AlertTriangle className="w-4 h-4 text-red-600" />
    <span className="text-sm text-red-700 flex-1">{message}</span>
    {onRetry && (
      <Button variant="ghost" size="sm" onClick={onRetry}>
        <RefreshCw className="w-3 h-3" />
      </Button>
    )}
  </div>
);

export const EmptyState = ({
  title = "Nenhum item encontrado",
  description = "Não há dados para exibir no momento.",
  icon: Icon = AlertTriangle,
  action
}: {
  title?: string;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
  action?: React.ReactNode;
}) => (
  <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
      <Icon className="w-8 h-8 text-muted-foreground" />
    </div>
    <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
    <p className="text-muted-foreground mb-6 max-w-sm">{description}</p>
    {action}
  </div>
);
