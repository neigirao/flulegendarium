
import { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { RootLayout } from "@/components/RootLayout";
import { GameAuthSelection } from "@/components/auth/GameAuthSelection";
import { useAuth } from "@/hooks/useAuth";

const GameModeSelection = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  // Redireciona usuários logados diretamente para o jogo, mas apenas uma vez
  useEffect(() => {
    // Adiciona um pequeno delay para evitar loops de redirecionamento
    if (!loading && user) {
      const timer = setTimeout(() => {
        navigate("/game", { replace: true });
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [user, loading, navigate]);

  const handleGuestPlay = () => {
    navigate("/game", { replace: true });
  };

  const handleAuthenticatedPlay = () => {
    navigate("/game", { replace: true });
  };

  // Mostra loading enquanto verifica autenticação
  if (loading) {
    return (
      <RootLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4 p-6 bg-white/80 backdrop-blur-sm rounded-xl shadow-lg">
            <div className="w-8 h-8 border-4 border-flu-grena border-t-transparent rounded-full animate-spin"></div>
            <p className="text-flu-grena font-semibold">Carregando...</p>
          </div>
        </div>
      </RootLayout>
    );
  }

  // Se usuário está logado, mostra uma tela de transição ao invés de null
  if (user) {
    return (
      <RootLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4 p-6 bg-white/80 backdrop-blur-sm rounded-xl shadow-lg">
            <div className="w-8 h-8 border-4 border-flu-grena border-t-transparent rounded-full animate-spin"></div>
            <p className="text-flu-grena font-semibold">Redirecionando para o jogo...</p>
          </div>
        </div>
      </RootLayout>
    );
  }

  return (
    <RootLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm py-4 sticky top-0 z-50">
          <div className="container mx-auto px-4 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3">
              <img 
                src="/lovable-uploads/0aa3609f-0584-4bf4-8303-e03f50f7e131.png" 
                alt="Fluminense FC" 
                className="w-8 h-8 object-contain"
              />
              <span className="text-2xl font-bold text-flu-grena">Lendas do Flu</span>
            </Link>
            <nav className="flex items-center space-x-6">
              <Button
                variant="ghost"
                size="sm"
                asChild
                className="text-flu-verde hover:text-flu-grena hover:bg-flu-grena/10 transition-colors"
              >
                <Link to="/" className="flex items-center gap-2">
                  <ArrowLeft size={16} />
                  Voltar
                </Link>
              </Button>
            </nav>
          </div>
        </header>

        <div className="container mx-auto px-4 py-20">
          <div className="text-center mb-16">
            <div className="flex items-center justify-center gap-4 mb-6">
              <img 
                src="/lovable-uploads/0aa3609f-0584-4bf4-8303-e03f50f7e131.png" 
                alt="Fluminense FC" 
                className="w-16 h-16 object-contain drop-shadow-lg"
              />
              <h1 className="text-4xl font-black text-flu-grena">
                COMO DESEJA JOGAR?
              </h1>
            </div>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
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
