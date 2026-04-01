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
        }
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
      // Validate credentials through a SECURITY DEFINER RPC (avoids exposing password hashes)
      const { data: adminRows, error: adminError } = await (supabase.rpc as any)('verify_admin_credentials', {
        p_username: username,
        p_password: password,
      });

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
    isAdmin: isAuthenticated, // Alias for backward compatibility
    isLoading,
    loading: isLoading, // Alias for backward compatibility
    adminData,
    login,
    logout,
    error
  };
};
