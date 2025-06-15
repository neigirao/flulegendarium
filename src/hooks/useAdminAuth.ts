
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
  const [error, setError] = useState<string | null>(null);
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

  const login = async (username: string, password: string) => {
    setIsLoading(true);
    setError(null);

    try {
      // Credenciais atualizadas
      if (username === 'neigirao' && password === 'PCFClub!21') {
        const adminAuth: AdminAuth = {
          userId: 'admin-neigirao',
          username: username,
          loginTime: Date.now()
        };
        
        localStorage.setItem('adminAuth', JSON.stringify(adminAuth));
        setIsAuthenticated(true);
        setAdminData(adminAuth);
        navigate('/admin/dashboard');
      } else {
        setError('Credenciais inválidas');
      }
    } catch (error) {
      console.error('Erro no login:', error);
      setError('Erro interno do servidor');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('adminAuth');
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
