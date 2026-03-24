import React, { Suspense, lazy } from "react";
import { RootLayout } from "@/components/RootLayout";
import { SEOManager } from "@/components/seo/SEOManager";
import { TopNavigation } from "@/components/navigation/TopNavigation";
import { GameErrorBoundary } from "@/components/error-boundaries/GameErrorBoundary";

const JerseyGameContainer = lazy(() => import("@/components/jersey-game/JerseyGameContainer"));

const JerseyQuizPage = () => {
  return (
    <>
      <SEOManager 
        title="Quiz das Camisas - Adivinhe o Ano | Lendas do Flu"
        description="🎽 Veja a camisa histórica do Fluminense e escolha entre 3 opções qual é o ano correto! Teste seu conhecimento sobre os uniformes tricolores."
        keywords="quiz camisas fluminense, uniformes históricos tricolor, camisas antigas flu, adivinhar ano camisa, quiz múltipla escolha"
        schema="Game"
      />
      <RootLayout>
        <GameErrorBoundary>
          <div data-testid="quiz-camisas-page" className="min-h-screen page-warm">
            <TopNavigation />
            <div className="pt-24 pb-8 safe-area-top safe-area-bottom">
              <Suspense fallback={
                <div className="min-h-screen flex items-center justify-center">
                  <div className="flex flex-col items-center gap-4 p-6 bg-background/80 backdrop-blur-sm rounded-xl shadow-lg">
                    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-primary font-display tracking-wide">Carregando Quiz das Camisas...</p>
                  </div>
                </div>
              }>
                <JerseyGameContainer />
              </Suspense>
            </div>
          </div>
        </GameErrorBoundary>
      </RootLayout>
    </>
  );
};

export default JerseyQuizPage;
