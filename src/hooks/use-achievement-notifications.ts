import { useState, useCallback } from 'react';
import { Achievement } from '@/types/achievements';

interface UseAchievementNotificationsReturn {
  currentNotification: Achievement | null;
  queueNotification: (achievement: Achievement) => void;
  dismissNotification: () => void;
  notificationQueue: Achievement[];
}

export const useAchievementNotifications = (): UseAchievementNotificationsReturn => {
  const [notificationQueue, setNotificationQueue] = useState<Achievement[]>([]);
  const [currentNotification, setCurrentNotification] = useState<Achievement | null>(null);

  const queueNotification = useCallback((achievement: Achievement) => {
    if (!currentNotification) {
      // If no notification is showing, show immediately
      setCurrentNotification(achievement);
    } else {
      // Otherwise, add to queue
      setNotificationQueue(prev => [...prev, achievement]);
    }
  }, [currentNotification]);

  const dismissNotification = useCallback(() => {
    setCurrentNotification(null);
    
    // Show next notification from queue if available
    setNotificationQueue(prev => {
      if (prev.length > 0) {
        const [next, ...rest] = prev;
        // Use setTimeout to allow animation to complete
        setTimeout(() => {
          setCurrentNotification(next);
        }, 300);
        return rest;
      }
      return prev;
    });
  }, []);

  return {
    currentNotification,
    queueNotification,
    dismissNotification,
    notificationQueue
  };
};
