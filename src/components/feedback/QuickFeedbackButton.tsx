import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MessageSquare } from 'lucide-react';
import { FeedbackModal } from './FeedbackModal';

interface QuickFeedbackButtonProps {
  gameMode?: string;
  playerName?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'lg';
  className?: string;
}

export const QuickFeedbackButton = ({ 
  gameMode, 
  playerName, 
  variant = 'outline',
  size = 'sm',
  className = ""
}: QuickFeedbackButtonProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <Button
        onClick={() => setIsModalOpen(true)}
        variant={variant}
        size={size}
        className={`flex items-center gap-2 ${className}`}
      >
        <MessageSquare className="w-4 h-4" />
        Feedback
      </Button>

      <FeedbackModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        gameMode={gameMode}
        playerName={playerName}
      />
    </>
  );
};