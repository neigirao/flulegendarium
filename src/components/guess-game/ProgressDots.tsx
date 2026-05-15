import { cn } from "@/lib/utils";

interface ProgressDotsProps {
  total?: number;
  correct: number;
  wrong: number;
}

export const ProgressDots = ({ total = 10, correct, wrong }: ProgressDotsProps) => {
  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: total }).map((_, i) => {
        const isCorrect = i < correct;
        const isWrong = i >= correct && i < correct + wrong;
        return (
          <div
            key={i}
            className={cn(
              "w-2.5 h-2.5 rounded-full transition-all duration-300",
              isCorrect && "bg-secondary shadow-[0_0_6px_#006140]",
              isWrong && "bg-destructive",
              !isCorrect && !isWrong && "bg-muted/40 border border-border"
            )}
          />
        );
      })}
    </div>
  );
};
