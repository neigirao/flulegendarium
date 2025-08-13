import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Bell, X, Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface NotificationPermission {
  status: 'default' | 'granted' | 'denied';
  isSupported: boolean;
}

interface PushNotificationManagerProps {
  onPermissionChange?: (granted: boolean) => void;
}

export const PushNotificationManager: React.FC<PushNotificationManagerProps> = ({
  onPermissionChange
}) => {
  const [permission, setPermission] = useState<NotificationPermission>({
    status: 'default',
    isSupported: false
  });
  const [showPermissionDialog, setShowPermissionDialog] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    checkNotificationSupport();
    checkExistingSubscription();
  }, []);

  const checkNotificationSupport = () => {
    const isSupported = 'Notification' in window && 'serviceWorker' in navigator;
    
    setPermission({
      status: isSupported ? Notification.permission : 'denied',
      isSupported
    });

    console.log('🔔 Push Notifications: Suporte detectado -', isSupported);
  };

  const checkExistingSubscription = async () => {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        setIsSubscribed(!!subscription);
        console.log('📱 Push Notifications: Subscrição existente -', !!subscription);
      } catch (error) {
        console.error('❌ Push Notifications: Erro ao verificar subscrição:', error);
      }
    }
  };

  const requestPermission = async () => {
    if (!permission.isSupported) {
      toast({
        title: "Não Suportado",
        description: "Seu navegador não suporta notificações push",
        variant: "destructive"
      });
      return false;
    }

    try {
      console.log('🔔 Push Notifications: Solicitando permissão...');
      const result = await Notification.requestPermission();
      
      setPermission(prev => ({ ...prev, status: result }));
      
      const granted = result === 'granted';
      onPermissionChange?.(granted);

      if (granted) {
        await subscribeToNotifications();
        toast({
          title: "Notificações Ativadas! 🎉",
          description: "Você receberá lembretes para jogar e novidades do Flu!",
        });
        
        // Enviar notificação de boas-vindas
        setTimeout(() => {
          sendWelcomeNotification();
        }, 2000);
      } else {
        toast({
          title: "Permissão Negada",
          description: "Você pode ativar nas configurações do navegador",
          variant: "destructive"
        });
      }

      setShowPermissionDialog(false);
      return granted;
    } catch (error) {
      console.error('❌ Push Notifications: Erro ao solicitar permissão:', error);
      toast({
        title: "Erro",
        description: "Erro ao solicitar permissão para notificações",
        variant: "destructive"
      });
      return false;
    }
  };

  const subscribeToNotifications = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      
      // VAPID key (você precisará gerar uma para produção)
      const vapidPublicKey = 'BEl62iUYgUivxIkv69yViEuiBIa40HI6LZr98aAXNSKKaCxiGDqY8VTwj0MePtlWjP7gJeYVjXDhvHjFqJ1Y9vI';
      
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: vapidPublicKey
      });

      setIsSubscribed(true);
      
      // Aqui você salvaria a subscription no seu backend
      console.log('📱 Push Notifications: Subscrição criada:', subscription);
      
      // Enviar para o backend (implementar depois)
      // await saveSubscriptionToBackend(subscription);
      
    } catch (error) {
      console.error('❌ Push Notifications: Erro ao se inscrever:', error);
    }
  };

  const sendWelcomeNotification = () => {
    if (permission.status === 'granted') {
      new Notification('Bem-vindo ao Lendas do Flu! 🏆', {
        body: 'Agora você receberá lembretes para testar seus conhecimentos tricolores!',
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: 'welcome',
        data: { url: window.location.origin }
      });
    }
  };

  const scheduleReminders = () => {
    // Agendar lembretes diários (implementar com service worker)
    const scheduleData = {
      type: 'daily_reminder',
      title: 'Hora do Quiz Tricolor! ⚽',
      body: 'Que tal testar seus conhecimentos sobre as lendas do Flu?',
      hour: 19, // 7 PM
      enabled: true
    };

    localStorage.setItem('notification_schedule', JSON.stringify(scheduleData));
    console.log('⏰ Push Notifications: Lembretes diários agendados');
  };

  const handleEnableNotifications = () => {
    if (permission.status === 'default') {
      setShowPermissionDialog(true);
    } else if (permission.status === 'denied') {
      toast({
        title: "Permissão Negada",
        description: "Para ativar, vá em Configurações > Notificações no seu navegador",
        variant: "destructive"
      });
    }
  };

  if (!permission.isSupported) {
    return null; // Não mostrar se não há suporte
  }

  return (
    <>
      {/* Botão de Ativação */}
      {permission.status !== 'granted' && (
        <Card className="mb-4 bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
          <CardContent className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <Bell className="w-6 h-6 text-primary" />
              <div>
                <h4 className="font-semibold">Ativar Notificações</h4>
                <p className="text-sm text-muted-foreground">
                  Receba lembretes para jogar e não perca novidades!
                </p>
              </div>
            </div>
            <Button 
              onClick={handleEnableNotifications}
              className="bg-gradient-to-r from-primary to-secondary"
            >
              Ativar
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Status Indicator */}
      {permission.status === 'granted' && (
        <div className="flex items-center gap-2 text-sm text-green-600 mb-4">
          <Bell className="w-4 h-4" />
          Notificações ativadas
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setShowPermissionDialog(true)}
          >
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Permission Dialog */}
      <Dialog open={showPermissionDialog} onOpenChange={setShowPermissionDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <Bell className="w-6 h-6 text-primary" />
              Notificações Push
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="bg-muted/50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">O que você receberá:</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  🎯 <span>Lembretes diários para jogar</span>
                </li>
                <li className="flex items-center gap-2">
                  🏆 <span>Desafios especiais e conquistas</span>
                </li>
                <li className="flex items-center gap-2">
                  ⚽ <span>Novidades sobre o Fluminense</span>
                </li>
                <li className="flex items-center gap-2">
                  📊 <span>Seu progresso e estatísticas</span>
                </li>
              </ul>
            </div>

            <div className="flex gap-2">
              <Button 
                onClick={requestPermission}
                className="flex-1 bg-gradient-to-r from-primary to-secondary"
              >
                <Bell className="w-4 h-4 mr-2" />
                Permitir Notificações
              </Button>
              
              <Button 
                variant="outline" 
                onClick={() => setShowPermissionDialog(false)}
                className="flex-1"
              >
                Agora Não
              </Button>
            </div>

            <p className="text-xs text-muted-foreground text-center">
              Você pode desativar a qualquer momento nas configurações
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};