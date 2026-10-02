import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RootLayout } from '@/components/RootLayout';
import { SEOManager } from '@/components/seo/SEOManager';
import { AppleSignInArt } from "@/components/auth/AppleSignInArt";
import { ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { authStart, authError, medirEntradaNativa } from '@/lib/auth-funnel';
import { entrarNoAplicativo, noAplicativo } from '@/lib/entrar-nativo';

const Auth = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (user && !loading) {
      const state = location.state as { from?: { pathname?: string } } | null;
      const from = state?.from?.pathname || '/selecionar-modo-jogo';
      navigate(from, { replace: true });
    }
  }, [user, loading, navigate, location.state]);

  const [erroLogin, setErroLogin] = useState<string | null>(null);
  const [abrindo, setAbrindo] = useState<'google' | 'apple' | null>(null);

  /*
   * Dentro do app o caminho da web não serve: o `origin` é
   * `capacitor://localhost` e o provedor nunca volta — a pessoa fica presa
   * no navegador. O caminho nativo abre a janela de autenticação do sistema
   * e recebe o retorno pelo esquema `lendasdoflu://` (ver
   * `src/lib/entrar-nativo.ts`).
   */
  const handleOAuthLogin = async (provedor: 'google' | 'apple') => {
    setErroLogin(null);
    if (noAplicativo()) {
      setAbrindo(provedor);
      const resultado = await medirEntradaNativa(provedor, () => entrarNoAplicativo(provedor));
      setAbrindo(null);
      if (resultado !== null && resultado !== 'cancelado') {
        setErroLogin('Não foi possível entrar agora. Tente de novo.');
        console.error('login nativo falhou:', resultado);
      }
      return;
    }
    const state = location.state as { from?: { pathname?: string } } | null;
    const from = state?.from?.pathname || '/selecionar-modo-jogo';
    authStart(provedor, "web");
    try {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: provedor,
      options: { redirectTo: window.location.origin + from },
    });
    if (error) { authError(provedor, "web", "provider_error"); setErroLogin('Não foi possível entrar agora. Tente de novo.'); }
    } catch { authError(provedor, "web", "network"); setErroLogin('Não foi possível entrar agora. Tente de novo.'); }
  };

  const handleGoogleLogin = () => handleOAuthLogin('google');
  const handleAppleLogin = () => handleOAuthLogin('apple');

  if (loading) {
    return (
      <RootLayout>
        <div className="min-h-screen flex items-center justify-center page-warm safe-area-top safe-area-bottom">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </RootLayout>
    );
  }

  return (
    <>
      <SEOManager
        title="Login - Lendas do Flu"
        description="Entre na sua conta para salvar seu progresso e competir no ranking global dos Lendas do Flu!"
      />
      <RootLayout>
        <div className="page-warm bg-tricolor-vertical-border flex items-start sm:items-center justify-center px-4 py-8 sm:py-12 safe-area-top safe-area-bottom">
          <div className="w-full max-w-md">
            <div className="text-center mb-8">
              <Button
                variant="outline"
                onClick={() => navigate(-1)}
                className="mb-4 touch-target"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>

              <div className="flex items-center justify-center gap-3 mb-4">
                <img
                  src="/lovable-uploads/0aa3609f-0584-4bf4-8303-e03f50f7e131.png"
                  alt="Fluminense FC"
                  className="w-12 h-12 object-contain"
                />
                <h1 className="text-display-title text-primary">Lendas do Flu</h1>
              </div>
              <p className="text-muted-foreground font-body">
                Entre na sua conta para salvar seu progresso
              </p>
            </div>

            <Card className="shadow-2xl border-0 bg-card/95 backdrop-blur-sm">
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-display-subtitle text-primary">Acesse sua conta</CardTitle>
              </CardHeader>
              <CardContent className="pt-2">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full touch-target-lg font-display border-2 hover:bg-muted"
                  onClick={handleGoogleLogin}
                  disabled={abrindo !== null}
                >
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  Entrar com Google
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full touch-target-lg font-display border-2 hover:bg-muted mt-3"
                  onClick={handleAppleLogin}
                  disabled={abrindo !== null}
                >
                  <AppleSignInArt />
                </Button>
                {sessionStorage.getItem('guest-demo-completed') !== 'true' && (
                  <Button variant="ghost" className="w-full touch-target-lg mt-3" onClick={() => navigate('/selecionar-modo-jogo')}>
                    Experimentar uma rodada sem conta
                  </Button>
                )}
                {abrindo !== null && (
                  <p className="mt-3 text-center text-sm text-muted-foreground font-body">
                    {abrindo === 'google' ? 'Abrindo o Google…' : 'Abrindo a Apple…'}
                  </p>
                )}
                {erroLogin && (
                  <p className="mt-3 text-center text-sm text-destructive font-body">
                    {erroLogin}
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </RootLayout>
    </>
  );
};

export default Auth;
