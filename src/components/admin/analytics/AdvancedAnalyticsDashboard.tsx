
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BusinessKPIs } from "./BusinessKPIs";
import { RFMAnalysis } from "./RFMAnalysis";
import { PredictiveModels } from "./PredictiveModels";
import { RealTimeMetrics } from "./RealTimeMetrics";
import { useAdvancedAnalytics } from "@/hooks/use-advanced-analytics";
import { 
  BarChart3, 
  Users, 
  Brain, 
  Activity,
  Target,
  TrendingUp,
  Zap
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const AdvancedAnalyticsDashboard = () => {
  const {
    businessKPIs,
    rfmSegments,
    churnPredictions,
    engagementPredictions,
    modelAccuracy,
    isLoading,
    isLoadingKPIs,
    isLoadingRFM,
    isLoadingChurn,
    isLoadingEngagement
  } = useAdvancedAnalytics();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-flu-grena mb-2">Analytics Avançados</h2>
        <p className="text-gray-600">
          KPIs de negócio, análise preditiva e métricas em tempo real
        </p>
      </div>

      {/* Resumo Executivo */}
      {!isLoading && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-flu-grena" />
              Resumo Executivo - Últimas 24h
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Target className="w-5 h-5 text-blue-500" />
                  <span className="text-sm font-medium text-gray-600">KPIs Saudáveis</span>
                </div>
                <p className="text-2xl font-bold text-blue-600">
                  {businessKPIs.filter(kpi => kpi.status === 'healthy').length}/{businessKPIs.length}
                </p>
                <p className="text-xs text-gray-500">Métricas no target</p>
              </div>
              
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Users className="w-5 h-5 text-green-500" />
                  <span className="text-sm font-medium text-gray-600">Segmentos RFM</span>
                </div>
                <p className="text-2xl font-bold text-green-600">{rfmSegments.length}</p>
                <p className="text-xs text-gray-500">Segmentos identificados</p>
              </div>
              
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Brain className="w-5 h-5 text-red-500" />
                  <span className="text-sm font-medium text-gray-600">Alto Risco Churn</span>
                </div>
                <p className="text-2xl font-bold text-red-600">
                  {churnPredictions.filter(p => p.risk_level === 'high' || p.risk_level === 'critical').length}
                </p>
                <p className="text-xs text-gray-500">Usuários em risco</p>
              </div>
              
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Zap className="w-5 h-5 text-purple-500" />
                  <span className="text-sm font-medium text-gray-600">Precisão ML</span>
                </div>
                <p className="text-2xl font-bold text-purple-600">{modelAccuracy.churn_model}%</p>
                <p className="text-xs text-gray-500">Modelo de churn</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="realtime" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 max-w-2xl">
          <TabsTrigger value="realtime" className="flex items-center gap-2">
            <Activity size={16} />
            Tempo Real
          </TabsTrigger>
          <TabsTrigger value="kpis" className="flex items-center gap-2">
            <Target size={16} />
            KPIs
          </TabsTrigger>
          <TabsTrigger value="segmentation" className="flex items-center gap-2">
            <Users size={16} />
            Segmentação
          </TabsTrigger>
          <TabsTrigger value="predictions" className="flex items-center gap-2">
            <Brain size={16} />
            Preditivos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="realtime" className="space-y-6">
          <RealTimeMetrics />
        </TabsContent>

        <TabsContent value="kpis" className="space-y-6">
          <BusinessKPIs 
            kpis={businessKPIs}
            isLoading={isLoadingKPIs}
          />
        </TabsContent>

        <TabsContent value="segmentation" className="space-y-6">
          <RFMAnalysis 
            segments={rfmSegments}
            isLoading={isLoadingRFM}
          />
        </TabsContent>

        <TabsContent value="predictions" className="space-y-6">
          <PredictiveModels 
            churnPredictions={churnPredictions}
            engagementPredictions={engagementPredictions}
            modelAccuracy={modelAccuracy}
            isLoading={isLoadingChurn || isLoadingEngagement}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};
