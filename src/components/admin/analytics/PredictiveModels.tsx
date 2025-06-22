
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, TrendingDown, Brain, Target, Users, Zap } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ScatterChart, Scatter } from "recharts";

interface ChurnPrediction {
  user_id: string;
  user_name: string;
  churn_probability: number;
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  days_since_last_activity: number;
  engagement_score: number;
  predicted_churn_date: string;
  key_risk_factors: string[];
  recommended_actions: string[];
}

interface EngagementPrediction {
  period: string;
  predicted_dau: number;
  predicted_retention: number;
  confidence_interval: {
    lower: number;
    upper: number;
  };
}

interface PredictiveModelsProps {
  churnPredictions: ChurnPrediction[];
  engagementPredictions: EngagementPrediction[];
  modelAccuracy: {
    churn_model: number;
    engagement_model: number;
    last_updated: string;
  };
  isLoading?: boolean;
}

export const PredictiveModels = ({ 
  churnPredictions, 
  engagementPredictions, 
  modelAccuracy,
  isLoading 
}: PredictiveModelsProps) => {
  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRiskIcon = (risk: string) => {
    switch (risk) {
      case 'critical': return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case 'high': return <TrendingDown className="w-4 h-4 text-orange-600" />;
      case 'medium': return <Target className="w-4 h-4 text-yellow-600" />;
      case 'low': return <Users className="w-4 h-4 text-green-600" />;
      default: return <Brain className="w-4 h-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <div className="animate-pulse h-6 bg-gray-200 rounded w-1/3" />
            </CardHeader>
            <CardContent>
              <div className="animate-pulse space-y-4">
                <div className="h-64 bg-gray-200 rounded" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const highRiskUsers = churnPredictions.filter(p => p.risk_level === 'high' || p.risk_level === 'critical');
  const avgChurnProb = churnPredictions.reduce((sum, p) => sum + p.churn_probability, 0) / churnPredictions.length;

  return (
    <div className="space-y-6">
      {/* Header com Accuracy dos Modelos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-flu-grena" />
            Modelos Preditivos - Machine Learning
          </CardTitle>
          <CardDescription>
            Previsões de churn e engagement baseadas em algoritmos de ML
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <Zap className="w-8 h-8 mx-auto mb-2 text-blue-600" />
              <div className="text-2xl font-bold text-blue-600">{modelAccuracy.churn_model}%</div>
              <p className="text-sm text-gray-600">Precisão Modelo Churn</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <Target className="w-8 h-8 mx-auto mb-2 text-green-600" />
              <div className="text-2xl font-bold text-green-600">{modelAccuracy.engagement_model}%</div>
              <p className="text-sm text-gray-600">Precisão Modelo Engagement</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <Brain className="w-8 h-8 mx-auto mb-2 text-gray-600" />
              <div className="text-sm font-medium text-gray-600">Última Atualização</div>
              <p className="text-xs text-gray-500">{new Date(modelAccuracy.last_updated).toLocaleDateString('pt-BR')}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Previsão de Churn */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              Previsão de Churn
            </CardTitle>
            <CardDescription>
              Usuários com maior risco de abandono
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="p-3 bg-red-50 rounded">
                  <div className="text-xl font-bold text-red-600">{highRiskUsers.length}</div>
                  <p className="text-sm text-gray-600">Alto Risco</p>
                </div>
                <div className="p-3 bg-orange-50 rounded">
                  <div className="text-xl font-bold text-orange-600">{avgChurnProb.toFixed(1)}%</div>
                  <p className="text-sm text-gray-600">Churn Médio</p>
                </div>
              </div>

              <div className="space-y-3 max-h-64 overflow-y-auto">
                {churnPredictions.slice(0, 10).map((prediction, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center gap-3">
                      {getRiskIcon(prediction.risk_level)}
                      <div>
                        <p className="font-medium text-sm">{prediction.user_name}</p>
                        <p className="text-xs text-gray-500">
                          {prediction.days_since_last_activity} dias inativo
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className={getRiskColor(prediction.risk_level)}>
                        {prediction.churn_probability.toFixed(0)}%
                      </Badge>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(prediction.predicted_churn_date).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Previsão de Engagement */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-blue-600" />
              Previsão de Engagement
            </CardTitle>
            <CardDescription>
              Projeções de usuários ativos e retenção
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={engagementPredictions}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="predicted_dau" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  name="DAU Previsto"
                />
                <Line 
                  type="monotone" 
                  dataKey="predicted_retention" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  name="Retenção Prevista (%)"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Ações Recomendadas */}
      <Card>
        <CardHeader>
          <CardTitle>Ações Recomendadas - AI Insights</CardTitle>
          <CardDescription>
            Recomendações automáticas baseadas nos modelos preditivos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {highRiskUsers.slice(0, 4).map((user, index) => (
              <div key={index} className="p-4 border rounded-lg bg-red-50">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                  <span className="font-medium text-red-800">{user.user_name}</span>
                  <Badge className="bg-red-100 text-red-800">
                    {user.churn_probability.toFixed(0)}% risco
                  </Badge>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div>
                    <strong>Fatores de Risco:</strong>
                    <ul className="list-disc list-inside text-red-700 mt-1">
                      {user.key_risk_factors.map((factor, i) => (
                        <li key={i}>{factor}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <strong>Ações Recomendadas:</strong>
                    <ul className="list-disc list-inside text-blue-700 mt-1">
                      {user.recommended_actions.map((action, i) => (
                        <li key={i}>{action}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
