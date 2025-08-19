
import { useState } from 'react';
import { Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ShareSystem2 } from './ShareSystem2';
import { Achievement } from "@/types/achievements";

interface QuickShareButtonProps {
  score: number;
  correctGuesses: number;
  gameMode?: string;
  streak?: number;
  achievements?: Achievement[];
  playerName?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const QuickShareButton = ({ 
  score, 
  correctGuesses, 
  gameMode = "Clássico",
  streak = 0,
  achievements = [],
  playerName,
  variant = 'default',
  size = 'md',
  className = ""
}: QuickShareButtonProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const getSizeClasses = () => {
    switch (size) {
      case 'sm': return 'px-3 py-2 text-sm';
      case 'lg': return 'px-6 py-3 text-lg';
      default: return 'px-4 py-2';
    }
  };

  return (
    <>
      <Button
        onClick={() => setIsModalOpen(true)}
        variant={variant}
        className={`flex items-center gap-2 ${getSizeClasses()} ${className}`}
      >
        <Share2 className="w-4 h-4" />
        Compartilhar
      </Button>

      <ShareSystem2
        trigger={undefined}
        score={score}
        correctGuesses={correctGuesses}
        gameMode={gameMode}
        streak={streak}
        achievements={achievements}
        playerName={playerName}
      />
    </>
  );
};
