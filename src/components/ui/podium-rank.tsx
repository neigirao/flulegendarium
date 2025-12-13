import { memo, ReactNode } from 'react';
import { Crown, Medal, Award, User, Flame } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';

interface PodiumRankProps {
  rank: number;
  playerName: string;
  score: number;
  isGuest?: boolean;
  avatarSlot?: ReactNode;
  className?: string;
  variant?: 'card' | 'row';
  showAnimation?: boolean;
}

// Design tokens for podium positions
const podiumConfig = {
  1: {
    icon: Crown,
    iconColor: 'text-yellow-500',
    bgGradient: 'bg-gradient-to-br from-yellow-100 via-yellow-50 to-amber-100 dark:from-yellow-900/30 dark:via-yellow-800/20 dark:to-amber-900/30',
    borderColor: 'border-yellow-400 dark:border-yellow-600',
    badgeBg: 'bg-gradient-to-r from-yellow-400 to-amber-500',
    badgeText: 'text-yellow-950',
    scoreColor: 'text-yellow-600 dark:text-yellow-400',
    shadow: 'shadow-lg shadow-yellow-200/50 dark:shadow-yellow-900/30',
    scale: 'scale-100',
    rankSize: 'w-14 h-14 text-2xl',
    fontSize: 'text-xl md:text-2xl',
    label: 'Campeão',
    padding: 'p-5 md:p-6',
  },
  2: {
    icon: Medal,
    iconColor: 'text-slate-400',
    bgGradient: 'bg-gradient-to-br from-slate-100 via-gray-50 to-slate-100 dark:from-slate-800/30 dark:via-gray-800/20 dark:to-slate-800/30',
    borderColor: 'border-slate-300 dark:border-slate-600',
    badgeBg: 'bg-gradient-to-r from-slate-300 to-slate-400',
    badgeText: 'text-slate-800',
    scoreColor: 'text-slate-600 dark:text-slate-300',
    shadow: 'shadow-md shadow-slate-200/50 dark:shadow-slate-900/30',
    scale: 'scale-95',
    rankSize: 'w-12 h-12 text-xl',
    fontSize: 'text-lg md:text-xl',
    label: 'Vice',
    padding: 'p-4 md:p-5',
  },
  3: {
    icon: Award,
    iconColor: 'text-amber-600',
    bgGradient: 'bg-gradient-to-br from-amber-100 via-orange-50 to-amber-100 dark:from-amber-900/30 dark:via-orange-800/20 dark:to-amber-900/30',
    borderColor: 'border-amber-400 dark:border-amber-600',
    badgeBg: 'bg-gradient-to-r from-amber-500 to-orange-500',
    badgeText: 'text-amber-950',
    scoreColor: 'text-amber-600 dark:text-amber-400',
    shadow: 'shadow-md shadow-amber-200/50 dark:shadow-amber-900/30',
    scale: 'scale-90',
    rankSize: 'w-11 h-11 text-lg',
    fontSize: 'text-base md:text-lg',
    label: 'Bronze',
    padding: 'p-3 md:p-4',
  },
} as const;

const defaultConfig = {
  icon: null,
  iconColor: '',
  bgGradient: 'bg-card',
  borderColor: 'border-border',
  badgeBg: 'bg-muted',
  badgeText: 'text-muted-foreground',
  scoreColor: 'text-primary',
  shadow: '',
  scale: 'scale-100',
  rankSize: 'w-10 h-10 text-base',
  fontSize: 'text-base',
  label: '',
  padding: 'p-3 md:p-4',
};

