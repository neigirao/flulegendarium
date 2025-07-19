import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Bell, Plus, Edit, Trash2, Send } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface NotificationForm {
  title: string;
  message: string;
  type: 'achievement' | 'challenge' | 'social' | 'system' | 'announcement';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  target_audience: 'all' | 'registered' | 'guests' | 'top_players';
  expires_at?: string;
}

export const NotificationManagement = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<NotificationForm>({
    title: '',
    message: '',
    type: 'announcement',
    priority: 'normal',
    target_audience: 'all',
  });

  const queryClient = useQueryClient();

  // Buscar todas as notificações (admin)
  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['admin-notifications-management'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('admin_notifications')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  // Criar notificação
  const createNotificationMutation = useMutation({
    mutationFn: async (notificationData: NotificationForm) => {
      const { error } = await supabase
        .from('admin_notifications')
        .insert({
          ...notificationData,
          expires_at: notificationData.expires_at || null,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-notifications-management'] });
      queryClient.invalidateQueries({ queryKey: ['admin-notifications'] });
      setShowForm(false);
      setForm({
        title: '',
        message: '',
        type: 'announcement',
        priority: 'normal',
        target_audience: 'all',
      });
      toast.success('Notificação criada com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao criar notificação: ' + error.message);
    },
  });

  // Atualizar notificação
  const updateNotificationMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<NotificationForm> }) => {
      const { error } = await supabase
        .from('admin_notifications')
        .update(data)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-notifications-management'] });
      queryClient.invalidateQueries({ queryKey: ['admin-notifications'] });
      setEditingId(null);
      toast.success('Notificação atualizada com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao atualizar notificação: ' + error.message);
    },
  });

  // Excluir notificação
  const deleteNotificationMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('admin_notifications')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-notifications-management'] });
      queryClient.invalidateQueries({ queryKey: ['admin-notifications'] });
      toast.success('Notificação excluída com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao excluir notificação: ' + error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateNotificationMutation.mutate({ id: editingId, data: form });
    } else {
      createNotificationMutation.mutate(form);
    }
  };

  const handleEdit = (notification: any) => {
    setForm({
      title: notification.title,
      message: notification.message,
      type: notification.type,
      priority: notification.priority,
      target_audience: notification.target_audience,
      expires_at: notification.expires_at || '',
    });
    setEditingId(notification.id);
    setShowForm(true);
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'achievement': return 'bg-yellow-100 text-yellow-800';
      case 'challenge': return 'bg-flu-verde/10 text-flu-verde';
      case 'social': return 'bg-flu-grena/10 text-flu-grena';
      case 'system': return 'bg-blue-100 text-blue-800';
      case 'announcement': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'normal': return 'bg-blue-100 text-blue-800';
      case 'low': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Bell className="w-6 h-6 text-flu-grena" />
          <h2 className="text-2xl font-bold text-flu-grena">Gerenciar Notificações</h2>
        </div>
        <Button 
          onClick={() => {
            setShowForm(!showForm);
            setEditingId(null);
            setForm({
              title: '',
              message: '',
              type: 'announcement',
              priority: 'normal',
              target_audience: 'all',
            });
          }}
          className="bg-flu-verde hover:bg-flu-verde/90"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nova Notificação
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingId ? 'Editar Notificação' : 'Nova Notificação'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Título</label>
                  <Input
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="Título da notificação"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Tipo</label>
                  <Select value={form.type} onValueChange={(value: any) => setForm({ ...form, type: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="announcement">Anúncio</SelectItem>
                      <SelectItem value="achievement">Conquista</SelectItem>
                      <SelectItem value="challenge">Desafio</SelectItem>
                      <SelectItem value="social">Social</SelectItem>
                      <SelectItem value="system">Sistema</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Mensagem</label>
                <Textarea
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder="Conteúdo da notificação"
                  rows={3}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Prioridade</label>
                  <Select value={form.priority} onValueChange={(value: any) => setForm({ ...form, priority: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Baixa</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="high">Alta</SelectItem>
                      <SelectItem value="urgent">Urgente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Público Alvo</label>
                  <Select value={form.target_audience} onValueChange={(value: any) => setForm({ ...form, target_audience: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="registered">Usuários Registrados</SelectItem>
                      <SelectItem value="guests">Convidados</SelectItem>
                      <SelectItem value="top_players">Top Players</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Expira em (opcional)</label>
                  <Input
                    type="datetime-local"
                    value={form.expires_at}
                    onChange={(e) => setForm({ ...form, expires_at: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button 
                  type="submit" 
                  disabled={createNotificationMutation.isPending || updateNotificationMutation.isPending}
                  className="bg-flu-grena hover:bg-flu-grena/90"
                >
                  <Send className="w-4 h-4 mr-2" />
                  {editingId ? 'Atualizar' : 'Criar'} Notificação
                </Button>
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => setShowForm(false)}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Notificações Existentes</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-20 bg-gray-200 rounded animate-pulse"></div>
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Nenhuma notificação criada ainda.</p>
          ) : (
            <div className="space-y-4">
              {notifications.map((notification) => (
                <div key={notification.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold">{notification.title}</h4>
                        <Badge className={getTypeColor(notification.type)}>
                          {notification.type}
                        </Badge>
                        <Badge className={getPriorityColor(notification.priority)}>
                          {notification.priority}
                        </Badge>
                        {!notification.is_active && (
                          <Badge variant="secondary">Inativo</Badge>
                        )}
                      </div>
                      <p className="text-gray-600 mb-2">{notification.message}</p>
                      <div className="text-sm text-gray-500">
                        Público: {notification.target_audience} • 
                        Criado em: {new Date(notification.created_at).toLocaleDateString()}
                        {notification.expires_at && (
                          <> • Expira em: {new Date(notification.expires_at).toLocaleDateString()}</>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(notification)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => deleteNotificationMutation.mutate(notification.id)}
                        disabled={deleteNotificationMutation.isPending}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};