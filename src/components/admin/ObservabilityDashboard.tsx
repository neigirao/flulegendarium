
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, CheckCircle, XCircle, TrendingUp, Activity } from 'lucide-react';
import { performanceBudgetMonitor } from '@/services/performance-budgets';

export const ObservabilityDashboard = () => {
  const [budgetStatus, setBudgetStatus] = useState<any[]>([]);
  const [violationSummary, setViolationSummary] = useState<string>('');

  useEffect(() => {
    const updateStatus = () => {
      setBudgetStatus(performanceBudgetMonitor.getBudgetStatus());
      setViolationSummary(performanceBudgetMonitor.getViolationSummary());
    };

    updateStatus();
    const interval = setInterval(updateStatus, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ok':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ok':
        return 'bg-green-100 text-green-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-flu-grena">Observabilidade</h2>
          <p className="text-gray-600">Monitoramento de performance e erros em tempo real</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <TrendingUp className="w-4 h-4 mr-2" />
            Ver Relatórios
          </Button>
        </div>
      </div>

      {/* Performance Budgets Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-flu-grena" />
            Performance Budgets
          </CardTitle>
          <CardDescription>
            Status dos orçamentos de performance. {violationSummary}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {budgetStatus.map((budget) => (
              <div
                key={budget.metric}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex items-center gap-2">
                  {getStatusIcon(budget.status)}
                  <span className="font-medium text-sm">{budget.metric}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={getStatusColor(budget.status)} variant="secondary">
                    {budget.status.toUpperCase()}
                  </Badge>
                  {budget.violations > 0 && (
                    <span className="text-xs text-gray-500">
                      {budget.violations} violações
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Real-time Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Core Web Vitals</CardTitle>
            <CardDescription>Métricas essenciais de performance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">LCP (Largest Contentful Paint)</span>
                <Badge variant="outline">Monitorado</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">FID (First Input Delay)</span>
                <Badge variant="outline">Monitorado</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">CLS (Cumulative Layout Shift)</span>
                <Badge variant="outline">Monitorado</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Error Tracking</CardTitle>
            <CardDescription>Monitoramento via Sentry</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">JavaScript Errors</span>
                <Badge className="bg-green-100 text-green-800">Ativo</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Network Errors</span>
                <Badge className="bg-green-100 text-green-800">Ativo</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Game Errors</span>
                <Badge className="bg-green-100 text-green-800">Ativo</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">UX Metrics</CardTitle>
            <CardDescription>Métricas de experiência do usuário</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Session Engagement</span>
                <Badge className="bg-blue-100 text-blue-800">Rastreado</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Game Response Time</span>
                <Badge className="bg-blue-100 text-blue-800">Rastreado</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Completion Rate</span>
                <Badge className="bg-blue-100 text-blue-800">Rastreado</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Configuration Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Configuração do Sentry</CardTitle>
          <CardDescription>
            Para ativar o error tracking completo, configure sua DSN do Sentry
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-50 p-4 rounded-lg">
            <code className="text-sm">
              VITE_SENTRY_DSN=your_sentry_dsn_here
            </code>
            <p className="text-sm text-gray-600 mt-2">
              Adicione esta variável de ambiente para ativar o Sentry em produção.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
