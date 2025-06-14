
import { useEffect } from "react";
import { RootLayout } from "@/components/RootLayout";
import { GameAuthSelection } from "@/components/auth/GameAuthSelection";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

const GameModeSelection = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  // Se o usuário está logado, redireciona diretamente para o jogo
  useEffect(() => {
    if (!loading && user) {
      navigate("/game");
    }
  }, [user, loading, navigate]);

  const handleGuestPlay = () => {
    navigate("/game");
  };

  const handleAuthenticatedPlay = () => {
    navigate("/game");
  };

  // Mostra loading enquanto verifica autenticação
  if (loading) {
    return (
      <RootLayout>
        <div className="min-h-screen bg-gradient-to-b from-flu-verde/50 to-white flex items-center justify-center">
          <div className="text-flu-grena">Carregando...</div>
        </div>
      </RootLayout>
    );
  }

  // Se usuário está logado, não mostra a seleção (será redirecionado)
  if (user) {
    return null;
  }

  return (
    <RootLayout>
      <div className="min-h-screen bg-gradient-to-b from-flu-verde/50 to-white">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-flu-grena mb-4">
              Como deseja jogar?
            </h1>
            <p className="text-gray-600 max-w-md mx-auto">
              Escolha entre fazer login para acompanhar seu progresso ou jogar como convidado
            </p>
          </div>
          
          <div className="flex justify-center">
            <GameAuthSelection
              onGuestPlay={handleGuestPlay}
              onAuthenticatedPlay={handleAuthenticatedPlay}
            />
          </div>
        </div>
      </div>
    </RootLayout>
  );
};

export default GameModeSelection;
