import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: Record<string, unknown>) => void;
          prompt: (callback?: (notification: {
            isNotDisplayed: () => boolean;
            isSkippedMoment: () => boolean;
            isDismissedMoment: () => boolean;
            getNotDisplayedReason: () => string;
            getSkippedReason: () => string;
            getDismissedReason: () => string;
          }) => void) => void;
          cancel: () => void;
        };
      };
    };
  }
}

export const useGoogleOneTap = () => {
  const { user } = useAuth();
  const initializedRef = useRef(false);
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  useEffect(() => {
    if (user || !clientId || initializedRef.current) return;

    const loadAndInit = () => {
      // Don't load if already present
      if (window.google?.accounts?.id) {
        initOneTap();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = initOneTap;
      document.head.appendChild(script);
    };

    const initOneTap = () => {
      if (!window.google?.accounts?.id || initializedRef.current) return;
      initializedRef.current = true;

      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: handleCredentialResponse,
        auto_select: false,
        context: 'signin',
        cancel_on_tap_outside: true,
        itp_support: true,
        use_fedcm_for_button: true,
      });

      window.google.accounts.id.prompt((notification: Record<string, unknown>) => {
        const momentType = typeof notification.getMomentType === 'function'
          ? (notification.getMomentType as () => string)()
          : undefined;

        if (momentType === 'display') {
          console.log('[OneTap] Prompt displayed');
        } else if (momentType === 'skipped') {
          console.log('[OneTap] Prompt skipped');
        } else if (momentType === 'dismissed') {
          console.log('[OneTap] Prompt dismissed');
        }
      });
    };

    const handleCredentialResponse = async (response: { credential: string }) => {
      try {
        const { error } = await supabase.auth.signInWithIdToken({
          provider: 'google',
          token: response.credential,
        });

        if (error) {
          console.error('[OneTap] Auth error:', error.message);
        } else {
          console.log('[OneTap] Login successful');
        }
      } catch (err) {
        console.error('[OneTap] Unexpected error:', err);
      }
    };

    // Defer loading to not block main thread
    if ('requestIdleCallback' in window) {
      (window as Window & { requestIdleCallback: (cb: () => void) => number })
        .requestIdleCallback(loadAndInit);
    } else {
      globalThis.setTimeout(loadAndInit, 2000);
    }

    return () => {
      if (window.google?.accounts?.id) {
        window.google.accounts.id.cancel();
      }
      initializedRef.current = false;
    };
  }, [user, clientId]);
};
