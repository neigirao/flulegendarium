
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { UserCheck, UserX, LogIn, Play } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { debugLogger } from "@/utils/debugLogger";

const GameModeSelection = () => {
  const navigate = useNavigate();
  const { user, signInWithGoogle } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  debugLogger.info('GameModeSelection', 'Componente renderizado', { hasUser: !!user });

  const handleGuestMode = () => {
    debugLogger.info('GameModeSelection', 'Modo convidado selecionado');
    navigate("/guess-player");
  };

  const handleAuthenticatedMode = async () => {
    if (user) {
      debugLogger.info('GameModeSelection', 'Usuário já logado, indo para o jogo');
      navigate("/guess-player");
    } else {
      debugLogger.info('GameModeSelection', 'Fazendo login para modo autenticado');
      setIsLoading(true);
      try {
        await signInWithGoogle();
      } catch (error) {
        debugLogger.error('GameModeSelection', 'Erro no login', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-flu-verde/50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm py-4">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img 
              src="/lovable-uploads/0aa3609f-0584-4bf4-8303-e03f50f7e131.png" 
              alt="Fluminense FC" 
              className="w-8 h-8 object-contain"
            />
            <span className="text-2xl font-bold text-flu-grena">Lendas do Flu</span>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Title Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-flu-grena mb-4">
              Escolha seu Modo de Jogo
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Você pode jogar como convidado ou fazer login para salvar seu progresso e competir no ranking
            </p>
          </div>

          {/* Game Mode Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Guest Mode */}
            <Card className="hover:shadow-xl transition-all duration-300 hover:scale-105 border-2 border-gray-200 hover:border-flu-verde/50">
              <CardHeader className="text-center pb-6">
                <div className="mx-auto w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <UserX className="w-10 h-10 text-gray-600" />
                </div>
                <CardTitle className="text-2xl text-gray-800">Modo Convidado</CardTitle>
                <CardDescription className="text-lg text-gray-600">
                  Jogue rapidamente sem precisar fazer login
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-green-600">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Início rápido</span>
                  </div>
                  <div className="flex items-center gap-2 text-green-600">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Sem necessidade de cadastro</span>
                  </div>
                  <div className="flex items-center gap-2 text-red-600">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span>Progresso não é salvo</span>
                  </div>
                  <div className="flex items-center gap-2 text-red-600">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span>Sem acesso ao ranking</span>
                  </div>
                </div>
                <Button
                  onClick={handleGuestMode}
                  className="w-full bg-gray-600 hover:bg-gray-700 text-white py-3 text-lg font-semibold"
                  size="lg"
                >
                  <Play className="mr-2" size={20} />
                  Jogar como Convidado
                </Button>
              </CardContent>
            </Card>

            {/* Authenticated Mode */}
            <Card className="hover:shadow-xl transition-all duration-300 hover:scale-105 border-2 border-flu-grena/30 hover:border-flu-grena/70">
              <CardHeader className="text-center pb-6">
                <div className="mx-auto w-20 h-20 bg-flu-grena/10 rounded-full flex items-center justify-center mb-4">
                  <UserCheck className="w-10 h-10 text-flu-grena" />
                </div>
                <CardTitle className="text-2xl text-flu-grena">Modo Logado</CardTitle>
                <CardDescription className="text-lg text-gray-600">
                  {user ? "Você já está logado! Continue seu progresso" : "Faça login para salvar seu progresso"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-green-600">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Progresso salvo</span>
                  </div>
                  <div className="flex items-center gap-2 text-green-600">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Acesso ao ranking global</span>
                  </div>
                  <div className="flex items-center gap-2 text-green-600">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Histórico de partidas</span>
                  </div>
                  <div className="flex items-center gap-2 text-green-600">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Conquistas e badges</span>
                  </div>
                </div>
                <Button
                  onClick={handleAuthenticatedMode}
                  disabled={isLoading}
                  className="w-full bg-flu-grena hover:bg-flu-grena/90 text-white py-3 text-lg font-semibold flu-shadow"
                  size="lg"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 animate-spin border-2 border-white border-t-transparent rounded-full"></div>
                      Carregando...
                    </div>
                  ) : user ? (
                    <>
                      <Play className="mr-2" size={20} />
                      Continuar Jogando
                    </>
                  ) : (
                    <>
                      <LogIn className="mr-2" size={20} />
                      Fazer Login e Jogar
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Back Button */}
          <div className="text-center mt-12">
            <Button
              variant="outline"
              onClick={() => navigate("/")}
              className="border-flu-grena text-flu-grena hover:bg-flu-grena hover:text-white"
            >
              Voltar ao Início
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default GameModeSelection;
