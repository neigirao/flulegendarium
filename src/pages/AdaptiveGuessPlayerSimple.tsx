import React, { Suspense, lazy } from "react";
import { RootLayout } from "@/components/RootLayout";
import { SEOManager } from "@/components/seo/SEOManager";
import { TopNavigation } from "@/components/navigation/TopNavigation";
import { GameErrorBoundary } from "@/components/error-boundaries/GameErrorBoundary";

const AdaptiveGameContainer = lazy(() => import("@/components/guess-game/AdaptiveGameContainer"));

const AdaptiveGuessPlayerSimple = () => {
  return (
    <>
      <SEOManager
        title="Advinhe o Jogador - Dificuldade Inteligente | Lendas do Flu"
        description="🎯 Modo adaptativo que ajusta a dificuldade conforme seu desempenho! Evolua gradualmente e domine as lendas do Fluminense."
        schema="Game"
      />
      <RootLayout>
        <GameErrorBoundary>
          <div data-testid="quiz-adaptativo-page" className="min-h-screen page-warm">
            <TopNavigation />
            <div className="pt-24 pb-8 safe-area-top safe-area-bottom">
              <Suspense fallback={
                <div className="min-h-screen flex items-center justify-center">
                  <div className="flex flex-col items-center gap-4 p-6 bg-background/80 backdrop-blur-sm rounded-xl shadow-lg">
                    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-primary font-display tracking-wide">Carregando Advinhe o Jogador...</p>
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
