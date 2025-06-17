
import { supabase } from '@/integrations/supabase/client';
import { debugLogger } from '@/utils/debugLogger';

export const authService = {
  async signIn(email: string, password: string) {
    try {
      debugLogger.info('AuthService', 'Tentativa de login', { email });
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        debugLogger.error('AuthService', 'Erro no login', error);
      } else {
        debugLogger.info('AuthService', 'Login realizado com sucesso');
      }
      
      return { data, error };
    } catch (error) {
      debugLogger.error('AuthService', 'Erro crítico no login', error);
      return { data: null, error };
    }
  },

  async signUp(email: string, password: string) {
    try {
      debugLogger.info('AuthService', 'Tentativa de cadastro', { email });
      
      const redirectUrl = `${window.location.origin}/`;
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl
        }
      });
      
      if (error) {
        debugLogger.error('AuthService', 'Erro no cadastro', error);
      } else {
        debugLogger.info('AuthService', 'Cadastro realizado com sucesso');
      }
      
      return { data, error };
    } catch (error) {
      debugLogger.error('AuthService', 'Erro crítico no cadastro', error);
      return { data: null, error };
    }
  },

  async signOut() {
    try {
      debugLogger.info('AuthService', 'Realizando logout');
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        debugLogger.error('AuthService', 'Erro no logout', error);
      } else {
        debugLogger.info('AuthService', 'Logout realizado com sucesso');
      }
      
      return { error };
    } catch (error) {
      debugLogger.error('AuthService', 'Erro crítico no logout', error);
      return { error };
    }
  },

  async signInWithGoogle() {
    try {
      debugLogger.info('AuthService', 'Tentativa de login com Google');
      
      const redirectUrl = `${window.location.origin}/`;
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl
        }
      });
      
      if (error) {
        debugLogger.error('AuthService', 'Erro no login com Google', error);
      } else {
        debugLogger.info('AuthService', 'Login com Google iniciado');
      }
      
      return { data, error };
    } catch (error) {
      debugLogger.error('AuthService', 'Erro crítico no login com Google', error);
      return { data: null, error };
    }
  }
};
