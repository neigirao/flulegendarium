import React from 'react';
import { TrendingUp, Target, Clock, Award, Zap, Brain } from 'lucide-react';
import { FluCard, FluCardContent, FluCardHeader, FluCardTitle } from '@/components/ui/flu-card';
import { ProgressRing } from '@/components/ui/progress-ring';
import { ScoreDisplay } from '@/components/ui/score-display';

interface GameInsightsProps {
  score?: number;
  correctGuesses?: number;
  totalAttempts?: number;
  streak?: number;
  gameMode?: string;
  difficulty?: string;
  data?: {
    totalGames: number;
    accuracy: number;
    averageTime: number;
    longestStreak: number;
    difficultyLevel: string;
    weeklyProgress: number;
  };
}

export const GameInsights = ({ score, correctGuesses, totalAttempts, streak, gameMode, difficulty, data }: GameInsightsProps) => {
  // Return early if no data is provided
  if (!data) {
    return (
      <FluCard variant="tricolor" className="mb-8">
        <FluCardContent className="text-center py-12">
          <Brain className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-500 mb-2">Nenhuma estatística disponível</p>
          <p className="text-sm text-gray-400">Jogue algumas partidas para ver suas estatísticas!</p>
        </FluCardContent>
      </FluCard>
    );
  }

  const insights = data;

  const getDifficultyColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'iniciante': return 'text-green-600';
      case 'intermediário': return 'text-yellow-600';
      case 'avançado': return 'text-orange-600';
      case 'expert': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getPerformanceMessage = (accuracy: number) => {
    if (accuracy >= 90) return { message: 'Excelente! Você é um verdadeiro conhecedor!', emoji: '🏆', color: 'text-yellow-600' };
    if (accuracy >= 75) return { message: 'Muito bom! Continue assim!', emoji: '⭐', color: 'text-flu-verde' };
    if (accuracy >= 60) return { message: 'Bom trabalho! Pode melhorar ainda mais!', emoji: '👍', color: 'text-blue-600' };
    return { message: 'Continue praticando, você está evoluindo!', emoji: '💪', color: 'text-flu-grena' };
  };

  const performance = getPerformanceMessage(insights.accuracy);

  return (
    <FluCard variant="tricolor" className="mb-8">
      <FluCardHeader>
        <FluCardTitle className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-flu-grena" />
          Suas Estatísticas de Jogo
        </FluCardTitle>
      </FluCardHeader>
      
      <FluCardContent>
        {/* Performance Summary */}
        <div className="bg-gradient-to-r from-flu-verde/10 to-flu-grena/10 rounded-xl p-4 mb-6">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-2xl">{performance.emoji}</span>
            <div>
              <div className={`font-semibold ${performance.color}`}>
                {performance.message}
              </div>
              <div className="text-sm text-gray-600">
                Baseado no seu desempenho de {insights.accuracy}% de acertos
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          {/* Total Games */}
          <div className="text-center">
            <div className="bg-flu-verde/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2">
              <Target className="w-6 h-6 text-flu-verde" />
            </div>
            <ScoreDisplay score={insights.totalGames} variant="verde" size="lg" />
            <div className="text-sm text-gray-600 mt-1">Jogos</div>
          </div>

          {/* Accuracy */}
          <div className="text-center">
            <div className="mx-auto mb-2">
              <ProgressRing 
                progress={insights.accuracy} 
                size="lg"
                strokeWidth={4}
                className="text-flu-grena"
              />
            </div>
            <div className="text-sm text-gray-600">Precisão</div>
          </div>

          {/* Average Time */}
          <div className="text-center">
            <div className="bg-flu-grena/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2">
              <Clock className="w-6 h-6 text-flu-grena" />
            </div>
            <ScoreDisplay 
              score={Math.round(insights.averageTime)} 
              variant="grena" 
              size="lg" 
              suffix="s"
            />
            <div className="text-sm text-gray-600 mt-1">Tempo Médio</div>
          </div>

          {/* Longest Streak */}
          <div className="text-center">
            <div className="bg-yellow-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2">
              <Award className="w-6 h-6 text-yellow-600" />
            </div>
            <ScoreDisplay score={insights.longestStreak} variant="success" size="lg" />
            <div className="text-sm text-gray-600 mt-1">Maior Sequência</div>
          </div>

          {/* Difficulty Level */}
          <div className="text-center">
            <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2">
              <Zap className="w-6 h-6 text-blue-600" />
            </div>
            <div className={`text-lg font-bold ${getDifficultyColor(insights.difficultyLevel)}`}>
              {insights.difficultyLevel}
            </div>
            <div className="text-sm text-gray-600 mt-1">Nível Atual</div>
          </div>

          {/* Weekly Progress */}
          <div className="text-center">
            <div className="mx-auto mb-2">
              <ProgressRing 
                progress={insights.weeklyProgress} 
                size="lg"
                strokeWidth={4}
                className="text-flu-verde"
              />
            </div>
            <div className="text-sm text-gray-600">Progresso Semanal</div>
          </div>
        </div>

        {/* Insights */}
        <div className="border-t pt-4">
          <h4 className="font-semibold text-flu-grena mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Dicas para Melhorar
          </h4>
          
          <div className="space-y-2 text-sm">
            {insights.accuracy < 75 && (
              <div className="flex items-center gap-2 text-gray-600">
                <Target className="w-4 h-4 text-flu-verde" />
                Pratique mais para aumentar sua precisão
              </div>
            )}
            
            {insights.averageTime > 15 && (
              <div className="flex items-center gap-2 text-gray-600">
                <Clock className="w-4 h-4 text-flu-grena" />
                Tente ser mais rápido nas respostas
              </div>
            )}
            
            {insights.longestStreak < 10 && (
              <div className="flex items-center gap-2 text-gray-600">
                <Award className="w-4 h-4 text-yellow-600" />
                Foque em manter sequências maiores de acertos
              </div>
            )}
            
            {insights.accuracy >= 85 && insights.averageTime <= 10 && (
              <div className="flex items-center gap-2 text-flu-verde font-medium">
                <Zap className="w-4 h-4" />
                Excelente desempenho! Você domina o jogo!
              </div>
            )}
          </div>
        </div>
      </FluCardContent>
    </FluCard>
  );
};