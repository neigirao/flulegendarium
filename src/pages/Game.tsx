
import React, { useEffect } from "react";
import { Loader as GameLoader } from "lucide-react";

import { SEOHead } from "@/components/SEOHead";
import { ErrorDisplay } from "@/components/guess-game/ErrorDisplay";
import { EmptyPlayersDisplay } from "@/components/guess-game/EmptyPlayersDisplay";
import { GameHeader } from "@/components/game/GameHeader";
import { SimpleGame } from "@/components/game/SimpleGame";

import { useAuth } from "@/hooks/useAuth";
import { useAnalytics } from "@/hooks/use-analytics";
import { usePlayersData } from "@/hooks/use-players-data";

const Game = () => {
  console.log("🎮 Game component INICIANDO...");
  
  const { user } = useAuth();
  const { trackPageView, trackEvent } = useAnalytics();
  
  // Carregar dados dos jogadores
  const { players, isLoading, error } = usePlayersData();
  
  console.log("🎮 Game - Dados carregados:", {
    players: players ? `${players.length} jogadores` : 'nenhum',
    isLoading,
    hasError: !!error,
    primeirosJogadores: players?.slice(0, 3).map(p => ({ name: p.name, url: p.image_url?.substring(0, 50) + '...' }))
  });

  // Track page view
  useEffect(() => {
    trackPageView('/jogar-quiz-fluminense');
  }, [trackPageView]);

  // Loading state
  if (isLoading) {
    console.log("🔄 Game - Mostrando loading...");
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <GameLoader className="w-8 h-8 animate-spin mx-auto mb-4 text-flu-grena" />
          <p className="text-lg font-medium text-flu-grena">Carregando jogadores...</p>
          <p className="text-sm text-gray-600 mt-2">Aguarde enquanto preparamos o jogo</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    console.error("❌ Game - Erro ao carregar jogadores:", error);
    return <ErrorDisplay error={error} />;
  }

  // Empty players state
  if (!players || players.length === 0) {
    console.warn("⚠️ Game - Nenhum jogador disponível");
    return <EmptyPlayersDisplay />;
  }

  console.log("✅ Game - Renderizando jogo simples com", players.length, "jogadores");

  return (
    <>
      <SEOHead 
        title="Jogar Quiz Fluminense - Adivinhe os Jogadores | Lendas do Flu"
        description="🎮 Jogue agora o quiz oficial do Fluminense! Adivinhe os jogadores pelas fotos, ganhe pontos e entre no ranking tricolor. Desafio gratuito!"
        keywords="jogar quiz fluminense, adivinhar jogador fluminense, jogo tricolor, quiz futebol online, teste fluminense grátis"
        url="https://flulegendarium.lovable.app/jogar-quiz-fluminense"
        canonical="https://flulegendarium.lovable.app/jogar-quiz-fluminense"
      />
      
      <div className="min-h-screen bg-gradient-to-b from-flu-verde to-white">
        <GameHeader user={user} trackEvent={trackEvent} />
        
        <div className="py-8 px-4">
          <div className="container mx-auto max-w-4xl">
            <SimpleGame players={players} />
          </div>
        </div>
      </div>
    </>
  );
};

export default Game;
