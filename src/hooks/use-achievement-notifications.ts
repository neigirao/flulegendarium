import { useState, useCallback, useEffect, useRef } from 'react';
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
  const currentRef = useRef<Achievement | null>(null);
  const queueRef = useRef<Achievement[]>([]);
  const pendingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (pendingTimer.current) clearTimeout(pendingTimer.current);
  }, []);

  const queueNotification = useCallback((achievement: Achievement) => {
    // Refs make multiple calls in the same React batch observe the current item.
    if (!currentRef.current && !pendingTimer.current) {
      currentRef.current = achievement;
      setCurrentNotification(achievement);
    } else {
      queueRef.current = [...queueRef.current, achievement];
      setNotificationQueue(queueRef.current);
    }
  }, []);

  const dismissNotification = useCallback(() => {
    if (!currentRef.current) return;
    currentRef.current = null;
    setCurrentNotification(null);

    const [next, ...rest] = queueRef.current;
    if (!next) return;
    queueRef.current = rest;
    setNotificationQueue(rest);
    // Prevent a new notification overtaking the queued item during animation.
    pendingTimer.current = setTimeout(() => {
      pendingTimer.current = null;
      currentRef.current = next;
      setCurrentNotification(next);
    }, 300);
  }, []);

  return { currentNotification, queueNotification, dismissNotification, notificationQueue };
};
