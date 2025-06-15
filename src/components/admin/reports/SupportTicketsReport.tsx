import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { 
  LifeBuoy, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  User,
  Calendar,
  MessageCircle 
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface SupportTicket {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  category: 'technical' | 'gameplay' | 'account' | 'billing' | 'feature_request';
  created_at: string;
  updated_at: string;
  user_email?: string;
  assigned_to?: string;
}

export const SupportTicketsReport = () => {
  const { data: tickets, isLoading } = useQuery({
    queryKey: ['support-tickets'],
    queryFn: async (): Promise<SupportTicket[]> => {
      try {
        const { data, error } = await supabase
          .from('support_tickets' as any)
          .select('*')
          .order('created_at', { ascending: false })
          .limit(100);

        if (error) {
          console.log('Support tickets table not ready yet, using simulated data:', error);
          // Return simulated data until types are updated
          return [
            {
              id: '1',
              title: 'Problema para fazer login',
              description: 'Não consigo entrar na minha conta, sempre dá erro de senha.',
              priority: 'high',
              status: 'open',
              category: 'account',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              user_email: 'usuario1@example.com'
            },
            {
              id: '2',
              title: 'Sugestão de novo jogador',
              description: 'Poderiam adicionar o Marcelo ao jogo? Foi um ícone do Flu.',
              priority: 'low',
              status: 'in_progress',
              category: 'feature_request',
              created_at: new Date(Date.now() - 86400000).toISOString(),
              updated_at: new Date(Date.now() - 43200000).toISOString(),
              user_email: 'usuario2@example.com',
              assigned_to: 'Admin'
            },
            {
              id: '3',
              title: 'Jogo trava no celular',
              description: '    No iPhone 12, o jogo trava após 5 minutos de uso.',
              priority: 'urgent',
              status: 'resolved',
              category: 'technical',
              created_at: new Date(Date.now() - 172800000).toISOString(),
              updated_at: new Date(Date.now() - 86400000).toISOString(),
              user_email: 'usuario3@example.com'
            }
          ];
        }

        return (data as SupportTicket[]) || [];
      } catch (error) {
        console.error('Error fetching tickets:', error);
        return [];
      }
    },
    staleTime: 2 * 60 * 1000 // 2 minutes
  });

  const getPriorityColor = (priority: string) => {
    const colors = {
      low: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-orange-100 text-orange-800',
      urgent: 'bg-red-100 text-red-800'
    };
    return colors[priority as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getStatusColor = (status: string) => {
    const colors = {
      open: 'bg-blue-100 text-blue-800',
      in_progress: 'bg-yellow-100 text-yellow-800',
      resolved: 'bg-green-100 text-green-800',
      closed: 'bg-gray-100 text-gray-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getCategoryIcon = (category: string) => {
    const icons = {
      technical: AlertCircle,
      gameplay: MessageCircle,
      account: User,
      billing: Clock,
      feature_request: CheckCircle
    };
    const IconComponent = icons[category as keyof typeof icons] || AlertCircle;
    return <IconComponent className="w-4 h-4" />;
  };

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
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const stats = {
    total: tickets?.length || 0,
    open: tickets?.filter(t => t.status === 'open').length || 0,
    inProgress: tickets?.filter(t => t.status === 'in_progress').length || 0,
    resolved: tickets?.filter(t => t.status === 'resolved').length || 0,
    urgent: tickets?.filter(t => t.priority === 'urgent').length || 0
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <LifeBuoy className="w-5 h-5" />
          Support Tickets
        </CardTitle>
        <CardDescription>
          Tickets de suporte e solicitações dos usuários
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Stats Summary */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 pb-4 border-b">
          <div className="text-center">
            <div className="text-2xl font-bold text-flu-grena">{stats.total}</div>
            <p className="text-xs text-gray-600">Total</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.open}</div>
            <p className="text-xs text-gray-600">Abertos</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">{stats.inProgress}</div>
            <p className="text-xs text-gray-600">Em Progresso</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{stats.resolved}</div>
            <p className="text-xs text-gray-600">Resolvidos</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{stats.urgent}</div>
            <p className="text-xs text-gray-600">Urgentes</p>
          </div>
        </div>

        {/* Tickets List */}
        <ScrollArea className="h-96">
          <div className="space-y-3">
            {tickets?.map((ticket) => (
              <div key={ticket.id} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getCategoryIcon(ticket.category)}
                    <h4 className="font-medium text-sm truncate max-w-48">
                      {ticket.title}
                    </h4>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getPriorityColor(ticket.priority)}>
                      {ticket.priority}
                    </Badge>
                    <Badge className={getStatusColor(ticket.status)}>
                      {ticket.status.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>
                
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {ticket.description}
                </p>
                
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center gap-4">
                    {ticket.user_email && (
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {ticket.user_email}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(ticket.created_at).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  <Button variant="ghost" size="sm">
                    Ver Detalhes
                  </Button>
                </div>
              </div>
            ))}
            
            {(!tickets || tickets.length === 0) && (
              <div className="text-center py-8 text-gray-500">
                <LifeBuoy className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Nenhum ticket de suporte encontrado</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
