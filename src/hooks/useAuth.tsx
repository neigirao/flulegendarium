
import { useContext } from 'react';
import { AuthContext } from '@/contexts/AuthContext';
import { AuthContextType } from '@/types/auth';
import { debugLogger } from '@/utils/debugLogger';

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

// Export AuthProvider for backward compatibility
export { AuthProvider } from '@/components/auth/AuthProvider';
