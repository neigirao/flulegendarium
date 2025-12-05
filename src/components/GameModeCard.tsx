
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";

interface GameModeCardProps {
  title: string;
  description: string;
  icon: string;
  route: string;
  isNew?: boolean;
  difficulty?: string;
  features?: string[];
}

export const GameModeCard = ({ 
  title, 
  description, 
  icon, 
  route, 
  isNew = false, 
  difficulty,
  features = []
}: GameModeCardProps) => {
  const navigate = useNavigate();

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer transform hover:scale-105">
      <CardHeader className="text-center">
        <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-3xl mx-auto mb-4 group-hover:scale-110 transition-transform">
          {icon}
        </div>
        <div className="flex items-center justify-center gap-2 mb-2">
          <CardTitle className="text-xl font-bold text-primary">
            {title}
          </CardTitle>
          {isNew && (
            <Badge variant="secondary" className="bg-secondary/10 text-secondary text-xs">
              NOVO
            </Badge>
          )}
        </div>
        {difficulty && (
          <Badge variant="outline" className="w-fit mx-auto">
            {difficulty}
          </Badge>
        )}
      </CardHeader>
      
      <CardContent className="text-center">
        <p className="text-muted-foreground mb-4 text-sm">
          {description}
        </p>
        
        {features.length > 0 && (
          <div className="mb-4">
            <ul className="text-xs text-muted-foreground space-y-1">
              {features.map((feature, index) => (
                <li key={index} className="flex items-center justify-center gap-1">
                  <span className="text-secondary">•</span>
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        )}
        
        <Button 
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
          onClick={() => navigate(route)}
        >
          Jogar Agora
        </Button>
      </CardContent>
    </Card>
  );
};
