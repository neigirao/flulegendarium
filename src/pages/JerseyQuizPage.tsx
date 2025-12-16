import React, { Suspense, lazy } from "react";
import { RootLayout } from "@/components/RootLayout";
import { SEOHead } from "@/components/SEOHead";
import { TopNavigation } from "@/components/navigation/TopNavigation";
import { GameErrorBoundary } from "@/components/error-boundaries/GameErrorBoundary";

const JerseyGameContainer = lazy(() => import("@/components/jersey-game/JerseyGameContainer"));

const JerseyQuizPage = () => {
  return (
    <>
      <SEOHead 
        title="Quiz das Camisas - Lendas do Flu | Adivinhe o Ano das Camisas Históricas"
        description="🎽 Teste seu conhecimento sobre as camisas históricas do Fluminense! Adivinhe o ano de cada camisa lendária do Tricolor."
        keywords="quiz camisas fluminense, camisas históricas tricolor, uniformes fluminense, história camisas flu"
        url="https://lendasdoflu.com/quiz-camisas"
      />
      <RootLayout>
        <GameErrorBoundary>
          <div className="min-h-screen bg-gradient-to-br from-secondary via-neutral-700 to-primary bg-tricolor-vertical-border">
            <TopNavigation />
            <div className="pt-24 safe-area-top safe-area-bottom">
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
