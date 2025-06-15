
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Activity, Users, TrendingUp } from "lucide-react";

interface MetricCard {
  title: string;
  value: string | number;
  trend?: 'up' | 'down' | 'stable';
  color: 'red' | 'yellow' | 'green' | 'blue';
}

export const ObservabilityDashboard = () => {
  const [metrics, setMetrics] = useState<MetricCard[]>([]);
  const [errors, setErrors] = useState<any[]>([]);

  useEffect(() => {
    // Simulate metrics collection
    const collectMetrics = () => {
      // Get performance metrics from localStorage or other storage
      const performanceData = JSON.parse(localStorage.getItem('app_metrics') || '{}');
      
      const currentMetrics: MetricCard[] = [
        {
          title: 'Error Rate',
          value: `${(Math.random() * 5).toFixed(1)}%`,
          trend: 'down',
          color: 'green'
        },
        {
          title: 'Avg Load Time',
          value: `${(Math.random() * 2 + 1).toFixed(1)}s`,
          trend: 'stable',
          color: 'blue'
        },
        {
          title: 'Active Sessions',
          value: Math.floor(Math.random() * 100 + 50),
          trend: 'up',
          color: 'green'
        },
        {
          title: 'Game Completion Rate',
          value: `${(Math.random() * 20 + 70).toFixed(1)}%`,
          trend: 'up',
          color: 'green'
        }
      ];

      setMetrics(currentMetrics);
    };

    // Simulate error collection
    const collectErrors = () => {
      const recentErrors = [
        {
          id: 1,
          message: 'Failed to load player image',
          severity: 'medium',
          count: 3,
          lastSeen: '2 min ago'
        },
        {
          id: 2,
          message: 'Network timeout',
          severity: 'low',
          count: 1,
          lastSeen: '5 min ago'
        }
      ];

      setErrors(recentErrors);
    };

    collectMetrics();
    collectErrors();

    // Update every 30 seconds
    const interval = setInterval(() => {
      collectMetrics();
      collectErrors();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const getColorClass = (color: string) => {
    switch (color) {
      case 'red': return 'border-red-200 bg-red-50';
      case 'yellow': return 'border-yellow-200 bg-yellow-50';
      case 'green': return 'border-green-200 bg-green-50';
      case 'blue': return 'border-blue-200 bg-blue-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  const getTrendIcon = (trend?: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'down':
        return <TrendingUp className="w-4 h-4 text-red-600 rotate-180" />;
      default:
        return <Activity className="w-4 h-4 text-gray-600" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
      case 'critical':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, index) => (
          <Card key={index} className={getColorClass(metric.color)}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{metric.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
                </div>
                <div className="flex items-center">
                  {getTrendIcon(metric.trend)}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Erros Recentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          {errors.length > 0 ? (
            <div className="space-y-3">
              {errors.map((error) => (
                <div key={error.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{error.message}</p>
                    <p className="text-sm text-gray-600">
                      {error.count} ocorrência{error.count > 1 ? 's' : ''} • {error.lastSeen}
                    </p>
                  </div>
                  <Badge className={getSeverityColor(error.severity)}>
                    {error.severity}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-gray-500">
              <Users className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              <p>Nenhum erro recente encontrado</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
