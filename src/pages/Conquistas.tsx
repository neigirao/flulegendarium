import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { RootLayout } from '@/components/RootLayout';
import { SEOHead } from '@/components/SEOHead';
import { AchievementsGrid } from '@/components/achievements/AchievementsGrid';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Trophy, Lock } from 'lucide-react';

const Conquistas = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth', { state: { from: { pathname: '/conquistas' } } });
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <RootLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-flu-grena"></div>
        </div>
      </RootLayout>
    );
  }

  if (!user) {
    return (
      <RootLayout>
        <SEOHead 
          title="Conquistas - Lendas do Flu"
          description="Desbloqueie conquistas jogando Lendas do Flu e mostre seu conhecimento tricolor!"
        />
        <div className="min-h-screen bg-gradient-to-br from-flu-verde/10 via-white to-flu-grena/10 flex items-center justify-center p-4">
          <Card className="max-w-md w-full">
            <CardContent className="pt-6 text-center space-y-4">
              <Lock className="w-16 h-16 mx-auto text-flu-grena/50" />
              <h2 className="text-2xl font-bold text-flu-grena">Área Restrita</h2>
              <p className="text-gray-600">
                Faça login para ver suas conquistas e acompanhar seu progresso como torcedor tricolor!
              </p>
              <Button
                onClick={() => navigate('/auth', { state: { from: { pathname: '/conquistas' } } })}
                className="bg-flu-grena hover:bg-flu-grena/90"
              >
                Fazer Login
              </Button>
            </CardContent>
          </Card>
        </div>
      </RootLayout>
    );
  }

  return (
    <>
      <SEOHead 
        title="Minhas Conquistas - Lendas do Flu"
        description="Veja suas conquistas desbloqueadas no Lendas do Flu e acompanhe seu progresso!"
      />
      <RootLayout>
        <div className="min-h-screen bg-tricolor-vertical-border safe-area-top safe-area-bottom py-8 px-4">
          <div className="container mx-auto max-w-4xl">
            {/* Header */}
            <div className="mb-8">
              <Button
                variant="outline"
                onClick={() => navigate(-1)}
                className="mb-4 touch-target"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
              
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 rounded-full bg-primary/10">
                  <Trophy className="w-8 h-8 text-primary" />
                </div>
                <h1 className="font-display text-display-title text-primary">
                  Minhas Conquistas
                </h1>
              </div>
              
              <p className="font-body text-muted-foreground">
                Olá, <span className="font-semibold text-foreground">{user.user_metadata?.full_name || 'Tricolor'}</span>! 
                Acompanhe suas conquistas e mostre seu conhecimento sobre o Fluminense.
              </p>
            </div>

            {/* Achievements Grid */}
            <AchievementsGrid />
          </div>
        </div>
      </RootLayout>
    </>
  );
};

export default Conquistas;
