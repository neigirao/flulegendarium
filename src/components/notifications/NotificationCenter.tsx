import React, { useState } from 'react';
import { Bell, BellRing, Trophy, Star, Target, Users, X, Megaphone } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FluCard } from '@/components/ui/flu-card';
import { useAdminNotifications } from '@/hooks/use-admin-notifications';
import { AdminNotification } from '@/hooks/use-admin-notifications';

const getNotificationIcon = (type: AdminNotification['type']) => {
  switch (type) {
    case 'achievement':
      return <Trophy className="w-4 h-4 text-yellow-500" />;
    case 'challenge':
      return <Target className="w-4 h-4 text-flu-verde" />;
    case 'social':
      return <Star className="w-4 h-4 text-flu-grena" />;
    case 'system':
      return <Users className="w-4 h-4 text-blue-500" />;
    case 'announcement':
      return <Megaphone className="w-4 h-4 text-purple-500" />;
    default:
      return <Bell className="w-4 h-4 text-gray-500" />;
  }
};

const getTypeColor = (type: AdminNotification['type']) => {
  switch (type) {
    case 'achievement': return 'bg-yellow-100 text-yellow-800';
    case 'challenge': return 'bg-flu-verde/10 text-flu-verde';
    case 'social': return 'bg-flu-grena/10 text-flu-grena';
    case 'system': return 'bg-blue-100 text-blue-800';
    case 'announcement': return 'bg-purple-100 text-purple-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getPriorityColor = (priority: AdminNotification['priority']) => {
  switch (priority) {
    case 'urgent': return 'border-l-red-500 bg-red-50';
    case 'high': return 'border-l-orange-500 bg-orange-50';
    case 'normal': return 'border-l-flu-verde bg-flu-verde/5';
    case 'low': return 'border-l-gray-400 bg-gray-50';
    default: return 'border-l-flu-verde bg-flu-verde/5';
  }
};

export const NotificationCenter = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { 
    notifications, 
    isLoading, 
    unreadCount, 
    markAsRead, 
    markAllAsRead,
    isMarkingRead 
  } = useAdminNotifications();

  const formatTime = (timestamp: string) => {
    const now = new Date();
    const notificationTime = new Date(timestamp);
    const diff = now.getTime() - notificationTime.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) return `${minutes}m atrás`;
    if (hours < 24) return `${hours}h atrás`;
    return `${days}d atrás`;
  };

  if (isLoading) {
    return (
      <Button variant="ghost" size="sm" className="relative" disabled>
        <Bell className="w-5 h-5" />
      </Button>
    );
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          {unreadCount > 0 ? (
            <BellRing className="w-5 h-5" />
          ) : (
            <Bell className="w-5 h-5" />
          )}
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      
      <PopoverContent className="w-80 p-0" align="end">
        <FluCard className="border-0 shadow-lg">
          <div className="p-4 border-b">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-flu-grena">Notificações</h3>
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => markAllAsRead()}
                  disabled={isMarkingRead}
                  className="text-xs text-flu-verde hover:text-flu-verde/80"
                >
                  {isMarkingRead ? 'Marcando...' : 'Marcar todas como lidas'}
                </Button>
              )}
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Bell className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Nenhuma notificação</p>
              </div>
            ) : (
              <div className="divide-y">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${
                      !notification.is_read 
                        ? `${getPriorityColor(notification.priority as AdminNotification['priority'])} border-l-2` 
                        : ''
                    }`}
                    onClick={() => {
                      if (!notification.is_read) {
                        markAsRead(notification.id);
                      }
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-1">
                        {getNotificationIcon(notification.type as AdminNotification['type'])}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className={`text-sm font-medium truncate ${
                            !notification.is_read ? 'text-gray-900' : 'text-gray-600'
                          }`}>
                            {notification.title}
                          </p>
                          <div className="flex items-center gap-1">
                            <Badge 
                              variant="secondary" 
                              className={`text-xs ${getTypeColor(notification.type as AdminNotification['type'])}`}
                            >
                              {notification.type}
                            </Badge>
                          </div>
                        </div>
                        
                        <p className={`text-sm mb-2 ${
                          !notification.is_read ? 'text-gray-700' : 'text-gray-500'
                        }`}>
                          {notification.message}
                        </p>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">
                            {formatTime(notification.created_at)}
                          </span>
                          
                          {!notification.is_read && (
                            <span className="w-2 h-2 bg-flu-verde rounded-full"></span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </FluCard>
      </PopoverContent>
    </Popover>
  );
};