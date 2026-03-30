import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { logger } from '@/utils/logger';

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
        const storedSession = localStorage.getItem('admin_session');
        if (!storedSession) {
          setIsAuthenticated(false);
          setAdminData(null);
          setIsLoading(false);
          return;
        }

        const session = JSON.parse(storedSession);
        const sessionAge = Date.now() - session.timestamp;
        const maxAge = 24 * 60 * 60 * 1000;

        if (sessionAge >= maxAge) {
          localStorage.removeItem('admin_session');
          setIsAuthenticated(false);
          setAdminData(null);
          setIsLoading(false);
          return;
        }

        // Re-validate server-side: verify the admin user still exists by ID
        const { data: adminRows, error: rpcError } = await supabase
          .from('admin_users')
          .select('id, username')
          .eq('id', session.user?.id)
          .limit(1);

        // Note: RLS on admin_users blocks direct SELECT (USING false),
        // but we have a permissive policy "Admin users são públicos para leitura" (USING true).
        // If both policies exist, the permissive one wins for SELECT.

        if (rpcError || !adminRows || adminRows.length === 0) {
          logger.warn('Admin session invalid - user no longer exists', 'ADMIN_AUTH');
          localStorage.removeItem('admin_session');
          setIsAuthenticated(false);
          setAdminData(null);
          setIsLoading(false);
          return;
        }

        setIsAuthenticated(true);
        setAdminData({
          user: session.user,
          isAdmin: true
        });
      } catch (error) {
        logger.error('Erro ao verificar autenticação', 'ADMIN_AUTH', error);
        setIsAuthenticated(false);
        setAdminData(null);
        setError('Erro ao verificar permissões de administrador');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (username: string, password: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const { data: adminRows, error: adminError } = await (supabase.rpc as CallableFunction)(
        'verify_admin_credentials',
        { p_username: username, p_password: password }
      );

      const adminUser = adminRows?.[0];

      if (adminError || !adminUser) {
        setError('Credenciais inválidas');
        return;
      }

      const sessionUser = {
        id: adminUser.id,
        email: '',
        user_metadata: { username: adminUser.username },
        app_metadata: { role: 'admin' },
        aud: 'authenticated',
        created_at: new Date().toISOString()
      } as unknown as User;

      setIsAuthenticated(true);
      setAdminData({
        user: sessionUser,
        isAdmin: true
      });
      
      localStorage.setItem('admin_session', JSON.stringify({
        user: sessionUser,
        timestamp: Date.now()
      }));

      navigate('/admin');
    } catch (error) {
      logger.error('Erro no login', 'ADMIN_AUTH', error);
      setError('Erro interno do servidor');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    localStorage.removeItem('admin_session');
    setIsAuthenticated(false);
    setAdminData(null);
    navigate('/admin/login-administrador');
  };

  return {
    isAuthenticated,
    isAdmin: isAuthenticated,
    isLoading,
    loading: isLoading,
    adminData,
    login,
    logout,
    error
  };
};