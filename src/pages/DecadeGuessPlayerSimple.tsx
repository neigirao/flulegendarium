import React, { Suspense, lazy } from "react";
import { RootLayout } from "@/components/RootLayout";
import { SEOHead } from "@/components/SEOHead";
import { TopNavigation } from "@/components/navigation/TopNavigation";
import { GameErrorBoundary } from "@/components/error-boundaries/GameErrorBoundary";

const DecadeGameContainer = lazy(() => import("@/components/decade-game/DecadeGameContainer"));

const DecadeGuessPlayerSimple = () => {
  return (
    <>
      <SEOHead 
        title="Quiz por Década - Lendas do Flu | Teste Seu Conhecimento por Era"
        description="🗓️ Escolha uma década e teste seus conhecimentos sobre as lendas do Fluminense! De 1950 até os dias atuais."
        keywords="quiz década fluminense, história tricolor, jogadores por época"
        url="https://flulegendarium.lovable.app/quiz-decada"
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
                    <p className="text-flu-grena font-semibold">Carregando Quiz por Década...</p>
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