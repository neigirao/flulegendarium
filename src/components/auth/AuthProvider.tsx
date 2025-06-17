
import React, { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { debugLogger } from '@/utils/debugLogger';
import { AuthContext } from '@/contexts/AuthContext';
import { AuthProviderProps, AuthContextType } from '@/types/auth';
import { authService } from '@/services/authService';
import { cssReinforcementUtils } from '@/utils/cssReinforcementUtils';

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    debugLogger.info('AuthProvider', 'Inicializando sistema de autenticação');
    
    let mounted = true;
    
    // Configurar listener de mudanças de estado primeiro
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        debugLogger.info('AuthProvider', 'Mudança de estado de auth', { 
          event, 
          hasUser: !!session?.user,
          userId: session?.user?.id 
        });
        
        if (mounted) {
          setSession(session);
          setUser(session?.user ?? null);
          setLoading(false);
          
          // Reforçar estilos após mudança de auth
          setTimeout(() => {
            cssReinforcementUtils.reinforceStyles();
          }, 50);
        }
      }
    );

    // Obter sessão inicial
    const initializeAuth = async () => {
      try {
        debugLogger.info('AuthProvider', 'Obtendo sessão inicial');
        
        // Reforçar estilos antes de verificar sessão
        cssReinforcementUtils.reinforceStyles();
        
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          debugLogger.error('AuthProvider', 'Erro ao obter sessão inicial', error);
        } else {
          debugLogger.info('AuthProvider', 'Sessão inicial obtida', { 
            hasUser: !!session?.user,
            userId: session?.user?.id 
          });
        }
        
        if (mounted) {
          setSession(session);
          setUser(session?.user ?? null);
          setLoading(false);
        }
      } catch (error) {
        debugLogger.error('AuthProvider', 'Erro crítico na inicialização', error);
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    return () => {
      mounted = false;
      subscription.unsubscribe();
      debugLogger.info('AuthProvider', 'AuthProvider desmontado');
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      const result = await authService.signIn(email, password);
      return result;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string) => {
    setLoading(true);
    try {
      const result = await authService.signUp(email, password);
      return result;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      const { error } = await authService.signOut();
      
      if (!error) {
        // Estados serão limpos pelo onAuthStateChange
        setSession(null);
        setUser(null);
        
        // Garantir que o CSS permaneça aplicado
        setTimeout(() => {
          cssReinforcementUtils.reinforceBodyStyles();
        }, 100);
      }
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    return await authService.signInWithGoogle();
  };

  const contextValue: AuthContextType = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    signInWithGoogle,
  };

  debugLogger.debug('AuthProvider', 'Estado atual do contexto', { 
    hasUser: !!user, 
    hasSession: !!session,
    loading,
    userId: user?.id 
  });

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};
