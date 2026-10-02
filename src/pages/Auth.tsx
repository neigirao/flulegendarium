import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RootLayout } from '@/components/RootLayout';
import { SEOManager } from '@/components/seo/SEOManager';
import { GoogleSignInArt } from "@/components/auth/GoogleSignInArt";
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
        <div className="page-warm bg-tricolor-vertical-border flex items-start sm:items-center justify-center px-4 py-8 sm:py-12 safe-area-bottom" style={{ paddingTop: "calc(2rem + env(safe-area-inset-top))" }}>
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
                  <GoogleSignInArt />
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
