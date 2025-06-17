
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { LogIn, LogOut, User } from "lucide-react";
import { LoadingSpinner } from "@/components/ui/loading-states";

export const AuthButton = () => {
  const { user, signInWithGoogle, signOut, loading } = useAuth();

  if (loading) {
    return (
      <Button variant="outline" disabled className="border-flu-grena/20 min-w-[120px]">
        <LoadingSpinner size="sm" className="mr-2" />
        <span className="hidden sm:inline">Carregando...</span>
      </Button>
    );
  }

  if (user) {
    return (
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="hidden sm:flex items-center gap-2 px-3 py-2 bg-flu-verde/10 rounded-lg border border-flu-verde/20">
          <div className="w-6 h-6 sm:w-8 sm:h-8 bg-flu-grena rounded-full flex items-center justify-center flex-shrink-0">
            <User size={12} className="text-white sm:w-4 sm:h-4" />
          </div>
          <span className="text-xs sm:text-sm font-medium text-flu-grena truncate max-w-[100px] sm:max-w-[150px]">
            {user.user_metadata?.full_name || user.email}
          </span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={signOut}
          className="flex items-center gap-1 sm:gap-2 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 min-w-[60px] sm:min-w-[80px]"
        >
          <LogOut size={14} className="sm:w-4 sm:h-4" />
          <span className="hidden sm:inline">Sair</span>
        </Button>
      </div>
    );
  }

  return (
    <Button
      onClick={signInWithGoogle}
      className="bg-flu-grena hover:bg-flu-grena/90 text-white flex items-center gap-1 sm:gap-2 font-semibold shadow-lg hover:shadow-xl transition-all duration-200 text-xs sm:text-sm px-3 sm:px-4"
    >
      <LogIn size={14} className="sm:w-4 sm:h-4" />
      <span>Entrar</span>
    </Button>
  );
};
