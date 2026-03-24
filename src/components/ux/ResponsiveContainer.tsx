import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ResponsiveContainerProps {
  children: ReactNode;
  variant?: 'default' | 'game' | 'modal' | 'card';
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  center?: boolean;
}

export const ResponsiveContainer = ({
  children,
  variant = 'default',
  className,
  maxWidth = 'lg',
  padding = 'md',
  center = true
}: ResponsiveContainerProps) => {
  
  const variants = {
    default: "bg-transparent",
    game: "bg-transparent",
    modal: "bg-card border border-border rounded-xl shadow-xl",
    card: "bg-card/90 backdrop-blur-sm border border-border rounded-xl shadow-md hover:shadow-lg transition-shadow"
  };

  const maxWidths = {
    sm: "max-w-sm",
    md: "max-w-md", 
    lg: "max-w-lg",
    xl: "max-w-xl",
    '2xl': "max-w-2xl",
    full: "max-w-full"
  };

  const paddings = {
    none: "",
    sm: "p-3 sm:p-4",
    md: "p-4 sm:p-6",
    lg: "p-6 sm:p-8"
  };

  return (
    <div className={cn(
      "w-full",
      maxWidths[maxWidth],
      center && "mx-auto",
      variants[variant],
      paddings[padding],
      "transition-all duration-200",
      className
    )}>
      {children}
    </div>
  );
};

// Container específico para jogos
export const GameContainer = ({ children, className }: { children: ReactNode; className?: string }) => {
  return (
    <ResponsiveContainer
      variant="game"
      maxWidth="md"
      padding="lg"
      className={cn("min-h-[400px]", className)}
    >
      {children}
    </ResponsiveContainer>
  );
};

// Container responsivo para header/navegação
export const HeaderContainer = ({ children, className }: { children: ReactNode; className?: string }) => {
  return (
    <div className={cn(
      "w-full bg-card/95 backdrop-blur-md border-b border-border sticky top-0 z-40",
      "safe-area-top", // Para dispositivos com notch
      className
    )}>
      <ResponsiveContainer
        variant="default"
        maxWidth="2xl"
        padding="sm"
      >
        {children}
      </ResponsiveContainer>
    </div>
  );
};

// Container para formulários
export const FormContainer = ({ children, className }: { children: ReactNode; className?: string }) => {
  return (
    <ResponsiveContainer
      variant="card"
      maxWidth="md"
      padding="lg"
      className={cn("space-y-6", className)}
    >
      {children}
    </ResponsiveContainer>
  );
};