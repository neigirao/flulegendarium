
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Decade } from "@/types/decade-game";
import { getAllDecades } from "@/data/decades";

interface DecadeSelectionPageProps {
  onDecadeSelect: (decade: Decade) => void;
  playerCounts?: Record<Decade, number>;
}

export const DecadeSelectionPage = ({ 
  onDecadeSelect, 
  playerCounts = {
    '1970s': 0,
    '1980s': 0,
    '1990s': 0,
    '2000s': 0,
    '2010s': 0,
    '2020s': 0
  }
}: DecadeSelectionPageProps) => {
  const navigate = useNavigate();
  const decades = getAllDecades();

  return (
    <div data-testid="decade-selection-page" className="min-h-screen page-warm bg-tricolor-vertical-border p-4 safe-area-top safe-area-bottom">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="outline"
            onClick={() => navigate('/game-modes')}
            className="flex items-center gap-2 touch-target"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Button>
          <div>
            <h1 className="text-display-title text-primary">
              Escolha uma Época
            </h1>
            <p className="text-muted-foreground mt-2 font-body">
              Teste seus conhecimentos sobre jogadores de uma década específica
            </p>
          </div>
        </div>

        {/* Décadas Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {decades.map((decade) => (
            <Card 
              key={decade.id}
              className="group hover:shadow-lg transition-all duration-300 cursor-pointer transform hover:scale-[1.02]"
              onClick={() => onDecadeSelect(decade.id)}
            >
              <CardHeader className="text-center">
                <div className={`w-16 h-16 rounded-full ${decade.color} flex items-center justify-center text-primary-foreground text-2xl mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                  {decade.icon}
                </div>
                <CardTitle className="text-display-sm text-primary">
                  {decade.label}
                </CardTitle>
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground font-body">
                  <Calendar className="w-4 h-4" />
                  {decade.period}
                </div>
              </CardHeader>
              
              <CardContent className="text-center">
                <p className="text-muted-foreground mb-4 text-sm font-body">
                  {decade.description}
                </p>
                
                {playerCounts[decade.id] > 0 && (
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <Users className="w-4 h-4 text-secondary" />
                    <Badge variant="secondary" className="bg-secondary/10 text-secondary font-body">
                      {playerCounts[decade.id]} jogadores
                    </Badge>
                  </div>
                )}
                
                <Button 
                  data-testid={`decade-option-${decade.id}`}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-display tracking-wide touch-target-lg"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDecadeSelect(decade.id);
                  }}
                >
                  Jogar {decade.label}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Dica */}
        <div className="mt-12 text-center">
          <div className="bg-secondary/10 rounded-lg p-6 max-w-2xl mx-auto">
            <h3 className="font-display text-primary mb-2 tracking-wide">
              💡 DICA IMPORTANTE
            </h3>
            <p className="text-muted-foreground text-sm font-body">
              Cada década tem seus próprios desafios e lendas. Escolha a época que você mais conhece 
              ou aventure-se em uma nova era da história do Fluminense!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
