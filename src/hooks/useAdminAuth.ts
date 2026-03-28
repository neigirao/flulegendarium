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
        // Check for stored admin session
        const storedSession = localStorage.getItem('admin_session');
        if (storedSession) {
          const session = JSON.parse(storedSession);
          // Check if session is still valid (24 hours)
          const sessionAge = Date.now() - session.timestamp;
          const maxAge = 24 * 60 * 60 * 1000; // 24 hours
          
          if (sessionAge < maxAge) {
            setIsAuthenticated(true);
            setAdminData({
              user: session.user,
              isAdmin: true
            });
          } else {
            localStorage.removeItem('admin_session');
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
      const { data: adminRows, error: adminError } = await supabase.rpc('verify_admin_credentials', {
        p_username: username,
        p_password: password,
      });

      const adminUser = adminRows?.[0];

      if (adminError || !adminUser) {
        setError('Credenciais inválidas');
        return;
      }

      // Create a mock user object for admin
      const mockUser = {
        id: adminUser.id,
        email: `${username}@admin.local`,
        user_metadata: { username },
        app_metadata: { role: 'admin' },
        aud: 'authenticated',
        created_at: new Date().toISOString()
      } as unknown as User;

      setIsAuthenticated(true);
      setAdminData({
        user: mockUser,
        isAdmin: true
      });
      
      // Store admin session in localStorage
      localStorage.setItem('admin_session', JSON.stringify({
        user: mockUser,
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
    isAdmin: isAuthenticated, // Alias for backward compatibility
    isLoading,
    loading: isLoading, // Alias for backward compatibility
    adminData,
    login,
    logout,
    error
  };
};
