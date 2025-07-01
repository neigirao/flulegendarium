
import React, { Suspense } from "react";
import { RootLayout } from "@/components/RootLayout";
import { SEOHead } from "@/components/SEOHead";
import { GameErrorBoundary } from "@/components/error-boundaries/GameErrorBoundary";
import { DecadeGameContainer } from "@/components/decade-game/DecadeGameContainer";

const DecadeGuessPlayer = () => {
  return (
    <>
      <SEOHead 
        title="Quiz por Década - Lendas do Flu | Teste Seu Conhecimento por Época"
        description="🕰️ Escolha uma década e teste seus conhecimentos sobre as lendas do Fluminense de cada época! Dos anos 70 até os dias atuais."
        keywords="quiz por década fluminense, jogadores por época, história tricolor, lendas do flu"
        url="https://flulegendarium.lovable.app/quiz-decada"
      />
      <RootLayout>
        <GameErrorBoundary>
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
        </GameErrorBoundary>
      </RootLayout>
    </>
  );
};

export default DecadeGuessPlayer;
