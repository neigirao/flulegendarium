
import React, { Suspense, lazy } from "react";
import { RootLayout } from "@/components/RootLayout";
import { SEOHead } from "@/components/SEOHead";
import { TopNavigation } from "@/components/navigation/TopNavigation";
import { GameErrorBoundary } from "@/components/error-boundaries/GameErrorBoundary";

const AdaptiveGameContainer = lazy(() => import("@/components/guess-game/AdaptiveGameContainer"));

const AdaptiveGuessPlayerSimple = () => {
  return (
    <>
      <SEOHead 
        title="Quiz Adaptativo - Lendas do Flu | Dificuldade que se Adapta a Você"
        description="🎯 Modo adaptativo que ajusta a dificuldade conforme seu desempenho! Evolua gradualmente e domine as lendas do Fluminense."
        keywords="quiz adaptativo fluminense, dificuldade progressiva, quiz inteligente tricolor"
        url="https://flulegendarium.lovable.app/quiz-adaptativo"
      />
      <RootLayout>
        <GameErrorBoundary>
          <div className="min-h-screen bg-gradient-to-br from-flu-verde via-slate-700 to-flu-grena">
            <TopNavigation />
            <div className="pt-24">
              <Suspense fallback={
                <div className="min-h-screen flex items-center justify-center">
                  <div className="flex flex-col items-center gap-4 p-6 bg-white/80 backdrop-blur-sm rounded-xl shadow-lg">
                    <div className="w-8 h-8 border-4 border-flu-grena border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-flu-grena font-semibold">Carregando Quiz Adaptativo...</p>
                  </div>
                </div>
              }>
                <AdaptiveGameContainer />
              </Suspense>
            </div>
          </div>
        </GameErrorBoundary>
      </RootLayout>
    </>
  );
};

export default AdaptiveGuessPlayerSimple;
