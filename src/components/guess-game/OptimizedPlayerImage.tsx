
import { memo } from "react";
import { Player } from "@/types/guess-game";
import { LCPOptimizedPlayerImage } from "@/components/performance/LCPOptimizedPlayerImage";
import { useCriticalResources } from "@/hooks/use-critical-resources";

interface OptimizedPlayerImageProps {
  player: Player;
  onImageLoaded?: () => void;
  priority?: boolean;
  gameKey?: string;
}

export const OptimizedPlayerImage = memo(({ 
  player, 
  onImageLoaded, 
  priority = true,
  gameKey 
}: OptimizedPlayerImageProps) => {
  // Initialize critical resources preloading
  useCriticalResources();

  console.log('🚀 OptimizedPlayerImage rendering:', {
    player: player.name,
    priority,
    gameKey
  });

  return (
    <LCPOptimizedPlayerImage
      key={`${player.id}-${gameKey || 'default'}`}
      player={player}
      priority={priority}
      onImageLoaded={onImageLoaded}
      className="transition-all duration-300"
    />
  );
});

OptimizedPlayerImage.displayName = 'OptimizedPlayerImage';
