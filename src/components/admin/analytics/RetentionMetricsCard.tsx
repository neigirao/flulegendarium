import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { RefreshCw, Users, Repeat, UserCheck } from "lucide-react";

interface RetentionMetricsCardProps {
  playAgainRate: number;
  averageSessionsPerUser: number;
  returningUsers: number;
  isLoading: boolean;
}

export const RetentionMetricsCard = ({
  playAgainRate,
  averageSessionsPerUser,
  returningUsers,
  isLoading
}: RetentionMetricsCardProps) => {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Métricas de Retenção</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <Skeleton className="h-20" />
            <Skeleton className="h-20" />
            <Skeleton className="h-20" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const metrics = [
    {
      icon: RefreshCw,
      label: 'Jogar Novamente',
      value: `${playAgainRate}%`,
      description: 'Jogadores que reiniciam',
      color: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-950/30'
    },
    {
      icon: Repeat,
      label: 'Sessões/Usuário',
      value: averageSessionsPerUser.toFixed(1),
      description: 'Média por jogador',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-950/30'
    },
    {
      icon: UserCheck,
      label: 'Retornaram',
      value: returningUsers.toLocaleString('pt-BR'),
      description: 'Usuários recorrentes',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-950/30'
    }
  ];

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Users className="w-5 h-5 text-primary" />
          Métricas de Retenção
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-3">
          {metrics.map((metric) => (
            <div 
              key={metric.label}
              className={`p-3 rounded-lg ${metric.bgColor}`}
            >
              <div className="flex items-center gap-2 mb-1">
                <metric.icon className={`w-4 h-4 ${metric.color}`} />
                <span className="text-xs font-medium text-muted-foreground">
                  {metric.label}
                </span>
              </div>
              <p className={`text-xl font-bold ${metric.color} tabular-nums`}>
                {metric.value}
              </p>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                {metric.description}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
