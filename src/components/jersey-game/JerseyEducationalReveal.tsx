import { cn } from "@/lib/utils";

interface JerseyEducationalRevealProps {
  isCorrect: boolean;
  correctYear: number;
  pointsEarned?: number;
  funFact?: string | null;
  eraLabel?: string;
}

export const JerseyEducationalReveal = ({
  isCorrect,
  correctYear,
  pointsEarned = 0,
  funFact,
  eraLabel,
}: JerseyEducationalRevealProps) => {
  return (
    <div className={cn(
      "rounded-2xl border px-5 py-4",
      "bg-gradient-to-br from-accent/6 to-primary/4 border-accent/25"
    )}>
      <div className="flex items-center gap-1.5 text-[10px] text-accent font-bold uppercase tracking-widest mb-1.5">
        📚 Curiosidade · {correctYear}
      </div>
      <div className="font-display text-[20px] text-primary leading-tight mb-1.5">
        {isCorrect
          ? `Você acertou! +${pointsEarned} pts`
          : `Era ${correctYear}${eraLabel ? ` — ${eraLabel}` : ''}`}
      </div>
      {funFact && (
        <p className="text-[13px] text-foreground leading-relaxed">{funFact}</p>
      )}
      {!funFact && (
        <p className="text-[13px] text-muted-foreground leading-relaxed">
          {isCorrect
            ? "Excelente! Você conhece bem as camisas do Flu."
            : "Continue praticando para conhecer melhor a história tricolor!"}
        </p>
      )}
    </div>
  );
};
