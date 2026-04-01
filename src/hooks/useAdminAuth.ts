import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';

interface AdminSessionUser {
  id: string;
  username: string;
}

interface AdminAuth {
  user: AdminSessionUser;
  isAdmin: boolean;
}

const ADMIN_SESSION_KEY = 'admin_session';
const ADMIN_SESSION_MAX_AGE_MS = 24 * 60 * 60 * 1000;

const isValidAdminSessionUser = (user: unknown): user is AdminSessionUser => {
  return Boolean(
    user &&
      typeof user === 'object' &&
      'id' in user &&
      'username' in user &&
      typeof (user as { id: unknown }).id === 'string' &&
      typeof (user as { username: unknown }).username === 'string'
  );
};

export const useAdminAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [adminData, setAdminData] = useState<AdminAuth | null>(null);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check for stored admin session
        const storedSession = localStorage.getItem(ADMIN_SESSION_KEY);
        if (storedSession) {
          const session = JSON.parse(storedSession);
          const sessionAge = Date.now() - Number(session?.timestamp ?? 0);
          
          if (sessionAge < ADMIN_SESSION_MAX_AGE_MS && isValidAdminSessionUser(session?.user)) {
            setIsAuthenticated(true);
            setAdminData({
              user: session.user,
              isAdmin: true
            });
          } else {
            localStorage.removeItem(ADMIN_SESSION_KEY);
            setIsAuthenticated(false);
            setAdminData(null);
          }
        } else {
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

      const adminUserSession: AdminSessionUser = {
        id: adminUser.id,
        username: adminUser.username ?? username,
      };

      setIsAuthenticated(true);
      setAdminData({
        user: adminUserSession,
        isAdmin: true
      });
      
      // Store admin session in localStorage
      localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify({
        user: adminUserSession,
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
    localStorage.removeItem(ADMIN_SESSION_KEY);
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