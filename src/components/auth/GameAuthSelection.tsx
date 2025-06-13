
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { User, UserPlus } from "lucide-react";

interface GameAuthSelectionProps {
  onGuestPlay: () => void;
  onAuthenticatedPlay: () => void;
}

export const GameAuthSelection = ({ onGuestPlay, onAuthenticatedPlay }: GameAuthSelectionProps) => {
  const { user, signInWithGoogle, loading } = useAuth();

  if (user) {
    return (
      <Card className="max-w-md mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-flu-grena">Bem-vindo de volta!</CardTitle>
          <p className="text-gray-600">
            Olá, {user.user_metadata?.full_name || user.email}
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={onAuthenticatedPlay}
            className="w-full bg-flu-grena hover:bg-flu-grena/90 text-white"
          >
            <User className="mr-2" size={20} />
            Começar Jogo
          </Button>
          <Button
            onClick={onGuestPlay}
            variant="outline"
            className="w-full"
          >
            <UserPlus className="mr-2" size={20} />
            Jogar como Convidado
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-flu-grena">Como deseja jogar?</CardTitle>
        <p className="text-gray-600">
          Escolha entre fazer login para acompanhar seu progresso ou jogar como convidado
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button
          onClick={signInWithGoogle}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
        >
          <User className="mr-2" size={20} />
          {loading ? "Carregando..." : "Entrar com Google"}
        </Button>
        <Button
          onClick={onGuestPlay}
          variant="outline"
          className="w-full"
        >
          <UserPlus className="mr-2" size={20} />
          Jogar como Convidado
        </Button>
      </CardContent>
    </Card>
  );
};
