import React from 'react';
import { RootLayout } from '@/components/RootLayout';
import { SEOHead } from '@/components/SEOHead';
import { TopNavigation } from '@/components/navigation/TopNavigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Users, Share, Trophy, MessageCircle, Heart, ArrowLeft } from 'lucide-react';
import { SocialShare } from '@/components/social/SocialShare';
import { PlayerCommentsSection } from '@/components/social/PlayerCommentsSection';

const SocialPage = () => {
  const navigate = useNavigate();

  return (
    <>
      <SEOHead 
        title="Social - Lendas do Flu"
        description="Interaja com outros fãs do Fluminense, compartilhe seus resultados e participe da comunidade tricolor!"
      />
      <RootLayout>
        <TopNavigation />
        <div className="min-h-screen bg-gradient-to-br from-flu-verde/10 via-white to-flu-grena/10 pt-16">
          <div className="container mx-auto px-4 py-8">
            {/* Header */}
            <div className="mb-8">
              <Button
                variant="outline"
                onClick={() => navigate(-1)}
                className="mb-4 flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Voltar
              </Button>
              
              <div className="text-center">
                <h1 className="text-4xl font-bold text-flu-grena mb-4">
                  Comunidade Tricolor
                </h1>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                  Interaja com outros fãs do Fluminense, compartilhe seus resultados e celebre o conhecimento tricolor!
                </p>
              </div>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {/* Compartilhar Resultados */}
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-flu-verde/10 rounded-lg">
                      <Share className="w-6 h-6 text-flu-verde" />
                    </div>
                    <CardTitle className="text-flu-grena">Compartilhar Resultados</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">
                    Mostre seus melhores resultados para outros tricolores nas redes sociais.
                  </p>
                  <SocialShare 
                    gameMode="adaptativo"
                    score={0}
                    correctGuesses={0}
                    showFullInterface={false}
                  />
                </CardContent>
              </Card>

              {/* Ranking Global */}
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-flu-grena/10 rounded-lg">
                      <Trophy className="w-6 h-6 text-flu-grena" />
                    </div>
                    <CardTitle className="text-flu-grena">Ranking Global</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">
                    Veja sua posição no ranking e compete com outros conhecedores do Flu.
                  </p>
                  <Button 
                    onClick={() => navigate('/?section=ranking')}
                    className="w-full bg-flu-grena hover:bg-flu-grena/90"
                  >
                    Ver Ranking
                  </Button>
                </CardContent>
              </Card>

              {/* Comentários */}
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-blue-500/10 rounded-lg">
                      <MessageCircle className="w-6 h-6 text-blue-600" />
                    </div>
                    <CardTitle className="text-flu-grena">Comentários</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">
                    Comente sobre os jogadores e compartilhe suas memórias tricolores.
                  </p>
                  <Button 
                    variant="outline"
                    className="w-full border-blue-500 text-blue-600 hover:bg-blue-50"
                  >
                    Ver Comentários
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Seção de Comentários */}
            <div className="max-w-4xl mx-auto">
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl text-flu-grena flex items-center gap-3">
                    <MessageCircle className="w-6 h-6" />
                    Comentários da Comunidade
                  </CardTitle>
                  <p className="text-gray-600">
                    O que a comunidade tricolor está falando sobre nossos ídolos
                  </p>
                </CardHeader>
                <CardContent>
                  <PlayerCommentsSection playerId="sample-player-id" playerName="Exemplo" />
                </CardContent>
              </Card>
            </div>

            {/* Call to Action */}
            <div className="text-center mt-12 mb-8">
              <Card className="max-w-2xl mx-auto bg-gradient-to-r from-flu-verde/10 to-flu-grena/10">
                <CardContent className="p-8">
                  <Users className="w-16 h-16 text-flu-grena mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-flu-grena mb-4">
                    Junte-se à Comunidade!
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Faça login para participar das discussões, compartilhar resultados e interagir com outros tricolores.
                  </p>
                  <div className="space-y-3">
                    <Button 
                      onClick={() => navigate('/auth')}
                      className="w-full bg-flu-grena hover:bg-flu-grena/90"
                    >
                      Fazer Login
                    </Button>
                    <Button 
                      onClick={() => navigate('/quiz-adaptativo')}
                      variant="outline"
                      className="w-full border-flu-verde text-flu-verde hover:bg-flu-verde hover:text-white"
                    >
                      Começar a Jogar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </RootLayout>
    </>
  );
};

export default SocialPage;