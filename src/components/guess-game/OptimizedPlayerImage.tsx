
import { memo } from "react";
import { Player } from "@/types/guess-game";
import { SimplePlayerImage } from "./SimplePlayerImage";

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
  console.log('🚀 OptimizedPlayerImage rendering:', {
    player: player.name,
    imageUrl: player.image_url,
    priority,
    gameKey
  });

  return (
    <SimplePlayerImage
      key={`${player.id}-${gameKey || 'default'}`}
      player={player}
      onImageLoaded={onImageLoaded}
    />
  );
});

OptimizedPlayerImage.displayName = 'OptimizedPlayerImage';
