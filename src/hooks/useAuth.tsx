
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { debugLogger } from '@/utils/debugLogger';

interface AuthContextType {
  user: User | null;
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    debugLogger.info('AuthProvider', 'Inicializando autenticação');
    
    let mounted = true;
    
    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          debugLogger.error('AuthProvider', 'Erro ao obter sessão inicial', error);
        } else {
          debugLogger.info('AuthProvider', 'Sessão inicial obtida', { hasUser: !!session?.user });
          if (mounted) {
            setUser(session?.user ?? null);
          }
        }
      } catch (error) {
        debugLogger.error('AuthProvider', 'Erro crítico na inicialização', error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        debugLogger.info('AuthProvider', 'Mudança de estado de auth', { event, hasUser: !!session?.user });
        
        if (mounted) {
          setUser(session?.user ?? null);
          setLoading(false);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
      debugLogger.info('AuthProvider', 'AuthProvider desmontado');
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      debugLogger.info('AuthProvider', 'Tentativa de login', { email });
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
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      debugLogger.info('AuthProvider', 'Tentativa de cadastro', { email });
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
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
    }
  };

  const signOut = async () => {
    try {
      debugLogger.info('AuthProvider', 'Realizando logout');
      await supabase.auth.signOut();
      debugLogger.info('AuthProvider', 'Logout realizado com sucesso');
    } catch (error) {
      debugLogger.error('AuthProvider', 'Erro no logout', error);
    }
  };

  const signInWithGoogle = async () => {
    try {
      debugLogger.info('AuthProvider', 'Tentativa de login com Google');
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
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

  const value: AuthContextType = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    signInWithGoogle,
  };

  debugLogger.debug('AuthProvider', 'Estado atual', { hasUser: !!user, loading });

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    debugLogger.error('useAuth', 'Hook usado fora do AuthProvider!');
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
