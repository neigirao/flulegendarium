import React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, Calendar, Shirt, ChevronRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const useCollectionCounts = () => {
  const { data: playerCount } = useQuery({
    queryKey: ['player-count'],
    queryFn: async () => {
      const { count } = await supabase.from('players').select('*', { count: 'exact', head: true });
      return count || 0;
    },
    staleTime: 30 * 60 * 1000,
  });

  const { data: jerseyCount } = useQuery({
    queryKey: ['jersey-count'],
    queryFn: async () => {
      const { count } = await supabase.from('jerseys').select('*', { count: 'exact', head: true });
      return count || 0;
    },
    staleTime: 30 * 60 * 1000,
  });

  return { playerCount: playerCount || 0, jerseyCount: jerseyCount || 0 };
};

export const GameModesPreview = () => {
  const { playerCount, jerseyCount } = useCollectionCounts();

  const gameModes = [
    {
      id: "adaptive",
      title: "Quiz Adaptativo",
      description: "Veja a foto e digite o nome. A dificuldade aumenta conforme você acerta!",
      icon: Brain,
      badge: playerCount > 0 ? `${playerCount}+ jogadores` : "188+ jogadores",
      badgeVariant: "secondary" as const,
      href: "/quiz-adaptativo",
      iconBg: "bg-primary/10",
      iconColor: "text-primary"
    },
    {
      id: "decade",
      title: "Quiz por Década",
      description: "Escolha uma época: 60s, 70s, 80s, 90s, 2000s ou 2010s+ e teste seu conhecimento!",
      icon: Calendar,
      badge: "6 décadas",
      badgeVariant: "outline" as const,
      href: "/quiz-decada",
      iconBg: "bg-secondary/10",
      iconColor: "text-secondary"
    },
    {
      id: "jersey",
      title: "Quiz das Camisas",
      description: "Veja a camisa histórica e escolha o ano correto entre 3 opções!",
      icon: Shirt,
      badge: jerseyCount > 0 ? `${jerseyCount} camisas` : "Popular",
      badgeVariant: "default" as const,
      href: "/quiz-camisas",
      iconBg: "bg-gold/10",
      iconColor: "text-gold",
      isPopular: true
    }
  ];

  return (
    <div className="mb-16">
      <div className="text-center mb-8">
        <h2 className="text-display-title text-primary mb-3">
          Escolha seu Modo de Jogo
        </h2>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto font-body">
          3 formas diferentes de testar seu conhecimento tricolor
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {gameModes.map((mode) => {
          const Icon = mode.icon;
          
          return (
            <Link key={mode.id} to={mode.href} className="group">
              <Card className={`h-full bg-card border border-border shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-105 ${mode.isPopular ? 'ring-2 ring-gold/40' : ''}`}>
                <CardHeader className="text-center pb-2">
                  <div className={`mx-auto p-4 rounded-full ${mode.iconBg} mb-3 group-hover:scale-110 transition-transform ${mode.iconColor}`}>
                    <Icon className="w-10 h-10" />
                  </div>
                  
                  <div className="flex items-center justify-center gap-2">
                    <CardTitle className="text-foreground font-display text-lg">
                      {mode.title}
                    </CardTitle>
                    {mode.isPopular && (
                      <Badge variant={mode.badgeVariant}>
                        {mode.badge}
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                
                <CardContent className="text-center">
                  <CardDescription className="text-muted-foreground font-body mb-4">
                    {mode.description}
                  </CardDescription>
                  
                  {!mode.isPopular && (
                    <Badge variant={mode.badgeVariant} className="text-xs">
                      {mode.badge}
                    </Badge>
                  )}
                  
                  <div className="mt-4 flex items-center justify-center text-primary group-hover:text-primary/80 transition-colors">
                    <span className="text-sm font-medium">Jogar agora</span>
                    <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default GameModesPreview;
