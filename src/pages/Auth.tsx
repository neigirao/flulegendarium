import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { RootLayout } from '@/components/RootLayout';
import { SEOManager } from '@/components/seo/SEOManager';
import { ArrowLeft, Mail, Lock, User } from 'lucide-react';
import { toast } from 'sonner';

const Auth = () => {
  const { user, signIn, signUp, resetPassword, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (user && !loading) {
      const state = location.state as { from?: { pathname?: string } } | null;
      const from = state?.from?.pathname || '/selecionar-modo-jogo';
      navigate(from, { replace: true });
    }
  }, [user, loading, navigate, location.state]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const { error } = await signIn(email, password);
      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          setError('Email ou senha incorretos');
        } else {
          setError(error.message);
        }
      } else {
        toast.success('Login realizado com sucesso!');
      }
    } catch (err) {
      setError('Erro inesperado. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!fullName.trim() || fullName.trim().length < 2) {
      setError('O nome deve ter pelo menos 2 caracteres');
      return;
    }

    if (password !== confirmPassword) {
      setError('As senhas não coincidem');
      return;
    }

    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await signUp(email, password, fullName.trim());
      
      if (error) {
        if (error.message.includes('User already registered')) {
          setError('Este email já está cadastrado. Tente fazer login.');
        } else {
          setError(error.message);
        }
      } else if (data?.user?.identities?.length === 0) {
        // User already exists (repeated signup with unconfirmed email)
        setError('Este email já está cadastrado. Tente fazer login ou verifique seu email.');
      } else {
        toast.success('Conta criada! Verifique seu email para confirmar.');
      }
    } catch (err) {
      setError('Erro inesperado. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail.trim()) {
      toast.error('Digite seu email');
      return;
    }

    setResetLoading(true);
    try {
      const { error } = await resetPassword(resetEmail.trim());
      if (error) {
        toast.error(error.message);
      } else {
        toast.success('Email de recuperação enviado! Verifique sua caixa de entrada.');
        setShowResetDialog(false);
        setResetEmail('');
      }
    } catch (err) {
      toast.error('Erro ao enviar email. Tente novamente.');
    } finally {
      setResetLoading(false);
    }
  };

  if (loading) {
    return (
      <RootLayout>
        <div className="min-h-screen flex items-center justify-center bg-tricolor-vertical-border safe-area-top safe-area-bottom">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
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
        <div className="min-h-screen bg-tricolor-vertical-border flex items-center justify-center p-4 safe-area-top safe-area-bottom">
          <div className="w-full max-w-md">
            {/* Header */}
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
              <CardContent>
                <Tabs defaultValue="signin" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-6">
                    <TabsTrigger value="signin" className="font-display">Entrar</TabsTrigger>
                    <TabsTrigger value="signup" className="font-display">Criar Conta</TabsTrigger>
                  </TabsList>

                  {error && (
                    <Alert className="mb-4 border-destructive/20 bg-destructive/10">
                      <AlertDescription className="text-destructive">
                        {error}
                      </AlertDescription>
                    </Alert>
                  )}

                  <TabsContent value="signin">
                    <form onSubmit={handleSignIn} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="email" className="font-body">Email</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="pl-10"
                            placeholder="seu@email.com"
                            required
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="password" className="font-body">Senha</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="pl-10"
                            placeholder="••••••••"
                            required
                          />
                        </div>
                      </div>

                      <Button
                        type="submit"
                        className="w-full touch-target-lg font-display"
                        disabled={isLoading}
                      >
                        {isLoading ? 'Entrando...' : 'Entrar'}
                      </Button>

                      <Button
                        type="button"
                        variant="link"
                        className="w-full text-primary hover:text-primary/80 font-body"
                        onClick={() => setShowResetDialog(true)}
                      >
                        Esqueci minha senha
                      </Button>
                    </form>
                  </TabsContent>

                  <TabsContent value="signup">
                    <form onSubmit={handleSignUp} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="fullName" className="font-body">Nome *</Label>
                        <div className="relative">
                          <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="fullName"
                            type="text"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            className="pl-10"
                            placeholder="Seu nome completo"
                            required
                            minLength={2}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="signup-email" className="font-body">Email</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="signup-email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="pl-10"
                            placeholder="seu@email.com"
                            required
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="signup-password" className="font-body">Senha</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="signup-password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="pl-10"
                            placeholder="••••••••"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="confirm-password" className="font-body">Confirmar Senha</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="confirm-password"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="pl-10"
                            placeholder="••••••••"
                            required
                          />
                        </div>
                      </div>

                      <Button
                        type="submit"
                        className="w-full touch-target-lg font-display"
                        disabled={isLoading}
                      >
                        {isLoading ? 'Criando conta...' : 'Criar Conta'}
                      </Button>
                    </form>
                  </TabsContent>
                </Tabs>


                <div className="mt-6 text-center">
                  <Button
                    type="button"
                    variant="link"
                    onClick={() => navigate('/selecionar-modo-jogo')}
                    className="text-primary hover:text-primary/80 font-body"
                  >
                    Jogar como convidado
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <Dialog open={showResetDialog} onOpenChange={setShowResetDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="font-display text-xl">Recuperar Senha</DialogTitle>
              <DialogDescription className="font-body">
                Digite seu email e enviaremos um link para redefinir sua senha.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reset-email" className="font-body">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="reset-email"
                    type="email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    className="pl-10"
                    placeholder="seu@email.com"
                    required
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowResetDialog(false)}
                  className="flex-1 touch-target font-body"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="flex-1 touch-target font-display"
                  disabled={resetLoading}
                >
                  {resetLoading ? 'Enviando...' : 'Enviar'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </RootLayout>
    </>
  );
};

export default Auth;
