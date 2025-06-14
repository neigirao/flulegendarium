
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { LogIn, LogOut, User } from "lucide-react";

export const AuthButton = () => {
  const { user, signInWithGoogle, signOut, loading } = useAuth();

  if (loading) {
    return (
      <Button variant="outline" disabled>
        Carregando...
      </Button>
    );
  }

  if (user) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2">
          <User size={20} />
          <span className="text-sm">{user.user_metadata?.full_name || user.email}</span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={signOut}
          className="flex items-center gap-2"
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
      className="bg-flu-grena hover:bg-flu-grena/90 text-white flex items-center gap-2"
    >
      <LogIn size={16} />
      Entrar com Google
    </Button>
  );
};
