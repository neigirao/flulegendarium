import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserSegmentationCard } from "./UserSegmentationCard";
import { OperationalDashboard } from "./OperationalDashboard";
import { ExecutiveAnalyticsDashboard } from "../analytics/ExecutiveAnalyticsDashboard";
import { PeriodSelector } from "../shared/PeriodSelector";
import { useReportPeriod } from "@/hooks/use-report-period";
import { useAdminAnalytics } from "@/hooks/analytics";
import { 
  Users, 
  Activity, 
  TrendingUp,
  Target,
  Zap,
  Brain,
  LineChart
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const BusinessIntelligenceDashboard = () => {
  const { period, setPeriod } = useReportPeriod();
  const {
    userSegments,
    operationalMetrics,
    businessMetrics,
    isLoadingSegments,
    isLoadingOperational,
    isLoadingBusiness
  } = useAdminAnalytics(period);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-primary mb-2">Business Intelligence</h2>
          <p className="text-muted-foreground">
            Analytics avançados, segmentação de usuários e métricas operacionais em tempo real
          </p>
        </div>
        <PeriodSelector value={period} onChange={setPeriod} />
      </div>

      {/* Resumo Executivo */}
      {businessMetrics && !isLoadingBusiness && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-primary" />
              Resumo Executivo ({period} dias)
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
                <p className="text-xs text-muted-foreground">Usuários no Período</p>
              </div>
              
              <div className="text-center p-4">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Zap className="w-5 h-5 text-green-500" />
                  <span className="text-sm font-medium text-muted-foreground">Engagement</span>
                </div>
                <p className="text-2xl font-bold text-green-600">{businessMetrics.engagement_score}%</p>
                <p className="text-xs text-muted-foreground">DAU/Período</p>
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
                <p className="text-xs text-muted-foreground">Taxa do período</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="executive" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 max-w-3xl">
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

      </Tabs>
    </div>
  );
};
