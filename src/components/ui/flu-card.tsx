import * as React from "react"
import { cn } from "@/lib/utils"
import { cva, type VariantProps } from "class-variance-authority"

const fluCardVariants = cva(
  "rounded-lg border shadow-sm transition-all duration-300",
  {
    variants: {
      variant: {
        default: "bg-card text-card-foreground border-border",
        tricolor: "bg-gradient-to-br from-flu-grena/5 via-accent/50 to-flu-verde/5 border-flu-grena/20 shadow-[var(--shadow-tricolor)]",
        grena: "bg-gradient-to-br from-flu-grena/10 to-flu-grena-dark/5 border-flu-grena/30 shadow-[var(--shadow-tricolor)]",
        verde: "bg-gradient-to-br from-flu-verde/10 to-flu-verde-dark/5 border-flu-verde/30 shadow-[var(--shadow-verde)]",
        elegant: "bg-gradient-to-br from-accent via-background to-accent/50 border-flu-grena/10 shadow-[var(--shadow-elegante)]",
        glass: "bg-background/80 backdrop-blur-md border-flu-grena/20 shadow-lg",
      },
      hover: {
        none: "",
        lift: "hover:translate-y-[-2px] hover:shadow-lg",
        scale: "hover:scale-[1.02]",
        glow: "hover:shadow-[var(--shadow-success)]",
      },
      size: {
        sm: "p-4",
        default: "p-6",
        lg: "p-8",
      },
    },
    defaultVariants: {
      variant: "default",
      hover: "none",
      size: "default",
    },
  }
)

export interface FluCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof fluCardVariants> {}

const FluCard = React.forwardRef<HTMLDivElement, FluCardProps>(
  ({ className, variant, hover, size, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(fluCardVariants({ variant, hover, size, className }))}
      {...props}
    />
  )
)
FluCard.displayName = "FluCard"

const FluCardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 pb-4", className)}
    {...props}
  />
))
FluCardHeader.displayName = "FluCardHeader"

const FluCardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-xl font-bold leading-none tracking-tight bg-gradient-to-r from-flu-grena to-flu-verde bg-clip-text text-transparent",
      className
    )}
    {...props}
  />
))
FluCardTitle.displayName = "FluCardTitle"

const FluCardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
FluCardDescription.displayName = "FluCardDescription"

const FluCardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("", className)} {...props} />
))
FluCardContent.displayName = "FluCardContent"

const FluCardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center pt-4", className)}
    {...props}
  />
))
FluCardFooter.displayName = "FluCardFooter"

export { 
  FluCard, 
  FluCardHeader, 
  FluCardFooter, 
  FluCardTitle, 
  FluCardDescription, 
  FluCardContent,
  // eslint-disable-next-line react-refresh/only-export-components
  fluCardVariants 
}