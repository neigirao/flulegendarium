import React from 'react';
import { Play, BarChart3, Trophy, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { FluCard, FluCardContent, FluCardHeader, FluCardTitle } from '@/components/ui/flu-card';

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  action: () => void;
  variant: 'verde' | 'grena' | 'tricolor' | 'elegant';
}

export const QuickActions = () => {
  const navigate = useNavigate();

  const actions: QuickAction[] = [
    {
      id: 'play-adaptive',
      title: 'Jogar Agora',
      description: 'Quiz adaptativo rápido',
      icon: <Play className="w-5 h-5" />,
      action: () => navigate('/quiz-adaptativo'),
      variant: 'verde'
    },
    {
      id: 'view-stats',
      title: 'Minhas Stats',
      description: 'Ver estatísticas pessoais',
      icon: <BarChart3 className="w-5 h-5" />,
      action: () => navigate('/perfil'),
      variant: 'tricolor'
    },
    {
      id: 'leaderboard',
      title: 'Ranking',
      description: 'Hall da fama tricolor',
      icon: <Trophy className="w-5 h-5" />,
      action: () => {
        document.getElementById('ranking-section')?.scrollIntoView({ 
          behavior: 'smooth' 
        });
      },
      variant: 'grena'
    },
    {
      id: 'social',
      title: 'Comunidade',
      description: 'Interagir com outros fãs',
      icon: <Users className="w-5 h-5" />,
      action: () => navigate('/social'),
      variant: 'elegant'
    }
  ];

  return (
    <FluCard variant="elegant" className="mb-8">
      <FluCardHeader>
        <FluCardTitle className="flex items-center gap-2">
          <Play className="w-5 h-5 text-flu-grena" />
          Ações Rápidas
        </FluCardTitle>
      </FluCardHeader>
      
      <FluCardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {actions.map((action) => (
            <Button
              key={action.id}
              variant="outline"
              onClick={action.action}
              className={`h-auto p-4 flex flex-col items-center gap-2 hover:scale-105 transition-all group ${
                action.variant === 'verde' ? 'hover:border-flu-verde hover:bg-flu-verde/5' :
                action.variant === 'grena' ? 'hover:border-flu-grena hover:bg-flu-grena/5' :
                action.variant === 'tricolor' ? 'hover:border-flu-verde hover:bg-gradient-to-r hover:from-flu-verde/5 hover:to-flu-grena/5' :
                'hover:border-gray-400 hover:bg-gray-50'
              }`}
            >
              <div className={`p-2 rounded-lg ${
                action.variant === 'verde' ? 'bg-flu-verde/10 text-flu-verde group-hover:bg-flu-verde/20' :
                action.variant === 'grena' ? 'bg-flu-grena/10 text-flu-grena group-hover:bg-flu-grena/20' :
                action.variant === 'tricolor' ? 'bg-gradient-to-r from-flu-verde/10 to-flu-grena/10 text-flu-grena' :
                'bg-gray-100 text-gray-600 group-hover:bg-gray-200'
              }`}>
                {action.icon}
              </div>
              
              <div className="text-center">
                <div className="font-medium text-sm">{action.title}</div>
                <div className="text-xs text-gray-500 mt-1">{action.description}</div>
              </div>
            </Button>
          ))}
        </div>
      </FluCardContent>
    </FluCard>
  );
};