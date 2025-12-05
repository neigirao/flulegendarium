
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { LogOut, User } from "lucide-react";
import { LoadingSpinner } from "@/components/ui/loading-states";

export const AuthButton = () => {
  const { user, signOut, loading } = useAuth();

  if (loading) {
    return (
      <Button variant="outline" disabled className="border-primary/20 min-w-[120px]">
        <LoadingSpinner size="sm" className="mr-2" />
        <span className="hidden sm:inline">Carregando...</span>
      </Button>
    );
  }

  if (user) {
    return (
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="hidden sm:flex items-center gap-2 px-3 py-2 bg-secondary/10 rounded-lg border border-secondary/20">
          <div className="w-6 h-6 sm:w-8 sm:h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
            <User size={12} className="text-primary-foreground sm:w-4 sm:h-4" />
          </div>
          <span className="text-xs sm:text-sm font-medium text-primary truncate max-w-[100px] sm:max-w-[150px]">
            {user.user_metadata?.full_name || user.email}
          </span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={signOut}
          className="flex items-center gap-1 sm:gap-2 border-error/30 text-error hover:bg-error-light hover:text-error min-w-[60px] sm:min-w-[80px]"
        >
          <LogOut size={14} className="sm:w-4 sm:h-4" />
          <span className="hidden sm:inline">Sair</span>
        </Button>
      </div>
    );
  }

  return null;
};
