
import React from "react";
import { RootLayout } from "@/components/RootLayout";
import { SEOHead } from "@/components/SEOHead";
import { GameModeCard } from "@/components/GameModeCard";

const Index = () => {
  return (
    <>
      <SEOHead 
        title="Lendas do Flu | Quiz Interativo dos Jogadores do Fluminense"
        description="🏆 Teste seus conhecimentos sobre os grandes ídolos e lendas do Fluminense! Quiz adaptativo com diferentes níveis de dificuldade."
        keywords="fluminense, quiz, jogadores, futebol, tricolor, lendas do flu"
        url="https://flulegendarium.lovable.app"
      />
      <RootLayout>
        <div className="min-h-screen bg-gradient-to-br from-flu-verde/10 via-white to-flu-grena/10">
          {/* Hero Section */}
          <div className="container mx-auto px-4 pt-12 pb-8">
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-6xl font-bold text-flu-grena mb-4">
                Lendas do Flu
              </h1>
              <p className="text-xl text-gray-700 mb-8 max-w-2xl mx-auto">
                Teste seus conhecimentos sobre os grandes ídolos e lendas do Fluminense! 
                Descubra o quanto você realmente conhece sobre os craques tricolores.
              </p>
              
              <div className="flex flex-wrap justify-center gap-4 mb-8">
                <div className="bg-white/80 backdrop-blur-sm rounded-lg px-4 py-2 shadow-md">
                  <span className="text-flu-grena font-semibold">🏆 +200 Jogadores</span>
                </div>
                <div className="bg-white/80 backdrop-blur-sm rounded-lg px-4 py-2 shadow-md">
                  <span className="text-flu-grena font-semibold">⚽ Todas as Épocas</span>
                </div>
                <div className="bg-white/80 backdrop-blur-sm rounded-lg px-4 py-2 shadow-md">
                  <span className="text-flu-grena font-semibold">🎯 Quiz Adaptativo</span>
                </div>
              </div>
            </div>

            {/* Game Modes */}
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-center text-flu-grena mb-8">
                Escolha seu Modo de Jogo
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <GameModeCard
                  title="Quiz Adaptativo"
                  description="Sistema inteligente que se adapta ao seu nível de conhecimento sobre o Fluminense"
                  icon="🎯"
                  route="/quiz-adaptativo"
                  difficulty="Adaptável"
                  features={[
                    "Dificuldade ajusta automaticamente",
                    "Sistema de pontuação inteligente",
                    "Desafios personalizados"
                  ]}
                />
                
                <GameModeCard
                  title="Quiz por Década"
                  description="Teste seus conhecimentos sobre jogadores de épocas específicas do Fluminense"
                  icon="🕰️"
                  route="/quiz-decada"
                  isNew={true}
                  difficulty="Variável"
                  features={[
                    "Dos anos 70 até hoje",
                    "Lendas de cada época",
                    "História tricolor completa"
                  ]}
                />
              </div>
            </div>

            {/* Features Section */}
            <div className="mt-16 text-center">
              <h3 className="text-2xl font-bold text-flu-grena mb-8">
                Por que jogar Lendas do Flu?
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 shadow-lg">
                  <div className="text-4xl mb-4">🧠</div>
                  <h4 className="font-semibold text-flu-grena mb-2">Teste seu Conhecimento</h4>
                  <p className="text-gray-700 text-sm">
                    Descubra o quanto você realmente sabe sobre a história tricolor
                  </p>
                </div>
                
                <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 shadow-lg">
                  <div className="text-4xl mb-4">📚</div>
                  <h4 className="font-semibold text-flu-grena mb-2">Aprenda História</h4>
                  <p className="text-gray-700 text-sm">
                    Conheça curiosidades e fatos sobre os ídolos do Fluminense
                  </p>
                </div>
                
                <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 shadow-lg">
                  <div className="text-4xl mb-4">🏆</div>
                  <h4 className="font-semibold text-flu-grena mb-2">Desafie-se</h4>
                  <p className="text-gray-700 text-sm">
                    Supere seus limites e torne-se um verdadeiro conhecedor tricolor
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </RootLayout>
    </>
  );
};

export default Index;
