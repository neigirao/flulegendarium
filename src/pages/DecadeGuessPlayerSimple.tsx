import React, { Suspense, lazy } from "react";
import { RootLayout } from "@/components/RootLayout";
import { SEOManager } from "@/components/seo/SEOManager";
import { TopNavigation } from "@/components/navigation/TopNavigation";
import { GameErrorBoundary } from "@/components/error-boundaries/GameErrorBoundary";

const DecadeGameContainer = lazy(() => import("@/components/decade-game/DecadeGameContainer"));

const DecadeGuessPlayerSimple = () => {
  return (
    <>
      <SEOManager
        title="Advinhe o Jogador por Década - Jogadores de Cada Era do Fluminense | Lendas do Flu"
        description="🗓️ Escolha uma década e teste seus conhecimentos sobre as lendas do Fluminense! Dos anos 60 até os dias atuais."
        schema="Game"
      />
      <RootLayout>
        <GameErrorBoundary>
          <div data-testid="quiz-decada-page" className="min-h-screen page-warm">
            <TopNavigation />
            <div className="pt-16 pb-8 safe-area-top safe-area-bottom">
              <Suspense fallback={
                <div className="min-h-screen flex items-center justify-center">
                  <div className="flex flex-col items-center gap-4 p-6 bg-background/80 backdrop-blur-sm rounded-xl shadow-lg">
                    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-primary font-display tracking-wide">Carregando Advinhe o Jogador por Década...</p>
                  </div>
                </div>
              }>
                <DecadeGameContainer />
              </Suspense>
            </div>
          </div>
        </GameErrorBoundary>
      </RootLayout>
    </>
  );
};

export default DecadeGuessPlayerSimple;