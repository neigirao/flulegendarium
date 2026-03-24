import React, { ReactNode } from 'react';
import { ResponsiveContainer } from '@/components/ux/ResponsiveContainer';
import { LoadingState } from '@/components/ux/LoadingStates';
import { Button } from '@/components/ui/button';
import { ArrowLeft, RotateCcw } from 'lucide-react';

interface BaseGameContainerProps {
  onBack?: () => void;
  backLabel?: string;
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  iconColor?: string;
  isLoading: boolean;
  loadingMessage?: string;
  hasPlayers: boolean;
  emptyStateMessage?: string;
  emptyStateAction?: ReactNode;
  playerCount?: number;
  onReset?: () => void;
  showReset?: boolean;
  children: ReactNode;
  showDebug?: boolean;
  debugContent?: ReactNode;
}

export const BaseGameContainer: React.FC<BaseGameContainerProps> = ({
  onBack,
  backLabel = "Voltar",
  title,
  subtitle,
  icon,
  isLoading,
  loadingMessage = "Carregando...",
  hasPlayers,
  emptyStateMessage = "Nenhum jogador encontrado",
  emptyStateAction,
  onReset,
  showReset = true,
  children,
  showDebug = false,
  debugContent
}) => {
  return (
    <ResponsiveContainer variant="game" maxWidth="xl">
      {/* Header: title centered, back button right */}
      <div className="flex items-center justify-between mb-4">
        <div className="w-20" /> {/* Spacer for centering */}
        
        <div className="flex flex-col items-center text-center">
          <h1 className="text-display-sm text-foreground font-display tracking-wide">
            {icon && <span className="mr-1">{icon}</span>}
            Lendas do Flu
          </h1>
          {(title || subtitle) && (
            <p className="text-xs text-muted-foreground font-medium mt-0.5">
              {title}{subtitle ? ` • ${subtitle}` : ''}
            </p>
          )}
        </div>

        <div className="flex items-center gap-1 w-20 justify-end">
          {onReset && showReset && (
            <Button variant="ghost" size="sm" onClick={onReset} className="text-muted-foreground hover:text-foreground">
              <RotateCcw className="w-3.5 h-3.5" />
            </Button>
          )}
          {onBack && (
            <Button variant="ghost" size="sm" onClick={onBack} className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-3.5 h-3.5 mr-1" />
              <span className="text-xs">{backLabel}</span>
            </Button>
          )}
        </div>
      </div>

      {/* Game content */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <LoadingState type="general" message={loadingMessage} />
          </div>
        ) : !hasPlayers ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">😕</div>
            <h3 className="text-display-sm text-foreground mb-2">{emptyStateMessage}</h3>
            {emptyStateAction}
          </div>
        ) : (
          children
        )}
      </div>

      {showDebug && process.env.NODE_ENV === 'development' && debugContent && (
        <div className="mt-8 p-4 bg-muted/10 rounded-lg border border-border/20">
          <h3 className="text-sm font-semibold text-muted-foreground mb-2">Debug:</h3>
          {debugContent}
        </div>
      )}
    </ResponsiveContainer>
  );
};
