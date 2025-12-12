import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserSegmentationCard } from "./UserSegmentationCard";
import { CohortAnalysisCard } from "./CohortAnalysisCard";
import { OperationalDashboard } from "./OperationalDashboard";
import { ExecutiveAnalyticsDashboard } from "../analytics/ExecutiveAnalyticsDashboard";
import { useBusinessIntelligence } from "@/hooks/use-business-intelligence";
import { 
  Users, 
  Calendar, 
  Activity, 
  TrendingUp,
  BarChart3,
  Target,
  Zap,
  Brain,
  LineChart
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const BusinessIntelligenceDashboard = () => {
  const {
    userSegments,
    cohortAnalysis,
    operationalMetrics,
    businessMetrics,
    isLoading,
    isLoadingSegments,
    isLoadingCohorts,
    isLoadingOperational,
    isLoadingBusiness
  } = useBusinessIntelligence();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-primary mb-2">Business Intelligence</h2>
        <p className="text-muted-foreground">
          Analytics avançados, segmentação de usuários e métricas operacionais em tempo real
        </p>
      </div>

      {/* Resumo Executivo */}
      {businessMetrics && !isLoadingBusiness && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-primary" />
              Resumo Executivo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center p-4">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Users className="w-5 h-5 text-blue-500" />
                  <span className="text-sm font-medium text-muted-foreground">Base Ativa</span>
                </div>
                <p className="text-2xl font-bold text-blue-600">{businessMetrics.monthly_active_users}</p>
                <p className="text-xs text-muted-foreground">MAU</p>
              </div>
              
              <div className="text-center p-4">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Zap className="w-5 h-5 text-green-500" />
                  <span className="text-sm font-medium text-muted-foreground">Engagement</span>
                </div>
                <p className="text-2xl font-bold text-green-600">{businessMetrics.engagement_score}%</p>
                <p className="text-xs text-muted-foreground">DAU/MAU</p>
              </div>
              
              <div className="text-center p-4">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Target className="w-5 h-5 text-purple-500" />
                  <span className="text-sm font-medium text-muted-foreground">Retenção</span>
                </div>
                <p className="text-2xl font-bold text-purple-600">{businessMetrics.retention_rate}%</p>
                <p className="text-xs text-muted-foreground">Taxa geral</p>
              </div>
              
              <div className="text-center p-4">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <TrendingUp className="w-5 h-5 text-orange-500" />
                  <span className="text-sm font-medium text-muted-foreground">Churn</span>
                </div>
                <p className="text-2xl font-bold text-orange-600">{businessMetrics.churn_rate}%</p>
                <p className="text-xs text-muted-foreground">Taxa mensal</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="executive" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 max-w-3xl">
          <TabsTrigger value="executive" className="flex items-center gap-2">
            <LineChart size={16} />
            Executivo
          </TabsTrigger>
          <TabsTrigger value="operational" className="flex items-center gap-2">
            <Activity size={16} />
            Operacional
          </TabsTrigger>
          <TabsTrigger value="segments" className="flex items-center gap-2">
            <Users size={16} />
            Segmentos
          </TabsTrigger>
          <TabsTrigger value="cohorts" className="flex items-center gap-2">
            <Calendar size={16} />
            Coortes
          </TabsTrigger>
          <TabsTrigger value="advanced" className="flex items-center gap-2">
            <BarChart3 size={16} />
            Avançado
          </TabsTrigger>
        </TabsList>

        <TabsContent value="executive" className="space-y-6">
          <ExecutiveAnalyticsDashboard />
        </TabsContent>

        <TabsContent value="operational" className="space-y-6">
          <OperationalDashboard 
            metrics={operationalMetrics}
            businessMetrics={businessMetrics}
            isLoading={isLoadingOperational || isLoadingBusiness}
          />
        </TabsContent>

        <TabsContent value="segments" className="space-y-6">
          <UserSegmentationCard 
            segments={userSegments}
            isLoading={isLoadingSegments}
          />
        </TabsContent>

        <TabsContent value="cohorts" className="space-y-6">
          <CohortAnalysisCard 
            cohorts={cohortAnalysis}
            isLoading={isLoadingCohorts}
          />
        </TabsContent>

        <TabsContent value="advanced" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Analytics Preditivos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <Brain className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>Machine Learning em desenvolvimento</p>
                    <p className="text-sm">Previsão de churn e recomendações</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>A/B Testing</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>Framework de testes em desenvolvimento</p>
                    <p className="text-sm">Otimização contínua de features</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
