
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface AdminAuth {
  userId: string;
  username: string;
  loginTime: number;
}

export const useAdminAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [adminData, setAdminData] = useState<AdminAuth | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = () => {
      try {
        const authData = localStorage.getItem('adminAuth');
        if (authData) {
          const parsedAuth: AdminAuth = JSON.parse(authData);
          
          // Verificar se a sessão não expirou (24 horas)
          const now = Date.now();
          const sessionDuration = 24 * 60 * 60 * 1000; // 24 horas
          
          if (now - parsedAuth.loginTime < sessionDuration) {
            setIsAuthenticated(true);
            setAdminData(parsedAuth);
          } else {
            // Sessão expirada
            localStorage.removeItem('adminAuth');
            setIsAuthenticated(false);
            setAdminData(null);
          }
        }
      } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
        localStorage.removeItem('adminAuth');
        setIsAuthenticated(false);
        setAdminData(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const logout = () => {
    localStorage.removeItem('adminAuth');
    setIsAuthenticated(false);
    setAdminData(null);
    navigate('/admin/login');
  };

  return {
    isAuthenticated,
    isLoading,
    adminData,
    logout
  };
};
