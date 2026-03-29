import { useCallback, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useAnalytics } from '@/hooks/analytics';
import { useLocation, useNavigate } from 'react-router-dom';
import { logger } from '@/utils/logger';

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
  const navigate = useNavigate();
  const location = useLocation();
  const isOneTapRoute = location.pathname === '/auth' || location.pathname === '/login';
  const initializedRef = useRef(false);
  const oneTapLoginSucceededRef = useRef(false);
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const { trackOneTapDisplayed, trackOneTapCompleted, trackOneTapSkipped, trackOneTapError } = useAnalytics();

  const redirectAfterLogin = useCallback(() => {
    const routeState = location.state as { from?: { pathname?: string } } | null;
    const redirectTo = routeState?.from?.pathname || '/selecionar-modo-jogo';

    navigate(redirectTo, { replace: true });

    globalThis.setTimeout(() => {
      if (window.location.pathname !== redirectTo) {
        window.location.assign(redirectTo);
      }
    }, 150);
  }, [location.state, navigate]);

  useEffect(() => {
    if (!user || !oneTapLoginSucceededRef.current) return;

    oneTapLoginSucceededRef.current = false;
    redirectAfterLogin();
  }, [redirectAfterLogin, user]);

  useEffect(() => {
    if (user || !clientId || initializedRef.current || !isOneTapRoute) return;

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
        use_fedcm_for_prompt: true,
      });

      window.google.accounts.id.prompt((notification: Record<string, unknown>) => {
        const momentType = typeof notification.getMomentType === 'function'
          ? (notification.getMomentType as () => string)()
          : undefined;

        if (momentType === 'display') {
          logger.debug('Prompt displayed', 'ONE_TAP');
          trackOneTapDisplayed();
        } else if (momentType === 'skipped') {
          logger.debug('Prompt skipped', 'ONE_TAP');
          trackOneTapSkipped();
        } else if (momentType === 'dismissed') {
          logger.debug('Prompt dismissed', 'ONE_TAP');
          trackOneTapSkipped();
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
          trackOneTapError(error.message);
        } else {
          console.log('[OneTap] Login successful');
          trackOneTapCompleted();
          oneTapLoginSucceededRef.current = true;
          redirectAfterLogin();
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'unknown';
        console.error('[OneTap] Unexpected error:', msg);
        trackOneTapError(msg);
      }
    };

    // Defer loading so One Tap doesn't compete with initial paint/LCP
    const scheduleOneTap = () => {
      if ('requestIdleCallback' in window) {
        (window as Window & { requestIdleCallback: (cb: () => void, options?: { timeout: number }) => number })
          .requestIdleCallback(loadAndInit, { timeout: 5000 });
        return;
      }

      globalThis.setTimeout(loadAndInit, 3500);
    };

    if (document.readyState === 'complete') {
      scheduleOneTap();
    } else {
      window.addEventListener('load', scheduleOneTap, { once: true });
    }

    return () => {
      window.removeEventListener('load', scheduleOneTap);

      if (window.google?.accounts?.id) {
        window.google.accounts.id.cancel();
      }
    };
  }, [user, clientId, isOneTapRoute, location.state, navigate, redirectAfterLogin, trackOneTapCompleted, trackOneTapDisplayed, trackOneTapError, trackOneTapSkipped]);
};
