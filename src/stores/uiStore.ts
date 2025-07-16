import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface UIStore {
  // Navigation
  currentRoute: string;
  
  // Modals & Dialogs
  activeModal: string | null;
  
  // Loading states
  loadingStates: Record<string, boolean>;
  
  // Mobile & Responsive
  isMobile: boolean;
  sidebarOpen: boolean;
  
  // Theme & Preferences
  theme: 'light' | 'dark' | 'system';
  reducedMotion: boolean;
  
  // Notifications
  notifications: Array<{
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    message: string;
    timestamp: number;
  }>;
  
  // Actions
  setCurrentRoute: (route: string) => void;
  openModal: (modalId: string) => void;
  closeModal: () => void;
  setLoading: (key: string, loading: boolean) => void;
  setMobile: (mobile: boolean) => void;
  toggleSidebar: () => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  setReducedMotion: (reduced: boolean) => void;
  addNotification: (notification: Omit<UIStore['notifications'][0], 'id' | 'timestamp'>) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
}

export const useUIStore = create<UIStore>()(
  devtools(
    (set, get) => ({
      currentRoute: '/',
      activeModal: null,
      loadingStates: {},
      isMobile: false,
      sidebarOpen: false,
      theme: 'system',
      reducedMotion: false,
      notifications: [],

      setCurrentRoute: (route: string) => {
        set({ currentRoute: route }, false, 'setCurrentRoute');
      },

      openModal: (modalId: string) => {
        set({ activeModal: modalId }, false, 'openModal');
      },

      closeModal: () => {
        set({ activeModal: null }, false, 'closeModal');
      },

      setLoading: (key: string, loading: boolean) => {
        set((state) => ({
          loadingStates: {
            ...state.loadingStates,
            [key]: loading
          }
        }), false, 'setLoading');
      },

      setMobile: (mobile: boolean) => {
        set({ isMobile: mobile }, false, 'setMobile');
      },

      toggleSidebar: () => {
        set((state) => ({ sidebarOpen: !state.sidebarOpen }), false, 'toggleSidebar');
      },

      setTheme: (theme: 'light' | 'dark' | 'system') => {
        set({ theme }, false, 'setTheme');
      },

      setReducedMotion: (reduced: boolean) => {
        set({ reducedMotion: reduced }, false, 'setReducedMotion');
      },

      addNotification: (notification) => {
        const newNotification = {
          ...notification,
          id: Math.random().toString(36).substr(2, 9),
          timestamp: Date.now()
        };
        
        set((state) => ({
          notifications: [...state.notifications, newNotification]
        }), false, 'addNotification');

        // Auto-remove after 5 seconds
        setTimeout(() => {
          get().removeNotification(newNotification.id);
        }, 5000);
      },

      removeNotification: (id: string) => {
        set((state) => ({
          notifications: state.notifications.filter(n => n.id !== id)
        }), false, 'removeNotification');
      },

      clearNotifications: () => {
        set({ notifications: [] }, false, 'clearNotifications');
      }
    }),
    { name: 'UIStore' }
  )
);