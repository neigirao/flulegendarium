import { ReactNode, forwardRef } from "react";
import { cn } from "@/lib/utils";

interface TouchOptimizedButtonProps {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  type?: 'button' | 'submit' | 'reset';
}

export const TouchOptimizedButton = forwardRef<HTMLButtonElement, TouchOptimizedButtonProps>(
  ({ children, onClick, disabled, variant = 'primary', size = 'md', className, type = 'button' }, ref) => {
    
    const variants = {
      primary: "bg-gradient-to-r from-flu-grena to-flu-grena/90 text-white hover:from-flu-grena/90 hover:to-flu-grena/80 shadow-lg hover:shadow-xl",
      secondary: "bg-gradient-to-r from-flu-verde to-flu-verde/90 text-white hover:from-flu-verde/90 hover:to-flu-verde/80 shadow-lg hover:shadow-xl",
      outline: "bg-white border-2 border-flu-grena text-flu-grena hover:bg-flu-grena hover:text-white",
      ghost: "bg-transparent text-flu-grena hover:bg-flu-grena/10"
    };

    const sizes = {
      sm: "min-h-[40px] min-w-[40px] px-3 py-2 text-sm",
      md: "min-h-[44px] min-w-[44px] px-4 py-3 text-base", // Tamanho mínimo recomendado para touch
      lg: "min-h-[56px] min-w-[56px] px-6 py-4 text-lg"
    };

    return (
      <button
        ref={ref}
        type={type}
        onClick={onClick}
        disabled={disabled}
        className={cn(
          // Base styles
          "relative rounded-xl font-semibold transition-all duration-200",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-flu-grena focus-visible:ring-offset-2",
          "active:scale-95 transform-gpu",
          "touch-manipulation", // Otimização para touch
          "-webkit-tap-highlight-color: transparent", // Remove highlight padrão do iOS
          
          // Variant styles
          variants[variant],
          
          // Size styles
          sizes[size],
          
          // Disabled styles
          disabled && "opacity-50 cursor-not-allowed hover:scale-100 active:scale-100",
          
          className
        )}
      >
        {/* Content */}
        <span className="relative z-10 flex items-center justify-center gap-2">
          {children}
        </span>
        
        {/* Ripple effect overlay */}
        <div className="absolute inset-0 rounded-xl overflow-hidden">
          <div className="absolute inset-0 bg-white/20 opacity-0 group-active:opacity-100 transition-opacity duration-150"></div>
        </div>
      </button>
    );
  }
);

TouchOptimizedButton.displayName = "TouchOptimizedButton";

// Input otimizado para touch
interface TouchOptimizedInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  type?: 'text' | 'email' | 'password' | 'number';
  className?: string;
  autoComplete?: string;
}

export const TouchOptimizedInput = ({
  value,
  onChange,
  placeholder,
  disabled,
  type = 'text',
  className,
  autoComplete = 'off'
}: TouchOptimizedInputProps) => {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      autoComplete={autoComplete}
      className={cn(
        // Base styles
        "w-full rounded-xl border-2 border-border bg-background",
        "px-4 py-4 text-base font-medium", // text-base previne zoom no iOS
        "placeholder:text-muted-foreground",
        "transition-all duration-200",
        
        // Focus styles
        "focus:border-flu-verde focus:ring-2 focus:ring-flu-verde/20 focus:outline-none",
        
        // Touch optimizations
        "min-h-[44px]", // Altura mínima para touch
        "touch-manipulation",
        
        // Disabled styles
        disabled && "opacity-50 cursor-not-allowed bg-muted",
        
        className
      )}
    />
  );
};

// Card otimizado para touch
interface TouchOptimizedCardProps {
  children: ReactNode;
  onClick?: () => void;
  hoverable?: boolean;
  className?: string;
}

export const TouchOptimizedCard = ({
  children,
  onClick,
  hoverable = false,
  className
}: TouchOptimizedCardProps) => {
  return (
    <div
      onClick={onClick}
      className={cn(
        "relative rounded-xl bg-card border border-border shadow-md",
        "transition-all duration-200",
        "touch-manipulation",
        
        // Interactive styles
        onClick && "cursor-pointer active:scale-95 transform-gpu",
        hoverable && "hover:shadow-lg hover:border-border/80",
        
        // Touch feedback
        onClick && "active:bg-muted",
        
        className
      )}
    >
      {children}
      
      {/* Touch feedback overlay */}
      {onClick && (
        <div className="absolute inset-0 rounded-xl overflow-hidden">
          <div className="absolute inset-0 bg-flu-grena/5 opacity-0 active:opacity-100 transition-opacity duration-150"></div>
        </div>
      )}
    </div>
  );
};