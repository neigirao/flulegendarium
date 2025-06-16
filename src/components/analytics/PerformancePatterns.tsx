
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PerformancePattern } from "@/services/advancedAnalyticsService";
import { Clock, Calendar, Target, TrendingUp } from "lucide-react";

interface PerformancePatternsProps {
  patterns?: PerformancePattern;
  isLoading?: boolean;
}

export const PerformancePatterns = ({ patterns, isLoading }: PerformancePatternsProps) => {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Padrões de Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse bg-gray-200 h-20 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!patterns) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Padrões de Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-gray-500 py-8">
            <Target className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>Dados insuficientes para análise de padrões</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const formatHour = (hour: number) => {
    return `${hour.toString().padStart(2, '0')}:00`;
  };

  const getDayName = (day: string) => {
    const dayNames: Record<string, string> = {
      'Monday': 'Segunda-feira',
      'Tuesday': 'Terça-feira',
      'Wednesday': 'Quarta-feira',
      'Thursday': 'Quinta-feira',
      'Friday': 'Sexta-feira',
      'Saturday': 'Sábado',
      'Sunday': 'Domingo'
    };
    return dayNames[day] || day;
  };

  const getConsistencyColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getLearningRateColor = (rate: number) => {
    if (rate >= 20) return 'text-green-600';
    if (rate >= 10) return 'text-blue-600';
    if (rate >= 0) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="w-5 h-5 text-flu-grena" />
          Seus Padrões de Performance
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Melhor Horário */}
          <div className="p-4 border rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-5 h-5 text-blue-600" />
              <h4 className="font-semibold">Melhor Horário</h4>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-1">
                {formatHour(patterns.best_hour)}
              </div>
              <p className="text-sm text-muted-foreground">
                Horário de pico de performance
              </p>
              <Badge variant="secondary" className="mt-2">
                Peak Time
              </Badge>
            </div>
          </div>

          {/* Melhor Dia */}
          <div className="p-4 border rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="w-5 h-5 text-purple-600" />
              <h4 className="font-semibold">Melhor Dia</h4>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-purple-600 mb-1">
                {getDayName(patterns.best_day)}
              </div>
              <p className="text-sm text-muted-foreground">
                Dia com melhores resultados
              </p>
              <Badge variant="secondary" className="mt-2">
                Peak Day
              </Badge>
            </div>
          </div>

          {/* Consistência */}
          <div className="p-4 border rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <Target className="w-5 h-5 text-orange-600" />
              <h4 className="font-semibold">Consistência</h4>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600 mb-1">
                {patterns.consistency_score}%
              </div>
              <p className="text-sm text-muted-foreground">
                Estabilidade de performance
              </p>
              <Badge className={getConsistencyColor(patterns.consistency_score)}>
                {patterns.consistency_score >= 80 ? 'Excelente' : 
                 patterns.consistency_score >= 60 ? 'Boa' : 'Variável'}
              </Badge>
            </div>
          </div>

          {/* Taxa de Aprendizado */}
          <div className="p-4 border rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-5 h-5 text-green-600" />
              <h4 className="font-semibold">Evolução</h4>
            </div>
            <div className="text-center">
              <div className={`text-3xl font-bold mb-1 ${getLearningRateColor(patterns.learning_rate)}`}>
                +{patterns.learning_rate}%
              </div>
              <p className="text-sm text-muted-foreground">
                Taxa de melhoria
              </p>
              <Badge variant="secondary" className="mt-2">
                {patterns.learning_rate >= 20 ? 'Rápida' :
                 patterns.learning_rate >= 10 ? 'Moderada' :
                 patterns.learning_rate >= 0 ? 'Lenta' : 'Estável'}
              </Badge>
            </div>
          </div>
        </div>

        {/* Recomendações */}
        <div className="mt-6 p-4 bg-flu-verde/5 rounded-lg border border-flu-verde/20">
          <h4 className="font-semibold text-flu-grena mb-2">💡 Recomendações Personalizadas:</h4>
          <ul className="text-sm text-gray-700 space-y-1">
            <li>• Jogue preferencialmente às {formatHour(patterns.best_hour)} para melhor performance</li>
            <li>• {getDayName(patterns.best_day)} é seu dia mais produtivo - aproveite!</li>
            {patterns.consistency_score < 70 && (
              <li>• Trabalhe na consistência mantendo uma rotina regular de jogos</li>
            )}
            {patterns.learning_rate > 15 && (
              <li>• Você está evoluindo rapidamente! Continue o ritmo atual</li>
            )}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
