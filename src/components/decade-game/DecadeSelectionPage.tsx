
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

export const DecadeSelectionPage = ({ onDecadeSelect, playerCounts = {} }: DecadeSelectionPageProps) => {
  const navigate = useNavigate();
  const decades = getAllDecades();

  return (
    <div className="min-h-screen bg-gradient-to-br from-flu-verde/10 via-white to-flu-grena/10 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="outline"
            onClick={() => navigate('/game-modes')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-flu-grena">
              Escolha uma Época
            </h1>
            <p className="text-gray-600 mt-2">
              Teste seus conhecimentos sobre jogadores de uma década específica
            </p>
          </div>
        </div>

        {/* Décadas Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {decades.map((decade) => (
            <Card 
              key={decade.id}
              className="group hover:shadow-lg transition-all duration-300 cursor-pointer transform hover:scale-105"
              onClick={() => onDecadeSelect(decade.id)}
            >
              <CardHeader className="text-center">
                <div className={`w-16 h-16 rounded-full ${decade.color} flex items-center justify-center text-white text-2xl mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                  {decade.icon}
                </div>
                <CardTitle className="text-xl font-bold text-flu-grena">
                  {decade.label}
                </CardTitle>
                <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                  <Calendar className="w-4 h-4" />
                  {decade.period}
                </div>
              </CardHeader>
              
              <CardContent className="text-center">
                <p className="text-gray-700 mb-4 text-sm">
                  {decade.description}
                </p>
                
                {playerCounts[decade.id] && (
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <Users className="w-4 h-4 text-flu-verde" />
                    <Badge variant="secondary" className="bg-flu-verde/10 text-flu-verde">
                      {playerCounts[decade.id]} jogadores
                    </Badge>
                  </div>
                )}
                
                <Button 
                  className="w-full bg-flu-grena hover:bg-flu-grena/90 text-white"
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
          <div className="bg-flu-verde/10 rounded-lg p-6 max-w-2xl mx-auto">
            <h3 className="font-semibold text-flu-grena mb-2">
              💡 Dica Importante
            </h3>
            <p className="text-gray-700 text-sm">
              Cada década tem seus próprios desafios e lendas. Escolha a época que você mais conhece 
              ou aventure-se em uma nova era da história do Fluminense!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
