
import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Play, Trophy, Users, Info, Zap, Target, Clock, Star } from "lucide-react";
import { AuthButton } from "@/components/auth/AuthButton";
import { useAuth } from "@/hooks/useAuth";

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleStartGame = () => {
    // Sempre redirecionar para seleção de modo, mesmo usuários logados
    navigate("/game-mode-selection");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-flu-verde/50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm py-4 sticky top-0 z-50">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img 
              src="/lovable-uploads/0aa3609f-0584-4bf4-8303-e03f50f7e131.png" 
              alt="Fluminense FC" 
              className="w-8 h-8 object-contain"
            />
            <span className="text-2xl font-bold text-flu-grena">Lendas do Flu</span>
          </div>
          <nav className="flex items-center space-x-6">
            <AuthButton />
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <section className="text-center mb-16">
          <div className="flex items-center justify-center gap-4 mb-8">
            <img 
              src="/lovable-uploads/0aa3609f-0584-4bf4-8303-e03f50f7e131.png" 
              alt="Fluminense FC" 
              className="w-20 h-20 object-contain drop-shadow-lg animate-bounce-gentle"
            />
            <div>
              <h1 className="text-5xl font-black text-flu-grena mb-2">
                LENDAS DO FLU
              </h1>
              <div className="flex items-center justify-center gap-2">
                <Badge className="bg-flu-verde text-white px-3 py-1 text-sm font-semibold">
                  Quiz dos Ídolos
                </Badge>
                <Badge className="bg-flu-grena text-white px-3 py-1 text-sm font-semibold">
                  Tricolores
                </Badge>
              </div>
            </div>
          </div>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-8">
            Teste seus conhecimentos sobre os ídolos tricolores! Identifique os jogadores pelas fotos 
            e prove que é um verdadeiro conhecedor da história do <strong className="text-flu-grena">Fluminense</strong>.
          </p>

          <Button
            onClick={handleStartGame}
            size="lg"
            className="bg-flu-grena hover:bg-flu-grena/90 text-white font-bold py-4 px-8 text-xl rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105 flu-shadow animate-glow"
          >
            <Play className="mr-3" size={28} />
            COMEÇAR A JOGAR
          </Button>
        </section>

        {/* Game Features */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <Card className="text-center hover:shadow-xl transition-all duration-300 hover:scale-105 border-2 border-flu-grena/20">
            <CardHeader>
              <div className="mx-auto w-16 h-16 bg-flu-grena/10 rounded-full flex items-center justify-center mb-4">
                <Target className="w-8 h-8 text-flu-grena" />
              </div>
              <CardTitle className="text-flu-grena">Desafio Visual</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-gray-600">
                Identifique jogadores históricos do Fluminense através de suas fotos
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-xl transition-all duration-300 hover:scale-105 border-2 border-flu-verde/20">
            <CardHeader>
              <div className="mx-auto w-16 h-16 bg-flu-verde/10 rounded-full flex items-center justify-center mb-4">
                <Clock className="w-8 h-8 text-flu-verde" />
              </div>
              <CardTitle className="text-flu-verde">Contra o Tempo</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-gray-600">
                60 segundos para cada jogador, 1 tentativa por foto
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-xl transition-all duration-300 hover:scale-105 border-2 border-orange-300">
            <CardHeader>
              <div className="mx-auto w-16 h-16 bg-orange-500/10 rounded-full flex items-center justify-center mb-4">
                <Star className="w-8 h-8 text-orange-600" />
              </div>
              <CardTitle className="text-orange-600">Sistema de Pontos</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-gray-600">
                5 pontos por acerto, construa sua sequência e bata recordes
              </CardDescription>
            </CardContent>
          </Card>
        </section>

        {/* How to Play */}
        <section className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 mb-12">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Info className="w-8 h-8 text-flu-grena" />
              <h2 className="text-3xl font-bold text-flu-grena">Como Jogar</h2>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="bg-flu-grena text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-xl">
                1
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Escolha o Modo</h3>
              <p className="text-gray-600 text-sm">Jogue como convidado ou faça login para salvar progresso</p>
            </div>
            
            <div className="text-center">
              <div className="bg-flu-verde text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-xl">
                2
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Veja a Foto</h3>
              <p className="text-gray-600 text-sm">Uma foto de um ídolo do Fluminense aparecerá na tela</p>
            </div>
            
            <div className="text-center">
              <div className="bg-orange-500 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-xl">
                3
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Digite o Nome</h3>
              <p className="text-gray-600 text-sm">Você tem 60 segundos e 1 tentativa por jogador</p>
            </div>
            
            <div className="text-center">
              <div className="bg-purple-500 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-xl">
                4
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Ganhe Pontos</h3>
              <p className="text-gray-600 text-sm">5 pontos por acerto, construa sequências longas!</p>
            </div>
          </div>
        </section>

        {/* Game Stats Preview */}
        <section className="text-center">
          <div className="bg-gradient-to-r from-flu-grena/10 via-white to-flu-verde/10 rounded-3xl p-8 border border-gray-200">
            <div className="flex items-center justify-center gap-3 mb-6">
              <Trophy className="w-8 h-8 text-flu-grena" />
              <h2 className="text-3xl font-bold text-flu-grena">Pronto para o Desafio?</h2>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-flu-grena mb-2">100+</div>
                <div className="text-gray-600">Jogadores Históricos</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-flu-verde mb-2">1000+</div>
                <div className="text-gray-600">Partidas Jogadas</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600 mb-2">5★</div>
                <div className="text-gray-600">Dificuldade Máxima</div>
              </div>
            </div>

            <Button
              onClick={handleStartGame}
              size="lg"
              className="bg-gradient-to-r from-flu-grena to-flu-verde text-white font-bold py-4 px-8 text-xl rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105"
            >
              <Zap className="mr-3" size={24} />
              COMEÇAR AGORA
            </Button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-flu-grena text-white py-8 mt-16">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <img 
              src="/lovable-uploads/0aa3609f-0584-4bf4-8303-e03f50f7e131.png" 
              alt="Fluminense FC" 
              className="w-8 h-8 object-contain"
            />
            <span className="text-xl font-bold">Lendas do Flu</span>
          </div>
          <p className="text-flu-branco/80">
            Quiz não oficial dos ídolos tricolores • Desenvolvido por fãs para fãs
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
