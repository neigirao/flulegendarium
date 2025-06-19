
import React, { useState, useEffect, useCallback } from "react";
import { Loader as GameLoader } from "lucide-react";
import { Link } from "react-router-dom";

import { SEOHead } from "@/components/SEOHead";
import { ErrorDisplay } from "@/components/guess-game/ErrorDisplay";
import { EmptyPlayersDisplay } from "@/components/guess-game/EmptyPlayersDisplay";
import { AuthButton } from "@/components/auth/AuthButton";
import { NewGameComponent } from "@/components/game2/NewGameComponent";

import { useAuth } from "@/hooks/useAuth";
import { useAnalytics } from "@/hooks/use-analytics";
import { usePlayersData } from "@/hooks/use-players-data";

const Game2 = () => {
  console.log("🎮 Game2 component INICIANDO...");
  
  const { user } = useAuth();
  const { trackPageView } = useAnalytics();
  
  // Carregar dados dos jogadores
  const { players, isLoading, error } = usePlayersData();
  
  console.log("🎮 Game2 - Dados carregados:", {
    players: players ? `${players.length} jogadores` : 'nenhum',
    isLoading,
    hasError: !!error,
  });

  // Track page view
  useEffect(() => {
    trackPageView('/jogo-2');
  }, [trackPageView]);

  // Loading state
  if (isLoading) {
    console.log("🔄 Game2 - Mostrando loading...");
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <GameLoader className="w-8 h-8 animate-spin mx-auto mb-4 text-flu-grena" />
          <p className="text-lg font-medium text-flu-grena">Carregando Jogo 2...</p>
          <p className="text-sm text-gray-600 mt-2">Preparando o novo quiz</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    console.error("❌ Game2 - Erro ao carregar jogadores:", error);
    return <ErrorDisplay error={error} />;
  }

  // Empty players state
  if (!players || players.length === 0) {
    console.warn("⚠️ Game2 - Nenhum jogador disponível");
    return <EmptyPlayersDisplay />;
  }

  console.log("✅ Game2 - Renderizando novo jogo com", players.length, "jogadores");

  return (
    <>
      <SEOHead 
        title="Jogo 2 - Quiz Fluminense Novo | Lendas do Flu"
        description="🎮 Experimente o novo quiz do Fluminense! Versão melhorada com regras simples e diretas."
        keywords="jogo 2 fluminense, novo quiz tricolor, adivinhar jogador fluminense"
        url="https://flulegendarium.lovable.app/jogo-2"
        canonical="https://flulegendarium.lovable.app/jogo-2"
      />
      
      <div className="min-h-screen bg-gradient-to-b from-flu-verde to-white">
        {/* Header */}
        <header className="bg-white/90 backdrop-blur-sm shadow-sm py-4 sticky top-0 z-50">
          <div className="container mx-auto px-4 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3">
              <img 
                src="/lovable-uploads/0aa3609f-0584-4bf4-8303-e03f50f7e131.png" 
                alt="Escudo Fluminense FC" 
                className="w-8 h-8 object-contain"
              />
              <span className="text-2xl font-bold text-flu-grena">Lendas do Flu</span>
            </Link>
            <nav className="flex items-center space-x-6">
              <Link to="/" className="text-flu-verde hover:text-flu-grena transition-colors">
                Início
              </Link>
              <Link to="/selecionar-modo-jogo" className="text-flu-verde hover:text-flu-grena transition-colors">
                Jogar
              </Link>
              <Link to="/jogo-2" className="text-flu-grena font-semibold">
                Jogo 2
              </Link>
              {user && (
                <Link to="/meu-perfil-tricolor" className="text-flu-verde hover:text-flu-grena transition-colors">
                  Meu Perfil
                </Link>
              )}
              <AuthButton />
            </nav>
          </div>
        </header>

        {/* Game Content */}
        <div className="py-8 px-4">
          <div className="container mx-auto max-w-4xl">
            {/* Title */}
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-flu-grena mb-4">🎮 Jogo 2 - Quiz Fluminense</h1>
              <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6 shadow-lg border-2 border-flu-verde mb-6">
                <h2 className="text-xl font-semibold text-flu-grena mb-4">📋 Regras do Jogo</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">⏱️</span>
                    <span>1 minuto para responder</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">🎯</span>
                    <span>Apenas 1 tentativa</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">🚫</span>
                    <span>Não pode trocar de aba</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">✅</span>
                    <span>Acertou = +5 pontos</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">❌</span>
                    <span>Errou = Game Over</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">📈</span>
                    <span>Fácil → Difícil</span>
                  </div>
                </div>
              </div>
            </div>
            
            <NewGameComponent players={players} />
          </div>
        </div>
      </div>
    </>
  );
};

export default Game2;
