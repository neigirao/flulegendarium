import { memo } from 'react';
import { Clock, Zap, Timer, Coffee } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from '@/components/ui/popover';
import { useGameSettings, TIMER_OPTIONS, TimerDuration } from '@/hooks/use-game-settings';
import { cn } from '@/lib/utils';

interface TimerSelectorProps {
  className?: string;
  compact?: boolean;
}

const getTimerIcon = (duration: TimerDuration) => {
  switch (duration) {
    case 20:
      return Zap;
    case 30:
      return Timer;
    case 45:
      return Coffee;
    default:
      return Clock;
  }
};

export const TimerSelector = memo(({ className, compact = false }: TimerSelectorProps) => {
  const { settings, setTimerDuration } = useGameSettings();
  const CurrentIcon = getTimerIcon(settings.timerDuration);

  if (compact) {
    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button 
            variant="outline" 
            size="sm" 
            className={cn("touch-target gap-2", className)}
          >
            <CurrentIcon className="w-4 h-4" />
            {settings.timerDuration}s
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-56 p-2" align="end">
          <div className="space-y-1">
            <p className="font-display text-sm text-muted-foreground px-2 pb-2">
              Tempo por jogador
            </p>
            {TIMER_OPTIONS.map(option => {
              const Icon = getTimerIcon(option.value);
              const isSelected = settings.timerDuration === option.value;
              return (
                <button
                  key={option.value}
                  onClick={() => setTimerDuration(option.value)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors touch-target",
                    "font-body text-sm",
                    isSelected 
                      ? "bg-primary/10 text-primary" 
                      : "hover:bg-muted text-foreground"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span className="font-medium">{option.label}</span>
                  <span className="text-muted-foreground ml-auto text-xs">
                    {option.description}
                  </span>
                </button>
              );
            })}
          </div>
        </PopoverContent>
      </Popover>
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center gap-2">
        <Clock className="w-5 h-5 text-primary" />
        <span className="font-display text-display-sm">Tempo por Jogador</span>
      </div>
      
      <div className="grid grid-cols-3 gap-2">
        {TIMER_OPTIONS.map(option => {
          const Icon = getTimerIcon(option.value);
          const isSelected = settings.timerDuration === option.value;
          return (
            <button
              key={option.value}
              onClick={() => setTimerDuration(option.value)}
              className={cn(
                "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all touch-target",
                "font-body",
                isSelected 
                  ? "border-primary bg-primary/10 text-primary shadow-md" 
                  : "border-border hover:border-primary/50 bg-card text-foreground"
              )}
            >
              <Icon className={cn("w-6 h-6", isSelected && "text-primary")} />
              <span className="font-display text-xl">{option.label}</span>
              <span className={cn(
                "text-xs",
                isSelected ? "text-primary" : "text-muted-foreground"
              )}>
                {option.description}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
});

TimerSelector.displayName = 'TimerSelector';
