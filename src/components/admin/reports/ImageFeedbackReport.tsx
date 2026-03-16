import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { CheckCircle, AlertTriangle, Clock, RefreshCw } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export const ImageFeedbackReport = () => {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<'all' | 'pending' | 'resolved'>('pending');

  const { data: reports, isLoading } = useQuery({
    queryKey: ['image-feedback-reports', filter],
    queryFn: async () => {
      let query = supabase
        .from('image_error_reports')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (filter === 'pending') query = query.eq('resolved', false);
      if (filter === 'resolved') query = query.eq('resolved', true);

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const handleResolve = async (id: string) => {
    const { error } = await supabase
      .from('image_error_reports')
      .update({ resolved: true, resolved_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      toast({ title: 'Erro ao resolver', variant: 'destructive' });
    } else {
      toast({ title: '✅ Marcado como resolvido' });
      queryClient.invalidateQueries({ queryKey: ['image-feedback-reports'] });
    }
  };

  const userReports = reports?.filter(r => r.error_type === 'user_report') || [];
  const autoReports = reports?.filter(r => r.error_type !== 'user_report') || [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">Reports de Imagens</h3>
        <div className="flex gap-2">
          {(['pending', 'all', 'resolved'] as const).map(f => (
            <Button
              key={f}
              size="sm"
              variant={filter === f ? 'default' : 'outline'}
              onClick={() => setFilter(f)}
              className="text-xs"
            >
              {f === 'pending' ? 'Pendentes' : f === 'all' ? 'Todos' : 'Resolvidos'}
            </Button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center gap-2 text-muted-foreground py-8 justify-center">
          <RefreshCw className="w-4 h-4 animate-spin" />
          Carregando...
        </div>
      ) : (
        <>
          {/* User reports section */}
          {userReports.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                <AlertTriangle className="w-4 h-4 text-destructive" />
                Reports de Usuários ({userReports.length})
              </h4>
              <ReportTable reports={userReports} onResolve={handleResolve} />
            </div>
          )}

          {/* Auto reports section */}
          {autoReports.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                <Clock className="w-4 h-4" />
                Reports Automáticos ({autoReports.length})
              </h4>
              <ReportTable reports={autoReports} onResolve={handleResolve} />
            </div>
          )}

          {reports?.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <CheckCircle className="w-8 h-8 mx-auto mb-2 text-success" />
              <p>Nenhum report {filter === 'pending' ? 'pendente' : ''} encontrado.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

interface ReportTableProps {
  reports: Array<{
    id: string;
    player_name: string;
    original_url: string | null;
    error_type: string;
    created_at: string | null;
    resolved: boolean | null;
    retry_count: number | null;
  }>;
  onResolve: (id: string) => void;
}

const ReportTable = ({ reports, onResolve }: ReportTableProps) => (
  <div className="overflow-x-auto rounded-lg border border-border">
    <table className="w-full text-sm">
      <thead className="bg-muted/50">
        <tr>
          <th className="px-3 py-2 text-left font-medium">Nome</th>
          <th className="px-3 py-2 text-left font-medium">Tipo</th>
          <th className="px-3 py-2 text-left font-medium">URL</th>
          <th className="px-3 py-2 text-left font-medium">Data</th>
          <th className="px-3 py-2 text-left font-medium">Status</th>
          <th className="px-3 py-2 text-left font-medium">Ação</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-border">
        {reports.map(report => (
          <tr key={report.id} className="hover:bg-muted/30">
            <td className="px-3 py-2 font-medium">{report.player_name}</td>
            <td className="px-3 py-2">
              <span className={`px-1.5 py-0.5 rounded text-xs ${
                report.error_type === 'user_report'
                  ? 'bg-destructive/10 text-destructive'
                  : 'bg-muted text-muted-foreground'
              }`}>
                {report.error_type === 'user_report' ? 'Usuário' : report.error_type}
              </span>
            </td>
            <td className="px-3 py-2 max-w-[200px] truncate text-xs text-muted-foreground">
              {report.original_url || '—'}
            </td>
            <td className="px-3 py-2 text-xs text-muted-foreground">
              {report.created_at ? new Date(report.created_at).toLocaleDateString('pt-BR') : '—'}
            </td>
            <td className="px-3 py-2">
              {report.resolved ? (
                <span className="text-success text-xs">✅ Resolvido</span>
              ) : (
                <span className="text-destructive text-xs">⏳ Pendente</span>
              )}
            </td>
            <td className="px-3 py-2">
              {!report.resolved && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onResolve(report.id)}
                  className="text-xs h-7"
                >
                  Resolver
                </Button>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);
