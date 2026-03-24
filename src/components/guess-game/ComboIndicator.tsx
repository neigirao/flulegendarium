
import { cn } from "@/lib/utils";
import { Flame } from "lucide-react";

interface ComboIndicatorProps {
  streak: number;
  className?: string;
}

export const ComboIndicator = ({ streak, className }: ComboIndicatorProps) => {
  if (streak < 2) return null;

  return (
    <div className={cn(
      "flex items-center gap-1.5 px-3 py-1.5 rounded-full",
      "bg-warning/15 border border-warning/30 backdrop-blur-sm",
      "animate-scale-in",
      className
    )}>
      <Flame className="w-4 h-4 text-warning" />
      <span className="text-sm font-bold text-warning tabular-nums">
        {streak}x
      </span>
      <span className="text-xs font-semibold text-warning/80 uppercase tracking-wider">
        Combo
      </span>
    </div>
  );
};
