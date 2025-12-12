import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { HeatmapCell } from "@/services/executiveAnalyticsService";
import { Calendar } from "lucide-react";
import { useMemo } from "react";

interface ActivityHeatmapProps {
  data: HeatmapCell[];
  isLoading: boolean;
}

export const ActivityHeatmap = ({ data, isLoading }: ActivityHeatmapProps) => {
  const { maxValue, cellsByDay } = useMemo(() => {
    const max = Math.max(...data.map(d => d.value), 1);
    
    // Agrupar por dia
    const byDay: Record<number, HeatmapCell[]> = {};
    for (let day = 0; day < 7; day++) {
      byDay[day] = data.filter(d => d.day === day).sort((a, b) => a.hour - b.hour);
    }
    
    return { maxValue: max, cellsByDay: byDay };
  }, [data]);

  const getIntensityColor = (value: number): string => {
    if (value === 0) return 'bg-muted';
    const intensity = value / maxValue;
    if (intensity < 0.25) return 'bg-primary/20';
    if (intensity < 0.5) return 'bg-primary/40';
    if (intensity < 0.75) return 'bg-primary/60';
    return 'bg-primary/90';
  };

  const dayLabels = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const hourLabels = ['00h', '03h', '06h', '09h', '12h', '15h', '18h', '21h'];

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Heatmap de Atividade</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-48 w-full" />
        </CardContent>
      </Card>
    );
  }

  // Encontrar picos de atividade
  const sortedCells = [...data].sort((a, b) => b.value - a.value);
  const peakHours = sortedCells.slice(0, 3).filter(c => c.value > 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-primary" />
          Heatmap de Atividade (Últimos 30 dias)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Grid do heatmap */}
          <div className="overflow-x-auto">
            <div className="min-w-[600px]">
              {/* Header com horas */}
              <div className="flex items-center mb-2">
                <div className="w-12" /> {/* Espaço para labels dos dias */}
                <div className="flex-1 flex justify-between text-xs text-muted-foreground">
                  {hourLabels.map(label => (
                    <span key={label} className="w-8 text-center">{label}</span>
                  ))}
                </div>
              </div>

              {/* Linhas do heatmap */}
              {dayLabels.map((dayLabel, dayIndex) => (
                <div key={dayLabel} className="flex items-center mb-1">
                  <div className="w-12 text-xs text-muted-foreground font-medium">
                    {dayLabel}
                  </div>
                  <div className="flex-1 flex gap-[2px]">
                    {(cellsByDay[dayIndex] || []).map((cell) => (
                      <div
                        key={`${cell.day}-${cell.hour}`}
                        className={`flex-1 h-6 rounded-sm transition-colors ${getIntensityColor(cell.value)}`}
                        title={`${cell.dayLabel} ${cell.hourLabel}: ${cell.value} eventos`}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Legenda */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>Menos</span>
              <div className="flex gap-1">
                <div className="w-4 h-4 rounded bg-muted" />
                <div className="w-4 h-4 rounded bg-primary/20" />
                <div className="w-4 h-4 rounded bg-primary/40" />
                <div className="w-4 h-4 rounded bg-primary/60" />
                <div className="w-4 h-4 rounded bg-primary/90" />
              </div>
              <span>Mais</span>
            </div>
            <div className="text-xs text-muted-foreground">
              Máximo: {maxValue} eventos/hora
            </div>
          </div>

          {/* Picos de atividade */}
          {peakHours.length > 0 && (
            <div className="pt-4 border-t">
              <h4 className="text-sm font-medium mb-2">Horários de Pico</h4>
              <div className="flex flex-wrap gap-2">
                {peakHours.map((peak, index) => (
                  <div
                    key={index}
                    className="px-3 py-1 bg-primary/10 rounded-full text-sm"
                  >
                    {peak.dayLabel} às {peak.hourLabel} ({peak.value} eventos)
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
