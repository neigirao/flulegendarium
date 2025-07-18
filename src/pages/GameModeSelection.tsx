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
        <div className="min-h-screen bg-gradient-to-br from-flu-verde/10 via-white to-flu-grena/10">
          <div className="container mx-auto px-4 pt-8 pb-8">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
              <Button
                variant="outline"
                onClick={() => navigate('/')}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Voltar ao Início
              </Button>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-flu-grena">
                  Escolha seu Modo de Jogo
                </h1>
                <p className="text-gray-600 mt-2">
                  Selecione o tipo de desafio que você quer enfrentar
                </p>
              </div>
            </div>

            {/* Game Modes Grid */}
            <div className="max-w-4xl mx-auto">
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

            {/* Additional Info */}
            <div className="mt-12 text-center">
              <div className="bg-flu-verde/10 rounded-xl p-6 max-w-2xl mx-auto">
                <h3 className="font-semibold text-flu-grena mb-3 text-lg">
                  💡 Dica para Tricolores
                </h3>
                <p className="text-gray-700">
                  Cada modo oferece uma experiência única! O Quiz Adaptativo é perfeito para 
                  testar seu conhecimento geral, enquanto o Quiz por Década permite focar 
                  em épocas específicas da rica história do Fluminense.
                </p>
              </div>
            </div>
          </div>
        </div>
      </RootLayout>
    </>
  );
};

export default GameModeSelection;