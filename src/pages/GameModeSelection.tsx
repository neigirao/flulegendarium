import React from "react";
import { RootLayout } from "@/components/RootLayout";
import { SEOHead } from "@/components/SEOHead";
import { GameModeCard } from "@/components/GameModeCard";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const GameModeSelection = () => {
  const navigate = useNavigate();

  return (
    <>
      <SEOHead 
        title="Escolha seu Modo de Jogo - Lendas do Flu"
        description="🎮 Escolha entre diferentes modos de jogo: Quiz Adaptativo ou Quiz por Década. Teste seus conhecimentos sobre o Fluminense!"
        keywords="modos de jogo fluminense, quiz adaptativo, quiz por década, tricolor"
        url="https://flulegendarium.lovable.app/selecionar-modo-jogo"
      />
      <RootLayout>
        <div className="min-h-screen bg-gradient-to-br from-flu-verde via-flu-grena/80 to-flu-verde/90 relative overflow-hidden">
          {/* Diagonal Stripe Pattern */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute inset-0 bg-gradient-to-br from-flu-verde/30 via-transparent to-flu-grena/30 transform -skew-y-12"></div>
            <div className="absolute inset-0 bg-gradient-to-tl from-flu-grena/20 via-transparent to-flu-verde/20 transform skew-y-12"></div>
          </div>
          
          <div className="relative z-10 container mx-auto px-4 pt-8 pb-8">
            {/* Back Button */}
            <div className="mb-8">
              <Button
                variant="outline"
                onClick={() => navigate('/')}
                className="flex items-center gap-2 bg-black/20 border-white/30 text-white hover:bg-black/30"
              >
                <ArrowLeft className="w-4 h-4" />
                Voltar ao Início
              </Button>
            </div>

            {/* Shield Logo */}
            <div className="text-center mb-8">
              <div className="w-24 h-24 mx-auto bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-flu-grena to-flu-verde rounded-full flex items-center justify-center">
                  <span className="text-3xl text-white font-bold">?</span>
                </div>
              </div>
              
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 tracking-wide">
                ESCOLHA SEU MODO DE JOGO
              </h1>
            </div>

            {/* Game Modes Grid */}
            <div className="max-w-4xl mx-auto mb-12">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Quiz Adaptativo */}
                <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-8 shadow-xl relative">
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 mx-auto bg-flu-grena rounded-full flex items-center justify-center mb-4">
                      <div className="w-8 h-8 border-4 border-white rounded-full relative">
                        <div className="absolute top-1 right-1 w-2 h-2 bg-white rounded-full"></div>
                      </div>
                    </div>
                    <h2 className="text-2xl font-bold text-flu-grena mb-2">Quiz Adaptativo</h2>
                    <span className="inline-block bg-flu-grena/10 text-flu-grena px-3 py-1 rounded-full text-sm font-medium">
                      Adaptável
                    </span>
                  </div>
                  
                  <p className="text-gray-700 text-center mb-6">
                    Sistema inteligente que se adapta ao seu nível de conhecimento sobre o Fluminense
                  </p>
                  
                  <ul className="space-y-2 mb-8">
                    <li className="flex items-center text-gray-700">
                      <span className="w-2 h-2 bg-flu-grena rounded-full mr-3"></span>
                      Dificuldade ajusta automaticamente
                    </li>
                    <li className="flex items-center text-gray-700">
                      <span className="w-2 h-2 bg-flu-grena rounded-full mr-3"></span>
                      Sistema de pontuação inteligente
                    </li>
                    <li className="flex items-center text-gray-700">
                      <span className="w-2 h-2 bg-flu-grena rounded-full mr-3"></span>
                      Desafios personalizados
                    </li>
                  </ul>
                  
                  <Button 
                    onClick={() => navigate('/quiz-adaptativo')}
                    className="w-full bg-flu-grena hover:bg-flu-grena/90 text-white font-bold py-3 text-lg"
                  >
                    JOGAR AGORA
                  </Button>
                </div>

                {/* Quiz por Década */}
                <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-8 shadow-xl relative">
                  <div className="absolute top-4 right-4">
                    <span className="bg-flu-verde text-white text-xs px-3 py-1 rounded-full font-bold">NOVO</span>
                  </div>
                  
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 mx-auto bg-flu-verde rounded-full flex items-center justify-center mb-4">
                      <div className="text-white text-2xl">🏆</div>
                    </div>
                    <h2 className="text-2xl font-bold text-flu-grena mb-2">Quiz por Década</h2>
                    <span className="inline-block bg-flu-verde/10 text-flu-verde px-3 py-1 rounded-full text-sm font-medium">
                      Variável
                    </span>
                  </div>
                  
                  <p className="text-gray-700 text-center mb-6">
                    Teste seus conhecimentos sobre jogadores de épocas específicas do Fluminense
                  </p>
                  
                  <ul className="space-y-2 mb-8">
                    <li className="flex items-center text-gray-700">
                      <span className="w-2 h-2 bg-flu-verde rounded-full mr-3"></span>
                      Dos anos 70 até hoje
                    </li>
                    <li className="flex items-center text-gray-700">
                      <span className="w-2 h-2 bg-flu-verde rounded-full mr-3"></span>
                      Lendas de cada época
                    </li>
                    <li className="flex items-center text-gray-700">
                      <span className="w-2 h-2 bg-flu-verde rounded-full mr-3"></span>
                      História tricolor completa
                    </li>
                  </ul>
                  
                  <Button 
                    onClick={() => navigate('/quiz-decada')}
                    className="w-full bg-flu-grena hover:bg-flu-grena/90 text-white font-bold py-3 text-lg"
                  >
                    JOGAR AGORA
                  </Button>
                </div>
              </div>
            </div>

            {/* Tip Section */}
            <div className="max-w-4xl mx-auto">
              <div className="bg-black/20 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
                <div className="flex items-start gap-4">
                  <div className="text-3xl">💡</div>
                  <div>
                    <h3 className="text-xl font-bold text-yellow-300 mb-3">
                      DICA PARA TRICOLORES
                    </h3>
                    <p className="text-white/90 leading-relaxed">
                      Cada modo oferece uma experiência única! O Quiz Adaptativo é perfeito para 
                      testar seu conhecimento geral, enquanto o Quiz por Década permite focar 
                      em épocas específicas da rica história do Fluminense.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </RootLayout>
    </>
  );
};

export default GameModeSelection;