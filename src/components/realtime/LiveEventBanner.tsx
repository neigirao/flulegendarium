import { X, Sparkles, Trophy, Calendar, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useLiveEvents } from '@/hooks/use-live-events';

export const LiveEventBanner = () => {
  const { activeEvent } = useLiveEvents();
  const [isDismissed, setIsDismissed] = useState(false);

  if (!activeEvent || isDismissed) return null;

  const getEventIcon = () => {
    switch (activeEvent.event_type) {
      case 'anniversary': return <Calendar className="w-5 h-5" />;
      case 'achievement': return <Trophy className="w-5 h-5" />;
      case 'special': return <Sparkles className="w-5 h-5" />;
      case 'maintenance': return <AlertCircle className="w-5 h-5" />;
      default: return <Sparkles className="w-5 h-5" />;
    }
  };

  const getEventColor = () => {
    switch (activeEvent.event_type) {
      case 'anniversary': return 'bg-gradient-to-r from-primary/90 to-secondary/90';
      case 'achievement': return 'bg-gradient-to-r from-yellow-500/90 to-orange-500/90';
      case 'special': return 'bg-gradient-to-r from-purple-500/90 to-pink-500/90';
      case 'maintenance': return 'bg-gradient-to-r from-orange-500/90 to-red-500/90';
      default: return 'bg-gradient-to-r from-primary/90 to-secondary/90';
    }
  };

  return (
    <div className={`${getEventColor()} text-white p-4 mb-6 rounded-lg relative overflow-hidden`}>
      <div className="absolute inset-0 bg-black/10"></div>
      
      <div className="relative flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0">
            {getEventIcon()}
          </div>
          
          <div className="flex-1">
            <h3 className="font-bold text-lg">{activeEvent.title}</h3>
            <p className="text-sm opacity-90">{activeEvent.description}</p>
          </div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          className="text-white hover:bg-white/20 flex-shrink-0"
          onClick={() => setIsDismissed(true)}
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Animated decoration */}
      <div className="absolute -top-1 -right-1 w-20 h-20 bg-white/10 rounded-full blur-xl animate-pulse"></div>
      <div className="absolute -bottom-2 -left-2 w-16 h-16 bg-white/10 rounded-full blur-lg animate-pulse delay-1000"></div>
    </div>
  );
};