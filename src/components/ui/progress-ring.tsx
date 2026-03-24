import * as React from "react"
import { cn } from "@/lib/utils"
import { cva, type VariantProps } from "class-variance-authority"

const progressRingVariants = cva(
  "relative inline-flex items-center justify-center",
  {
    variants: {
      size: {
        sm: "w-12 h-12",
        default: "w-16 h-16",
        lg: "w-24 h-24",
        xl: "w-32 h-32",
      },
      variant: {
        default: "",
        tricolor: "",
        grena: "",
        verde: "",
      },
    },
    defaultVariants: {
      size: "default",
      variant: "default",
    },
  }
)

export interface ProgressRingProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof progressRingVariants> {
  progress: number // 0-100
  strokeWidth?: number
  showPercentage?: boolean
  animated?: boolean
}

const ProgressRing = React.forwardRef<HTMLDivElement, ProgressRingProps>(
  ({ 
    className, 
    size, 
    variant, 
    progress, 
    strokeWidth = 4,
    showPercentage = true,
    animated = true,
    children,
    ...props 
  }, ref) => {
    const radius = 45
    const circumference = 2 * Math.PI * radius
    const strokeDashoffset = circumference - (progress / 100) * circumference

    const getStrokeColor = () => {
      switch (variant) {
        case "tricolor":
          return "url(#tricolor-gradient)"
        case "grena":
          return "hsl(var(--primary))"
        case "verde":
          return "hsl(var(--secondary))"
        default:
          return "hsl(var(--primary))"
      }
    }

    const sizeMap = {
      sm: 12,
      default: 16,
      lg: 24,
      xl: 32,
    }
    
    const svgSize = sizeMap[size || "default"] * 4 // Convert to pixels

    return (
      <div
        ref={ref}
        className={cn(progressRingVariants({ size, variant, className }))}
        {...props}
      >
        <svg
          width={svgSize}
          height={svgSize}
          viewBox="0 0 100 100"
          className="transform -rotate-90"
        >
          <defs>
            <linearGradient id="tricolor-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="hsl(var(--primary))" />
              <stop offset="50%" stopColor="hsl(var(--secondary))" />
              <stop offset="100%" stopColor="hsl(var(--primary))" />
            </linearGradient>
          </defs>
          
          {/* Background circle */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            stroke="hsl(var(--muted))"
            strokeWidth={strokeWidth}
            fill="none"
            className="opacity-20"
          />
          
          {/* Progress circle */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            stroke={getStrokeColor()}
            strokeWidth={strokeWidth}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className={cn(
              "transition-all duration-1000 ease-out",
              animated && "animate-[draw-progress_1s_ease-out]"
            )}
            style={{
              filter: variant === "tricolor" ? "drop-shadow(0 0 8px hsl(var(--primary) / 0.3))" : undefined
            }}
          />
        </svg>
        
        {/* Center content */}
        <div className="absolute inset-0 flex items-center justify-center">
          {children || (showPercentage && (
            <span className={cn(
              "font-bold tabular-nums",
              size === "sm" && "text-xs",
              size === "default" && "text-sm",
              size === "lg" && "text-lg",
              size === "xl" && "text-2xl",
              variant === "tricolor" && "bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent",
              variant === "grena" && "text-primary",
              variant === "verde" && "text-secondary"
            )}>
              {Math.round(progress)}%
            </span>
          ))}
        </div>
        
        <style>{`
          @keyframes draw-progress {
            from {
              stroke-dashoffset: ${circumference};
            }
            to {
              stroke-dashoffset: ${strokeDashoffset};
            }
          }
        `}</style>
      </div>
    )
  }
)
ProgressRing.displayName = "ProgressRing"

// eslint-disable-next-line react-refresh/only-export-components
export { ProgressRing, progressRingVariants }