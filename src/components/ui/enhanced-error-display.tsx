
import { AlertTriangle, RefreshCw, Home, Info, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { DetailedError, getContextualSuggestions, formatErrorForDisplay } from "@/utils/errorMessages";
import { useState } from "react";

interface EnhancedErrorDisplayProps {
  error: DetailedError;
  onRetry?: () => void;
  onGoHome?: () => void;
  onDismiss?: () => void;
  className?: string;
  compact?: boolean;
}

export const EnhancedErrorDisplay = ({
  error,
  onRetry,
  onGoHome,
  onDismiss,
  className,
  compact = false
}: EnhancedErrorDisplayProps) => {
  const [showDetails, setShowDetails] = useState(false);
  
  const severityColors = {
    low: {
      bg: "bg-blue-50",
      border: "border-blue-200", 
      text: "text-blue-800",
      badge: "bg-blue-100 text-blue-800"
    },
    medium: {
      bg: "bg-yellow-50",
      border: "border-yellow-200",
      text: "text-yellow-800", 
      badge: "bg-yellow-100 text-yellow-800"
    },
    high: {
      bg: "bg-orange-50",
      border: "border-orange-200",
      text: "text-orange-800",
      badge: "bg-orange-100 text-orange-800"
    },
    critical: {
      bg: "bg-red-50", 
      border: "border-red-200",
      text: "text-red-800",
      badge: "bg-red-100 text-red-800"
    }
  };

  const colors = severityColors[error.severity];
  const suggestions = getContextualSuggestions(error);

  if (compact) {
    return (
      <div className={cn(
        "flex items-center gap-3 p-3 rounded-lg border",
        colors.bg,
        colors.border,
        className
      )}>
        <AlertTriangle className={cn("w-5 h-5", colors.text)} />
        <div className="flex-1 min-w-0">
          <p className={cn("font-medium text-sm", colors.text)}>{error.title}</p>
          <p className="text-xs text-gray-600 truncate">{error.message}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={colors.badge}>{error.code}</Badge>
          {onRetry && (
            <Button variant="ghost" size="sm" onClick={onRetry}>
              <RefreshCw className="w-4 h-4" />
            </Button>
          )}
          {onDismiss && (
            <Button variant="ghost" size="sm" onClick={onDismiss}>
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <Card className={cn("w-full max-w-lg mx-auto", className)}>
      <CardHeader className={cn("pb-4", colors.bg, "rounded-t-lg")}>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <AlertTriangle className={cn("w-6 h-6", colors.text)} />
              <CardTitle className={cn("text-lg", colors.text)}>
                {error.title}
              </CardTitle>
            </div>
            <CardDescription className="text-gray-700">
              {error.message}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={colors.badge}>
              {error.severity.toUpperCase()}
            </Badge>
            <Badge variant="outline">
              {error.code}
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Suggestions */}
        <div className="space-y-2">
          <h4 className="font-medium text-sm text-gray-900">💡 O que fazer:</h4>
          <ul className="space-y-1">
            {suggestions.map((suggestion, index) => (
              <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                <span className="text-gray-400 mt-1">•</span>
                <span>{suggestion}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          {onRetry && (
            <Button 
              onClick={onRetry}
              className="flex-1 bg-flu-grena hover:bg-flu-grena/90"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Tentar Novamente
            </Button>
          )}
          
          {onGoHome && (
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

        {/* Technical Details (Collapsible) */}
        <Collapsible>
          <CollapsibleTrigger 
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800"
            onClick={() => setShowDetails(!showDetails)}
          >
            <Info className="w-4 h-4" />
            Detalhes técnicos
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-2">
            <div className="bg-gray-50 p-3 rounded border text-xs font-mono">
              <div className="space-y-1 text-gray-700">
                <div><strong>Código:</strong> {error.code}</div>
                <div><strong>Severidade:</strong> {error.severity}</div>
                {error.context?.component && (
                  <div><strong>Componente:</strong> {error.context.component}</div>
                )}
                {error.context?.action && (
                  <div><strong>Ação:</strong> {error.context.action}</div>
                )}
                {error.context?.timestamp && (
                  <div><strong>Horário:</strong> {new Date(error.context.timestamp).toLocaleString('pt-BR')}</div>
                )}
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>

        {onDismiss && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onDismiss}
            className="w-full mt-2"
          >
            Dispensar
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

// Hook para usar com as mensagens de erro aprimoradas
export const useEnhancedError = () => {
  const [error, setError] = useState<DetailedError | null>(null);

  const showError = (errorData: DetailedError) => {
    setError(errorData);
  };

  const clearError = () => {
    setError(null);
  };

  return {
    error,
    showError,
    clearError,
    hasError: !!error
  };
};
