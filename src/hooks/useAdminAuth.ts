
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';

interface AdminAuth {
  user: User;
  isAdmin: boolean;
}

export const useAdminAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [adminData, setAdminData] = useState<AdminAuth | null>(null);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          // Check if user has admin role
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', session.user.id)
            .single();
          
          const isAdmin = profile?.role === 'admin';
          
          if (isAdmin) {
            setIsAuthenticated(true);
            setAdminData({
              user: session.user,
              isAdmin: true
            });
          } else {
            setIsAuthenticated(false);
            setAdminData(null);
          }
        } else {
          setIsAuthenticated(false);
          setAdminData(null);
        }
      } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
        setIsAuthenticated(false);
        setAdminData(null);
        setError('Erro ao verificar permissões de administrador');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          // Check if user has admin role
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', session.user.id)
            .single();
          
          const isAdmin = profile?.role === 'admin';
          
          if (isAdmin) {
            setIsAuthenticated(true);
            setAdminData({
              user: session.user,
              isAdmin: true
            });
          } else {
            setIsAuthenticated(false);
            setAdminData(null);
          }
        } else {
          setIsAuthenticated(false);
          setAdminData(null);
        }
        setIsLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError('Credenciais inválidas');
        return;
      }

      if (data.user) {
        // Check if user has admin role
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.user.id)
          .single();
        
        const isAdmin = profile?.role === 'admin';
        
        if (isAdmin) {
          setIsAuthenticated(true);
          setAdminData({
            user: data.user,
            isAdmin: true
          });
          navigate('/admin');
        } else {
          setError('Acesso negado. Apenas administradores podem acessar esta área.');
          await supabase.auth.signOut();
        }
      }
    } catch (error) {
      console.error('Erro no login:', error);
      setError('Erro interno do servidor');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setIsAuthenticated(false);
    setAdminData(null);
    navigate('/admin/login-administrador');
  };

  return {
    isAuthenticated,
    isAdmin: isAuthenticated, // Alias for backward compatibility
    isLoading,
    loading: isLoading, // Alias for backward compatibility
    adminData,
    login,
    logout,
    error
  };
};
