
import { Loader2, User, Trophy, Settings, Database } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export const LoadingSpinner = ({ size = "md", className }: LoadingSpinnerProps) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6", 
    lg: "w-8 h-8"
  };

  return (
    <Loader2 
      className={cn("animate-spin text-flu-grena", sizeClasses[size], className)} 
    />
  );
};

interface LoadingCardProps {
  title?: string;
  description?: string;
  icon?: "user" | "trophy" | "settings" | "database" | "general";
  size?: "sm" | "md" | "lg";
  className?: string;
}

export const LoadingCard = ({ 
  title = "Carregando...", 
  description,
  icon = "general",
  size = "md",
  className 
}: LoadingCardProps) => {
  const icons = {
    user: User,
    trophy: Trophy, 
    settings: Settings,
    database: Database,
    general: Loader2
  };

  const IconComponent = icons[icon];
  
  const sizeClasses = {
    sm: {
      container: "p-4",
      icon: "w-5 h-5",
      title: "text-sm",
      description: "text-xs"
    },
    md: {
      container: "p-6",
      icon: "w-6 h-6",
      title: "text-base",
      description: "text-sm"
    },
    lg: {
      container: "p-8",
      icon: "w-8 h-8", 
      title: "text-lg",
      description: "text-base"
    }
  };

  const styles = sizeClasses[size];

  return (
    <div className={cn(
      "bg-card backdrop-blur-sm rounded-lg shadow-md border border-border flex flex-col items-center text-center",
      styles.container,
      className
    )}>
      <div className="flex items-center justify-center w-12 h-12 bg-flu-verde/10 rounded-full mb-4">
        <IconComponent className={cn("text-flu-grena animate-pulse", styles.icon)} />
      </div>
      
      <h3 className={cn("font-semibold text-foreground mb-2", styles.title)}>
        {title}
      </h3>
      
      {description && (
        <p className={cn("text-muted-foreground", styles.description)}>
          {description}
        </p>
      )}
      
      <div className="mt-4 w-16 h-1 bg-muted rounded-full overflow-hidden">
        <div className="h-full bg-flu-grena rounded-full animate-pulse" style={{
          animation: "loading-bar 2s ease-in-out infinite"
        }} />
      </div>
    </div>
  );
};

interface LoadingSkeletonProps {
  variant?: "text" | "card" | "avatar" | "button";
  lines?: number;
  className?: string;
}

export const LoadingSkeleton = ({ 
  variant = "text", 
  lines = 1, 
  className 
}: LoadingSkeletonProps) => {
  switch (variant) {
    case "text":
      return (
        <div className={cn("space-y-2", className)}>
          {Array.from({ length: lines }).map((_, i) => (
            <div
              key={i}
              className="h-4 bg-muted rounded animate-pulse"
              style={{
                width: i === lines - 1 ? "75%" : "100%"
              }}
            />  
          ))}
        </div>
      );
      
    case "card":
      return (
        <div className={cn("p-4 border rounded-lg bg-card", className)}>
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-muted rounded-full animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-muted rounded animate-pulse" />
              <div className="h-3 bg-muted rounded animate-pulse w-3/4" />
            </div>
          </div>
        </div>
      );
      
    case "avatar":
      return (
        <div className={cn("w-10 h-10 bg-muted rounded-full animate-pulse", className)} />
      );
      
    case "button":
      return (
        <div className={cn("h-10 bg-muted rounded animate-pulse", className)} />
      );
      
    default:
      return (
        <div className={cn("h-4 bg-muted rounded animate-pulse", className)} />
      );
  }
};

interface PageLoadingProps {
  title?: string;
  description?: string;
}

export const PageLoading = ({ 
  title = "Carregando página...",
  description = "Aguarde um momento"
}: PageLoadingProps) => (
  <div className="min-h-screen bg-gradient-to-b from-flu-verde/20 to-white flex items-center justify-center p-4">
    <LoadingCard
      title={title}
      description={description}
      icon="general"
      size="lg"
    />
  </div>
);

export const InlineLoading = ({ text = "Carregando..." }: { text?: string }) => (
  <div className="flex items-center justify-center gap-2 py-4">
    <LoadingSpinner size="sm" />
    <span className="text-sm text-muted-foreground">{text}</span>
  </div>
);

// CSS personalizado para animação da barra
const loadingStyles = `
@keyframes loading-bar {
  0% { width: 0%; opacity: 1; }
  50% { width: 70%; opacity: 0.8; }
  100% { width: 100%; opacity: 0.4; }
}
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = loadingStyles;
  document.head.appendChild(styleSheet);
}
