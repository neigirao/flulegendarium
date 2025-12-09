import React, { useEffect, useState } from 'react';
import Confetti from 'react-confetti';
import { Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PersonalRecordConfettiProps {
  show: boolean;
  previousRecord?: number;
  newRecord: number;
  onComplete?: () => void;
}

export const PersonalRecordConfetti: React.FC<PersonalRecordConfettiProps> = ({
  show,
  previousRecord = 0,
  newRecord,
  onComplete
}) => {
  const [showConfetti, setShowConfetti] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
      
      const handleResize = () => {
        setWindowSize({ width: window.innerWidth, height: window.innerHeight });
      };
      
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  useEffect(() => {
    if (show) {
      setShowConfetti(true);
      setShowBanner(true);

      // Stop confetti after 4 seconds
      const confettiTimeout = setTimeout(() => {
        setShowConfetti(false);
      }, 4000);

      // Hide banner after 5 seconds
      const bannerTimeout = setTimeout(() => {
        setShowBanner(false);
        onComplete?.();
      }, 5000);

      return () => {
        clearTimeout(confettiTimeout);
        clearTimeout(bannerTimeout);
      };
    }
  }, [show, onComplete]);

  if (!show && !showBanner) return null;

  // Fluminense colors for confetti
  const fluColors = ['#7A0213', '#00613C', '#FFFFFF', '#FFD700'];

  return (
    <>
      {showConfetti && (
        <Confetti
          width={windowSize.width}
          height={windowSize.height}
          numberOfPieces={200}
          recycle={false}
          colors={fluColors}
          gravity={0.3}
          style={{ position: 'fixed', top: 0, left: 0, zIndex: 9999, pointerEvents: 'none' }}
        />
      )}
      
      {showBanner && (
        <div 
          className={cn(
            "fixed top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[10000]",
            "bg-gradient-to-r from-primary via-secondary to-primary",
            "px-8 py-6 rounded-2xl shadow-2xl border-4 border-warning",
            "animate-bounce-in"
          )}
        >
          <div className="flex flex-col items-center gap-3 text-primary-foreground">
            <div className="flex items-center gap-3">
              <Trophy className="w-10 h-10 text-warning animate-pulse" />
              <span className="text-2xl font-bold">NOVO RECORDE!</span>
              <Trophy className="w-10 h-10 text-warning animate-pulse" />
            </div>
            
            <div className="text-center">
              <p className="text-4xl font-extrabold text-warning drop-shadow-lg">
                {newRecord} pontos
              </p>
              {previousRecord > 0 && (
                <p className="text-sm mt-2 opacity-90">
                  Recorde anterior: {previousRecord} pontos (+{newRecord - previousRecord})
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