export const PodiumRank = memo(({
  rank,
  playerName,
  score,
  isGuest = false,
  avatarSlot,
  className,
  variant = 'card',
  showAnimation = true,
}: PodiumRankProps) => {
  const config = rank <= 3 ? podiumConfig[rank as 1 | 2 | 3] : defaultConfig;
  const Icon = config.icon;
  const isPodium = rank <= 3;

  const content = (
    <div
      className={cn(
        'rounded-xl border-2 transition-all duration-300',
        config.bgGradient,
        config.borderColor,
        config.shadow,
        config.padding,
        isPodium && 'hover:scale-[1.02]',
        !isPodium && 'hover:bg-muted/50',
        className
      )}
    >
      <div className="flex items-center justify-between gap-3">
        {/* Rank Badge */}
        <div className="flex items-center gap-3 md:gap-4">
          <div
            className={cn(
              'rounded-full flex items-center justify-center font-display font-bold relative',
              config.rankSize,
              isPodium ? config.badgeBg : 'bg-primary',
              isPodium ? config.badgeText : 'text-primary-foreground'
            )}
          >
            {Icon ? (
              <Icon className="w-6 h-6" />
            ) : (
              rank
            )}
            {rank === 1 && (
              <Flame className="absolute -top-1 -right-1 w-4 h-4 text-orange-500 animate-pulse" />
            )}
          </div>

          {/* Player Info */}
          <div className="flex flex-col">
            <div className="flex items-center gap-2 flex-wrap">
              {avatarSlot || (
                <span className={cn('font-bold font-display', config.fontSize)}>
                  {playerName}
                </span>
              )}
              {isPodium && (
                <Badge 
                  className={cn(
                    'text-[10px] px-1.5 py-0.5 font-medium border-0',
                    config.badgeBg,
                    config.badgeText
                  )}
                >
                  {config.label}
                </Badge>
              )}
              {isGuest && (
                <Badge variant="outline" className="text-[10px] px-1.5 py-0.5">
                  <User className="w-2.5 h-2.5 mr-0.5" />
                  Convidado
                </Badge>
              )}
            </div>
            {variant === 'card' && (
              <span className="text-sm text-muted-foreground font-body">
                {score.toLocaleString('pt-BR')} pontos
              </span>
            )}
          </div>
        </div>

        {/* Score */}
        <div className="text-right">
          <div className={cn(
            'font-display font-black',
            isPodium ? 'text-2xl md:text-3xl' : 'text-xl md:text-2xl',
            config.scoreColor
          )}>
            {score.toLocaleString('pt-BR')}
          </div>
          <div className="text-xs text-muted-foreground font-body">pts</div>
        </div>
      </div>
    </div>
  );

  if (showAnimation) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ 
          delay: rank * 0.08,
          duration: 0.4,
          type: 'spring',
          stiffness: 100,
        }}
      >
        {content}
      </motion.div>
    );
  }

  return content;
});

PodiumRank.displayName = 'PodiumRank';

// Compact version for lists
export const PodiumRankCompact = memo(({
  rank,
  playerName,
  score,
  isGuest = false,
  avatarSlot,
  className,
  showAnimation = true,
}: Omit<PodiumRankProps, 'variant'>) => {
  const config = rank <= 3 ? podiumConfig[rank as 1 | 2 | 3] : defaultConfig;
  const Icon = config.icon;
  const isPodium = rank <= 3;

  const content = (
    <div
      className={cn(
        'flex items-center justify-between p-3 rounded-lg border transition-all',
        config.bgGradient,
        config.borderColor,
        isPodium && config.shadow,
        'hover:scale-[1.01]',
        className
      )}
    >
      <div className="flex items-center gap-3">
        {/* Rank Circle */}
        <div
          className={cn(
            'rounded-full flex items-center justify-center font-display font-bold',
            isPodium ? 'w-9 h-9' : 'w-8 h-8',
            isPodium ? config.badgeBg : 'bg-muted',
            isPodium ? config.badgeText : 'text-muted-foreground'
          )}
        >
          {Icon ? (
            <Icon className={cn(isPodium ? 'w-5 h-5' : 'w-4 h-4')} />
          ) : (
            <span className="text-sm">{rank}</span>
          )}
        </div>

        {/* Player Info */}
        <div className="flex items-center gap-2">
          {avatarSlot || (
            <span className={cn(
              'font-bold',
              isPodium ? 'font-display' : 'font-body'
            )}>
              {playerName}
            </span>
          )}
          {isGuest && (
            <Badge variant="outline" className="text-[10px] px-1 py-0">
              <User className="w-2.5 h-2.5" />
            </Badge>
          )}
        </div>
      </div>

      {/* Score */}
      <span className={cn(
        'font-bold',
        isPodium ? 'font-display text-lg' : 'font-body',
        config.scoreColor
      )}>
        {score} pts
      </span>
    </div>
  );

  if (showAnimation) {
    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: rank * 0.05 }}
      >
        {content}
      </motion.div>
    );
  }

  return content;
});

PodiumRankCompact.displayName = 'PodiumRankCompact';
