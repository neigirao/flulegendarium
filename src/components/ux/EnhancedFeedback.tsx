import { CheckCircle, XCircle, Clock, Target, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface FeedbackType {
  type: 'success' | 'error' | 'timeout' | 'hint' | 'achievement';
  title: string;
  message: string;
  points?: number;
  streak?: number;
}

interface EnhancedFeedbackProps {
  feedback: FeedbackType;
  show: boolean;
  onClose: () => void;
}

export const EnhancedFeedback = ({ feedback, show, onClose }: EnhancedFeedbackProps) => {
  if (!show) return null;

  const feedbackStyles = {
    success: {
      bg: "bg-gradient-to-r from-success to-success/80",
      icon: CheckCircle,
      iconColor: "text-success-foreground",
      textColor: "text-success-foreground",
      border: "border-success/50",
      shadow: "shadow-success/50"
    },
    error: {
      bg: "bg-gradient-to-r from-destructive to-destructive/80",
      icon: XCircle,
      iconColor: "text-destructive-foreground",
      textColor: "text-destructive-foreground",
      border: "border-destructive/50",
      shadow: "shadow-destructive/50"
    },
    timeout: {
      bg: "bg-gradient-to-r from-warning to-warning/80",
      icon: Clock,
      iconColor: "text-warning-foreground",
      textColor: "text-warning-foreground",
      border: "border-warning/50",
      shadow: "shadow-warning/50"
    },
    hint: {
      bg: "bg-gradient-to-r from-info to-info/80",
      icon: Target,
      iconColor: "text-info-foreground",
      textColor: "text-info-foreground",
      border: "border-info/50",
      shadow: "shadow-info/50"
    },
    achievement: {
      bg: "bg-gradient-to-r from-accent to-accent/80",
      icon: Sparkles,
      iconColor: "text-accent-foreground",
      textColor: "text-accent-foreground",
      border: "border-accent/50",
      shadow: "shadow-accent/50"
    }
  };

  const style = feedbackStyles[feedback.type];
  const Icon = style.icon;

  return (
    <div 
      className={cn(
        "fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50",
        "w-[90%] max-w-md mx-auto"
      )}
    >
      <div 
        className={cn(
          "relative p-6 rounded-2xl border-2 backdrop-blur-sm shadow-2xl",
          "animate-scale-in transform-gpu transition-all duration-300",
          style.bg,
          style.border,
          style.shadow
        )}
        onClick={onClose}
      >
        {/* Background pattern */}
        <div className="absolute inset-0 rounded-2xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-black/10"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center text-center space-y-4">
          {/* Icon with animation */}
          <div className="relative">
            <div className={cn(
              "w-16 h-16 rounded-full bg-white/20 flex items-center justify-center",
              feedback.type === 'success' && "animate-bounce",
              feedback.type === 'achievement' && "animate-pulse"
            )}>
              <Icon className={cn("w-8 h-8", style.iconColor)} />
            </div>
            
            {/* Ripple effect for success */}
            {feedback.type === 'success' && (
              <div className="absolute inset-0 rounded-full border-4 border-white/30 animate-ping"></div>
            )}
          </div>

          {/* Title */}
          <h3 className={cn("text-xl font-bold", style.textColor)}>
            {feedback.title}
          </h3>

          {/* Message */}
          <p className={cn("text-sm opacity-90", style.textColor)}>
            {feedback.message}
          </p>

          {/* Points and streak display */}
          {(feedback.points !== undefined || feedback.streak !== undefined) && (
            <div className="flex items-center gap-4 pt-2">
              {feedback.points !== undefined && (
                <div className="flex items-center gap-2 px-3 py-1 bg-white/20 rounded-full">
                  <Target className="w-4 h-4 text-white" />
                  <span className="text-white font-medium">+{feedback.points}</span>
                </div>
              )}
              
              {feedback.streak !== undefined && feedback.streak > 1 && (
                <div className="flex items-center gap-2 px-3 py-1 bg-white/20 rounded-full">
                  <Sparkles className="w-4 h-4 text-white" />
                  <span className="text-white font-medium">{feedback.streak}x</span>
                </div>
              )}
            </div>
          )}

          {/* Touch to close hint */}
          <p className="text-xs opacity-60 text-white pt-2">
            Toque para continuar
          </p>
        </div>

        {/* Decorative elements */}
        {feedback.type === 'achievement' && (
          <>
            <div className="absolute -top-1 -left-1 w-3 h-3 bg-warning rounded-full animate-ping"></div>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-warning rounded-full animate-ping" style={{ animationDelay: '0.5s' }}></div>
            <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-warning rounded-full animate-ping" style={{ animationDelay: '1s' }}></div>
            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-warning rounded-full animate-ping" style={{ animationDelay: '1.5s' }}></div>
          </>
        )}
      </div>

      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm -z-10"
        onClick={onClose}
      ></div>
    </div>
  );
};