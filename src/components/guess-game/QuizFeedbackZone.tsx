import { useEffect, useState } from "react";
import { CheckCircle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export type FeedbackState = 'idle' | 'correct' | 'wrong';

interface QuizFeedbackZoneProps {
  state: FeedbackState;
  playerName?: string;
  points?: number;
  onIdle?: () => void;
}

export const QuizFeedbackZone = ({ state, playerName, points, onIdle }: QuizFeedbackZoneProps) => {
  const [visible, setVisible] = useState(state);

  useEffect(() => {
    setVisible(state);
    if (state !== 'idle') {
      const t = setTimeout(() => {
        setVisible('idle');
        onIdle?.();
      }, 2000);
      return () => clearTimeout(t);
    }
  }, [state, onIdle]);

  if (visible === 'correct') {
    return (
      <div className={cn(
        "flex items-center gap-3 px-4 py-3 rounded-xl border",
        "bg-secondary/10 border-secondary/30"
      )}>
        <CheckCircle className="w-6 h-6 text-secondary shrink-0" />
        <div className="min-w-0">
          <p className="font-display text-lg text-secondary leading-none">
            Correto! {points ? `+${points}pts` : ''}
          </p>
          {playerName && (
            <p className="text-xs text-muted-foreground truncate mt-0.5">{playerName}</p>
          )}
        </div>
      </div>
    );
  }

  if (visible === 'wrong') {
    return (
      <div className={cn(
        "flex items-center gap-3 px-4 py-3 rounded-xl border",
        "bg-destructive/10 border-destructive/30"
      )}>
        <XCircle className="w-6 h-6 text-destructive shrink-0" />
        <div>
          <p className="font-display text-lg text-destructive leading-none">Incorreto</p>
          <p className="text-xs text-muted-foreground mt-0.5">Continue tentando!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-3 rounded-xl border border-dashed border-border bg-muted/30">
      <p className="text-sm text-muted-foreground text-center">
        Digite o nome do jogador lendário
      </p>
    </div>
  );
};
