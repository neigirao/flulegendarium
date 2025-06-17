
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Loader2, Users, Clock, Target, TrendingUp } from "lucide-react";

interface UserBehavioralData {
  user_id: string;
  session_id: string;
  metrics_data: any;
  created_at: string;
}

export const EnhancedUserDataDashboard = () => {
  const { user } = useAuth();

  const { data: behavioralData, isLoading } = useQuery({
    queryKey: ['user-behavioral-data', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('user_behavioral_metrics')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      return data as UserBehavioralData[];
    },
    enabled: !!user
  });

  const { data: profiles } = useQuery({
    queryKey: ['user-behavioral-profiles', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('user_behavioral_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
    enabled: !!user
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">Faça login para ver seus dados comportamentais</p>
        </CardContent>
      </Card>
    );
  }

  const latestSession = behavioralData?.[0];
  const recognitionData = latestSession?.metrics_data?.player_recognition_patterns;
  const engagementData = latestSession?.metrics_data?.engagement_signals;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Session Overview */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sessões Ativas</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{behavioralData?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              Total de sessões registradas
            </p>
          </CardContent>
        </Card>

        {/* Average Session Time */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tempo Médio</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {profiles?.average_session_duration ? 
                Math.round(profiles.average_session_duration / 60000) : 0}min
            </div>
            <p className="text-xs text-muted-foreground">
              Por sessão de jogo
            </p>
          </CardContent>
        </Card>

        {/* Recognition Accuracy */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Acerto</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {profiles?.game_completion_rate ? 
                Math.round(profiles.game_completion_rate * 100) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              Precisão geral
            </p>
          </CardContent>
        </Card>

        {/* Engagement Level */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Engajamento</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <Badge variant={
                profiles?.engagement_level === 'very_high' ? 'default' :
                profiles?.engagement_level === 'high' ? 'secondary' :
                profiles?.engagement_level === 'medium' ? 'outline' : 'destructive'
              }>
                {profiles?.engagement_level || 'N/A'}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Nível atual
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recognition Patterns */}
      {recognitionData && (
        <Card>
          <CardHeader>
            <CardTitle>Padrões de Reconhecimento</CardTitle>
            <CardDescription>
              Análise do seu desempenho por categoria de jogador
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Reconhecimentos Rápidos (&lt;5s)</span>
                <span className="font-medium">{recognitionData.quick_recognitions?.length || 0}</span>
              </div>
              <Progress 
                value={(recognitionData.quick_recognitions?.length || 0) * 10} 
                className="h-2" 
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Reconhecimentos Lentos (&gt;30s)</span>
                <span className="font-medium">{recognitionData.slow_recognitions?.length || 0}</span>
              </div>
              <Progress 
                value={(recognitionData.slow_recognitions?.length || 0) * 10} 
                className="h-2" 
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Reconhecimentos Falhados</span>
                <span className="font-medium">{recognitionData.failed_recognitions?.length || 0}</span>
              </div>
              <Progress 
                value={(recognitionData.failed_recognitions?.length || 0) * 10} 
                className="h-2" 
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Churn Risk Assessment */}
      {profiles?.churn_risk_score !== undefined && (
        <Card>
          <CardHeader>
            <CardTitle>Análise de Retenção</CardTitle>
            <CardDescription>
              Avaliação do risco de abandono baseado no comportamento
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Risco de Churn</span>
                <span className="font-medium">{Math.round(profiles.churn_risk_score)}%</span>
              </div>
              <Progress 
                value={profiles.churn_risk_score} 
                className={`h-3 ${
                  profiles.churn_risk_score > 70 ? 'bg-red-100' :
                  profiles.churn_risk_score > 40 ? 'bg-yellow-100' : 'bg-green-100'
                }`}
              />
              <p className="text-xs text-muted-foreground mt-2">
                {profiles.churn_risk_score > 70 ? 
                  '⚠️ Alto risco - Considere estratégias de reengajamento' :
                  profiles.churn_risk_score > 40 ?
                  '⚡ Risco moderado - Monitore padrões de uso' :
                  '✅ Baixo risco - Usuário engajado'
                }
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Preferred Play Times */}
      {profiles?.preferred_play_times && (
        <Card>
          <CardHeader>
            <CardTitle>Horários Preferenciais</CardTitle>
            <CardDescription>
              Quando você mais gosta de jogar
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {profiles.preferred_play_times.map((time: string, index: number) => (
                <Badge key={index} variant="outline">
                  {time}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
