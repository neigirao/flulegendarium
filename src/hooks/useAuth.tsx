
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { debugLogger } from '@/utils/debugLogger';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<any>;
  signUp: (email: string, password: string) => Promise<any>;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<any>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

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
          
          // Garantir que o CSS seja preservado após mudanças de auth
          setTimeout(() => {
            const htmlElement = document.documentElement;
            if (!htmlElement.classList.contains('css-loaded')) {
              htmlElement.classList.add('css-loaded');
              debugLogger.info('AuthProvider', 'CSS classes reforçadas após mudança de auth');
            }
          }, 100);
        }
      }
    );

    // Obter sessão inicial
    const initializeAuth = async () => {
      try {
        debugLogger.info('AuthProvider', 'Obtendo sessão inicial');
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
    try {
      debugLogger.info('AuthProvider', 'Tentativa de login', { email });
      setLoading(true);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        debugLogger.error('AuthProvider', 'Erro no login', error);
      } else {
        debugLogger.info('AuthProvider', 'Login realizado com sucesso');
      }
      
      return { data, error };
    } catch (error) {
      debugLogger.error('AuthProvider', 'Erro crítico no login', error);
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      debugLogger.info('AuthProvider', 'Tentativa de cadastro', { email });
      setLoading(true);
      
      const redirectUrl = `${window.location.origin}/`;
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl
        }
      });
      
      if (error) {
        debugLogger.error('AuthProvider', 'Erro no cadastro', error);
      } else {
        debugLogger.info('AuthProvider', 'Cadastro realizado com sucesso');
      }
      
      return { data, error };
    } catch (error) {
      debugLogger.error('AuthProvider', 'Erro crítico no cadastro', error);
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      debugLogger.info('AuthProvider', 'Realizando logout');
      setLoading(true);
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        debugLogger.error('AuthProvider', 'Erro no logout', error);
      } else {
        debugLogger.info('AuthProvider', 'Logout realizado com sucesso');
        // Estados serão limpos pelo onAuthStateChange
        
        // Forçar recarregamento completo da página para garantir CSS
        setTimeout(() => {
          window.location.reload();
        }, 500);
      }
    } catch (error) {
      debugLogger.error('AuthProvider', 'Erro crítico no logout', error);
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    try {
      debugLogger.info('AuthProvider', 'Tentativa de login com Google');
      
      const redirectUrl = `${window.location.origin}/`;
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl
        }
      });
      
      if (error) {
        debugLogger.error('AuthProvider', 'Erro no login com Google', error);
      } else {
        debugLogger.info('AuthProvider', 'Login com Google iniciado');
      }
      
      return { data, error };
    } catch (error) {
      debugLogger.error('AuthProvider', 'Erro crítico no login com Google', error);
      return { data: null, error };
    }
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

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    debugLogger.error('useAuth', 'Hook useAuth usado fora do AuthProvider!');
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  debugLogger.debug('useAuth', 'Hook chamado com sucesso', { 
    hasUser: !!context.user,
    loading: context.loading 
  });
  
  return context;
};
