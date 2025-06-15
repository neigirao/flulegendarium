
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { LogIn, LogOut, User } from "lucide-react";
import { LoadingSpinner } from "@/components/ui/loading-states";

export const AuthButton = () => {
  const { user, signInWithGoogle, signOut, loading } = useAuth();

  if (loading) {
    return (
      <Button variant="outline" disabled className="border-flu-grena/20">
        <LoadingSpinner size="sm" className="mr-2" />
        Carregando...
      </Button>
    );
  }

  if (user) {
    return (
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-2 bg-flu-verde/10 rounded-lg border border-flu-verde/20">
          <div className="w-8 h-8 bg-flu-grena rounded-full flex items-center justify-center">
            <User size={16} className="text-white" />
          </div>
          <span className="text-sm font-medium text-flu-grena">
            {user.user_metadata?.full_name || user.email}
          </span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={signOut}
          className="flex items-center gap-2 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
        >
          <LogOut size={16} />
          Sair
        </Button>
      </div>
    );
  }

  return (
    <Button
      onClick={signInWithGoogle}
      className="bg-flu-grena hover:bg-flu-grena/90 text-white flex items-center gap-2 font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
    >
      <LogIn size={16} />
      Entrar com Google
    </Button>
  );
};
