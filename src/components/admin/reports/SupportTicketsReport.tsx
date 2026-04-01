
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  LifeBuoy, 
  Clock, 
  AlertCircle
} from "lucide-react";
import { useReports } from "@/hooks/use-reports";

interface SupportTicketsReportProps {
  days?: number;
}

export const SupportTicketsReport = ({ days = 30 }: SupportTicketsReportProps) => {
  const { supportTickets = [], isLoadingSupport: isLoading } = useReports(days);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Support Tickets</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-4 bg-muted rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const totals = supportTickets.reduce(
    (acc, day) => {
      acc.total += day.new_tickets;
      acc.resolved += day.resolved_tickets;
      acc.pending += day.pending_tickets;
      acc.priority.high += day.priority_breakdown.high;
      acc.priority.medium += day.priority_breakdown.medium;
      acc.priority.low += day.priority_breakdown.low;
      return acc;
    },
    {
      total: 0,
      resolved: 0,
      pending: 0,
      priority: { high: 0, medium: 0, low: 0 }
    }
  );

  const latestDay = supportTickets[supportTickets.length - 1];
  const avgResolutionTime = supportTickets.length > 0
    ? Math.round(supportTickets.reduce((sum, day) => sum + day.avg_resolution_time, 0) / supportTickets.length)
    : 0;
  const avgSatisfaction = supportTickets.length > 0
    ? (supportTickets.reduce((sum, day) => sum + day.satisfaction_score, 0) / supportTickets.length).toFixed(1)
    : "0.0";

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <LifeBuoy className="w-5 h-5" />
          Support Tickets
        </CardTitle>
        <CardDescription>
          Visão consolidada de tickets com base em dados reais do período
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Stats Summary */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 pb-4 border-b">
          <div className="text-center">
            <div className="text-2xl font-bold text-flu-grena">{totals.total}</div>
            <p className="text-xs text-muted-foreground">Total</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{totals.pending}</div>
            <p className="text-xs text-muted-foreground">Pendentes</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">{avgResolutionTime}h</div>
            <p className="text-xs text-muted-foreground">Resolução Média</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-flu-verde">{totals.resolved}</div>
            <p className="text-xs text-muted-foreground">Resolvidos</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-destructive">{avgSatisfaction}</div>
            <p className="text-xs text-muted-foreground">Satisfação (0-5)</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 border rounded-lg space-y-3">
            <h4 className="font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-orange-500" />
              Prioridade
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <Badge className="bg-orange-100 text-orange-800">Alta</Badge>
                <span className="font-semibold">{totals.priority.high}</span>
              </div>
              <div className="flex items-center justify-between">
                <Badge className="bg-yellow-100 text-yellow-800">Média</Badge>
                <span className="font-semibold">{totals.priority.medium}</span>
              </div>
              <div className="flex items-center justify-between">
                <Badge className="bg-flu-verde/20 text-flu-verde">Baixa</Badge>
                <span className="font-semibold">{totals.priority.low}</span>
              </div>
            </div>
          </div>

          <div className="p-4 border rounded-lg space-y-3">
            <h4 className="font-medium flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-500" />
              Status diário (último dia do período)
            </h4>
            {latestDay ? (
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span>Novo tickets</span>
                  <span className="font-semibold">{latestDay.new_tickets}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Resolvidos</span>
                  <span className="font-semibold text-flu-verde">{latestDay.resolved_tickets}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Pendentes</span>
                  <span className="font-semibold text-orange-600">{latestDay.pending_tickets}</span>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Sem dados para o período selecionado.</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
