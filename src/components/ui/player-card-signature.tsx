import * as React from "react"
import { cn } from "@/lib/utils"
import { cva, type VariantProps } from "class-variance-authority"
import { FluCard } from "./flu-card"

const playerCardVariants = cva(
  "group relative overflow-hidden cursor-pointer",
  {
    variants: {
      variant: {
        default: "",
        tricolor: "",
        featured: "ring-2 ring-primary/30",
        legendary: "ring-2 ring-secondary/50 shadow-[var(--shadow-success)]",
      },
      size: {
        sm: "w-32 h-40",
        default: "w-40 h-52",
        lg: "w-48 h-64",
        xl: "w-56 h-72",
      },
      hover: {
        lift: "hover:translate-y-[-4px]",
        scale: "hover:scale-105",
        glow: "hover:shadow-[var(--shadow-tricolor)]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      hover: "lift",
    },
  }
)

export interface PlayerCardSignatureProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof playerCardVariants> {
  playerName: string
  position?: string
  imageUrl?: string
  difficulty?: "easy" | "medium" | "hard" | "legendary"
  decade?: string
  stats?: {
    accuracy?: number
    attempts?: number
  }
  showStats?: boolean
}

const PlayerCardSignature = React.forwardRef<HTMLDivElement, PlayerCardSignatureProps>(
  ({ 
    className, 
    variant, 
    size, 
    hover,
    playerName,
    position,
    imageUrl,
    difficulty,
    decade,
    stats,
    showStats = false,
    ...props 
  }, ref) => {
    const getDifficultyColor = () => {
      switch (difficulty) {
        case "easy": return "text-green-500"
        case "medium": return "text-yellow-500"
        case "hard": return "text-orange-500"
        case "legendary": return "text-primary"
        default: return "text-muted-foreground"
      }
    }

    const getDifficultyBadge = () => {
      switch (difficulty) {
        case "easy": return "🟢"
        case "medium": return "🟡"
        case "hard": return "🟠"
        case "legendary": return "⭐"
        default: return ""
      }
    }

    return (
      <FluCard
        ref={ref}
        variant={variant === "legendary" ? "tricolor" : variant === "featured" ? "grena" : "elegant"}
        hover={hover}
        size="sm"
        className={cn(playerCardVariants({ variant, size, hover, className }))}
        {...props}
      >
        {/* Image Container */}
        <div className="relative h-3/5 overflow-hidden rounded-t-lg">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={playerName}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
              <span className="text-4xl">⚽</span>
            </div>
          )}
          
          {/* Difficulty Badge */}
          {difficulty && (
            <div className="absolute top-2 right-2 bg-background/90 backdrop-blur-sm rounded-full p-1 text-xs">
              {getDifficultyBadge()}
            </div>
          )}
          
          {/* Overlay on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>

        {/* Content */}
        <div className="h-2/5 p-3 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-sm leading-tight line-clamp-2 group-hover:text-primary transition-colors">
              {playerName}
            </h3>
            
            {position && (
              <p className="text-xs text-muted-foreground mt-1">
                {position}
              </p>
            )}
            
            {decade && (
              <p className="text-xs text-secondary font-medium">
                {decade}
              </p>
            )}
          </div>

          {/* Stats */}
          {showStats && stats && (
            <div className="flex justify-between text-xs mt-2 pt-2 border-t border-border/50">
              {stats.accuracy !== undefined && (
                <span className={cn("font-medium", getDifficultyColor())}>
                  {stats.accuracy}% acerto
                </span>
              )}
              {stats.attempts !== undefined && (
                <span className="text-muted-foreground">
                  {stats.attempts} tentativas
                </span>
              )}
            </div>
          )}
        </div>

        {/* Tricolor stripe for legendary cards */}
        {variant === "legendary" && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-secondary to-primary" />
        )}
      </FluCard>
    )
  }
)
PlayerCardSignature.displayName = "PlayerCardSignature"

// eslint-disable-next-line react-refresh/only-export-components
export { PlayerCardSignature, playerCardVariants }