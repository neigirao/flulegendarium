import React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, Calendar, Shirt, ChevronRight } from "lucide-react";

const gameModes = [
  {
    id: "adaptive",
    title: "Quiz Adaptativo",
    description: "Veja a foto e digite o nome. A dificuldade aumenta conforme você acerta!",
    icon: Brain,
    badge: "188+ jogadores",
    badgeVariant: "secondary" as const,
    href: "/quiz-adaptativo",
    color: "text-primary"
  },
  {
    id: "decade",
    title: "Quiz por Década",
    description: "Escolha uma época: 60s, 70s, 80s, 90s, 2000s ou 2010s+ e teste seu conhecimento!",
    icon: Calendar,
    badge: "6 décadas",
    badgeVariant: "outline" as const,
    href: "/quiz-decada",
    color: "text-secondary"
  },
  {
    id: "jersey",
    title: "Quiz das Camisas",
    description: "Veja a camisa histórica e escolha o ano correto entre 3 opções!",
    icon: Shirt,
    badge: "NOVO!",
    badgeVariant: "default" as const,
    href: "/quiz-camisas",
    color: "text-accent",
    isNew: true
  }
];

export const GameModesPreview = () => {
  return (
    <div className="mb-16">
      <div className="text-center mb-8">
        <h2 className="text-display-title text-primary-foreground mb-3">
          Escolha seu Modo de Jogo
        </h2>
        <p className="text-primary-foreground/80 text-lg max-w-2xl mx-auto font-body">
          3 formas diferentes de testar seu conhecimento tricolor
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {gameModes.map((mode) => {
          const Icon = mode.icon;
          
          return (
            <Link key={mode.id} to={mode.href} className="group">
              <Card className={`h-full bg-card/10 backdrop-blur-sm border-border/20 hover:bg-card/20 transition-all duration-300 hover:scale-105 hover:shadow-xl ${mode.isNew ? 'ring-2 ring-accent/50' : ''}`}>
                <CardHeader className="text-center pb-2">
                  <div className={`mx-auto p-4 rounded-full bg-background/10 mb-3 group-hover:bg-background/20 transition-colors ${mode.color}`}>
                    <Icon className="w-10 h-10" />
                  </div>
                  
                  <div className="flex items-center justify-center gap-2">
                    <CardTitle className="text-primary-foreground font-display text-lg">
                      {mode.title}
                    </CardTitle>
                    {mode.isNew && (
                      <Badge variant={mode.badgeVariant} className="animate-pulse">
                        {mode.badge}
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                
                <CardContent className="text-center">
                  <CardDescription className="text-primary-foreground/70 font-body mb-4">
                    {mode.description}
                  </CardDescription>
                  
                  {!mode.isNew && (
                    <Badge variant={mode.badgeVariant} className="text-xs">
                      {mode.badge}
                    </Badge>
                  )}
                  
                  <div className="mt-4 flex items-center justify-center text-primary-foreground/60 group-hover:text-primary-foreground transition-colors">
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
