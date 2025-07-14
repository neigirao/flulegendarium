import * as React from "react"
import { cn } from "@/lib/utils"
import { cva, type VariantProps } from "class-variance-authority"

const scoreDisplayVariants = cva(
  "inline-flex items-center justify-center font-bold transition-all duration-500",
  {
    variants: {
      variant: {
        default: "text-foreground",
        tricolor: "bg-gradient-to-r from-flu-grena via-flu-verde to-flu-grena bg-clip-text text-transparent",
        grena: "text-flu-grena",
        verde: "text-flu-verde",
        success: "text-flu-verde animate-pulse",
        highlight: "text-flu-grena drop-shadow-sm",
      },
      size: {
        sm: "text-lg",
        default: "text-2xl",
        lg: "text-4xl",
        xl: "text-6xl",
      },
      animated: {
        none: "",
        bounce: "animate-bounce-gentle",
        pulse: "animate-pulse",
        scale: "animate-[scale-in_0.5s_ease-out]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      animated: "none",
    },
  }
)

export interface ScoreDisplayProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof scoreDisplayVariants> {
  score: number
  maxScore?: number
  showPercentage?: boolean
  prefix?: string
  suffix?: string
}

const ScoreDisplay = React.forwardRef<HTMLDivElement, ScoreDisplayProps>(
  ({ 
    className, 
    variant, 
    size, 
    animated, 
    score, 
    maxScore, 
    showPercentage = false,
    prefix = "",
    suffix = "",
    ...props 
  }, ref) => {
    const [displayScore, setDisplayScore] = React.useState(0)
    
    React.useEffect(() => {
      const timer = setTimeout(() => {
        setDisplayScore(score)
      }, 100)
      return () => clearTimeout(timer)
    }, [score])

    const percentage = maxScore ? Math.round((score / maxScore) * 100) : 0
    const displayValue = showPercentage ? `${percentage}%` : displayScore.toString()

    return (
      <div
        ref={ref}
        className={cn(scoreDisplayVariants({ variant, size, animated, className }))}
        {...props}
      >
        {prefix && <span className="opacity-70 mr-1">{prefix}</span>}
        <span className="tabular-nums">
          {displayValue}
        </span>
        {maxScore && !showPercentage && (
          <span className="opacity-70 text-sm ml-1">/{maxScore}</span>
        )}
        {suffix && <span className="opacity-70 ml-1">{suffix}</span>}
      </div>
    )
  }
)
ScoreDisplay.displayName = "ScoreDisplay"

export { ScoreDisplay, scoreDisplayVariants }