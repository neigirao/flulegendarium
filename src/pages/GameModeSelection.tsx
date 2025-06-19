
import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { RootLayout } from "@/components/RootLayout";
import { GameAuthSelection } from "@/components/auth/GameAuthSelection";
import { GameModeSelector } from "@/components/auth/GameModeSelector";
import { useAuth } from "@/hooks/useAuth";

const GameModeSelection = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [selectedMode, setSelectedMode] = useState<'classic' | 'adaptive' | null>(null);

  // Redireciona usuários logados para seleção de modo se não tiver modo selecionado
  useEffect(() => {
    if (!loading && user && !selectedMode) {
      // Usuário logado mas sem modo selecionado, mostra seletor de modo
      return;
    }
  }, [user, loading, selectedMode]);

  const handleModeSelect = (mode: 'classic' | 'adaptive') => {
    setSelectedMode(mode);
  };

  const handleGuestPlay = () => {
    if (selectedMode === 'adaptive') {
      navigate("/quiz-adaptativo", { replace: true });
    } else {
      navigate("/quiz", { replace: true });
    }
  };

  const handleAuthenticatedPlay = () => {
    if (selectedMode === 'adaptive') {
      navigate("/quiz-adaptativo", { replace: true });
    } else {
      navigate("/quiz", { replace: true });
    }
  };

  const handleBackToModeSelection = () => {
    setSelectedMode(null);
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
                onClick={selectedMode ? handleBackToModeSelection : () => navigate('/')}
                className="text-flu-verde hover:text-flu-grena hover:bg-flu-grena/10 transition-colors"
              >
                <ArrowLeft size={16} className="mr-2" />
                {selectedMode ? 'Voltar aos Modos' : 'Voltar'}
              </Button>
            </nav>
          </div>
        </header>

        <div className="container mx-auto px-4 py-20">
          {!selectedMode ? (
            <GameModeSelector onModeSelect={handleModeSelect} />
          ) : (
            <div>
              <div className="text-center mb-16">
                <div className="flex items-center justify-center gap-4 mb-6">
                  <img 
                    src="/lovable-uploads/0aa3609f-0584-4bf4-8303-e03f50f7e131.png" 
                    alt="Fluminense FC" 
                    className="w-16 h-16 object-contain drop-shadow-lg"
                  />
                  <div>
                    <h1 className="text-4xl font-black text-flu-grena">
                      MODO {selectedMode === 'adaptive' ? 'ADAPTATIVO' : 'CLÁSSICO'}
                    </h1>
                    <p className="text-lg text-gray-600 mt-2">
                      {selectedMode === 'adaptive' 
                        ? 'Dificuldade que se adapta ao seu nível'
                        : 'Desafio tradicional com dificuldade fixa'
                      }
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-center">
                <GameAuthSelection
                  onGuestPlay={handleGuestPlay}
                  onAuthenticatedPlay={handleAuthenticatedPlay}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </RootLayout>
  );
};

export default GameModeSelection;
