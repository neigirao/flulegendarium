import { memo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { History, ChevronDown, ChevronUp, Check, X, Clock, Target, Trophy, Percent } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { GuessHistoryEntry } from '@/hooks/use-guess-history';

interface GuessHistoryPanelProps {
  history: GuessHistoryEntry[];
  stats: {
    totalGuesses: number;
    correctGuesses: number;
    incorrectGuesses: number;
    accuracy: number;
  };
  className?: string;
  compact?: boolean;
}

export const GuessHistoryPanel = memo(({
  history,
  stats,
  className,
  compact = false
}: GuessHistoryPanelProps) => {
  const [isExpanded, setIsExpanded] = useState(!compact);

  if (history.length === 0) {
    return null;
  }

  const lastEntry = history[history.length - 1];

  if (compact) {
    return (
      <Card className={cn("border-primary/20 bg-card/95 backdrop-blur-sm", className)}>
        <CardHeader className="p-3 pb-0">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center justify-between w-full touch-target"
          >
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-primary" />
              <CardTitle className="font-display text-sm">Histórico</CardTitle>
              <Badge variant="secondary" className="text-xs">
                {stats.correctGuesses}/{stats.totalGuesses}
              </Badge>
            </div>
            {isExpanded ? (
              <ChevronUp className="w-4 h-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            )}
          </button>
        </CardHeader>
        
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <CardContent className="p-3 pt-2">
                <ScrollArea className="max-h-32">
                  <div className="space-y-1">
                    {[...history].reverse().slice(0, 5).map((entry, index) => (
                      <CompactHistoryItem key={entry.id} entry={entry} isLatest={index === 0} />
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    );
  }

  return (
    <Card className={cn("border-primary/20", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="font-display text-display-sm flex items-center gap-2">
            <History className="w-5 h-5 text-primary" />
            Histórico de Tentativas
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="touch-target"
          >
            {isExpanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </Button>
        </div>
        
        {/* Stats Summary */}
        <div className="grid grid-cols-4 gap-2 mt-3">
          <StatCard icon={Target} label="Total" value={stats.totalGuesses} />
          <StatCard icon={Check} label="Acertos" value={stats.correctGuesses} variant="success" />
          <StatCard icon={X} label="Erros" value={stats.incorrectGuesses} variant="error" />
          <StatCard icon={Percent} label="Taxa" value={`${stats.accuracy.toFixed(0)}%`} />
        </div>
      </CardHeader>
      
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <CardContent className="pt-0">
              <ScrollArea className="max-h-64">
                <div className="space-y-2">
                  {[...history].reverse().map((entry, index) => (
                    <HistoryItem key={entry.id} entry={entry} isLatest={index === 0} />
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
});

GuessHistoryPanel.displayName = 'GuessHistoryPanel';

// Compact history item for collapsed view
const CompactHistoryItem = memo(({ entry, isLatest }: { entry: GuessHistoryEntry; isLatest: boolean }) => (
  <div className={cn(
    "flex items-center gap-2 text-xs py-1 px-2 rounded",
    isLatest && "bg-muted/50",
    entry.isCorrect ? "text-success" : "text-error"
  )}>
    {entry.isCorrect ? (
      <Check className="w-3 h-3" />
    ) : (
      <X className="w-3 h-3" />
    )}
    <span className="font-body truncate flex-1">{entry.playerName}</span>
    {entry.pointsEarned && entry.pointsEarned > 0 && (
      <span className="text-success font-medium">+{entry.pointsEarned}</span>
    )}
  </div>
));

CompactHistoryItem.displayName = 'CompactHistoryItem';

// Full history item
const HistoryItem = memo(({ entry, isLatest }: { entry: GuessHistoryEntry; isLatest: boolean }) => (
  <motion.div
    initial={isLatest ? { opacity: 0, y: -10 } : false}
    animate={{ opacity: 1, y: 0 }}
    className={cn(
      "flex items-center gap-3 p-3 rounded-lg border transition-all",
      isLatest && "ring-2 ring-primary/20",
      entry.isCorrect 
        ? "bg-success/5 border-success/20" 
        : "bg-error/5 border-error/20"
    )}
  >
    {/* Status Icon */}
    <div className={cn(
      "w-8 h-8 rounded-full flex items-center justify-center",
      entry.isCorrect ? "bg-success/20" : "bg-error/20"
    )}>
      {entry.isCorrect ? (
        <Check className="w-4 h-4 text-success" />
      ) : (
        <X className="w-4 h-4 text-error" />
      )}
    </div>
    
    {/* Player Info */}
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2">
        <span className={cn(
          "font-display text-sm truncate",
          entry.isCorrect ? "text-success" : "text-error"
        )}>
          {entry.playerName}
        </span>
        {entry.difficulty && (
          <Badge variant="outline" className="text-xs">
            {entry.difficulty}
          </Badge>
        )}
      </div>
      {entry.guess && entry.guess !== entry.playerName && (
        <p className="font-body text-xs text-muted-foreground truncate">
          Palpite: "{entry.guess}"
        </p>
      )}
    </div>
    
    {/* Points and Time */}
    <div className="text-right shrink-0">
      {entry.pointsEarned !== undefined && entry.pointsEarned > 0 && (
        <div className="flex items-center gap-1 text-success font-display text-sm">
          <Trophy className="w-3 h-3" />
          +{entry.pointsEarned}
        </div>
      )}
      {entry.timeRemaining !== undefined && (
        <div className="flex items-center gap-1 text-muted-foreground text-xs">
          <Clock className="w-3 h-3" />
          {entry.timeRemaining}s
        </div>
      )}
    </div>
  </motion.div>
));

HistoryItem.displayName = 'HistoryItem';

// Small stat card component
const StatCard = memo(({ 
  icon: Icon, 
  label, 
  value, 
  variant 
}: { 
  icon: React.ElementType; 
  label: string; 
  value: string | number;
  variant?: 'success' | 'error';
}) => (
  <div className={cn(
    "text-center p-2 rounded-lg",
    variant === 'success' && "bg-success/10",
    variant === 'error' && "bg-error/10",
    !variant && "bg-muted/50"
  )}>
    <Icon className={cn(
      "w-4 h-4 mx-auto mb-1",
      variant === 'success' && "text-success",
      variant === 'error' && "text-error",
      !variant && "text-muted-foreground"
    )} />
    <div className={cn(
      "font-display text-sm",
      variant === 'success' && "text-success",
      variant === 'error' && "text-error",
      !variant && "text-foreground"
    )}>
      {value}
    </div>
    <div className="font-body text-xs text-muted-foreground">{label}</div>
  </div>
));

StatCard.displayName = 'StatCard';
