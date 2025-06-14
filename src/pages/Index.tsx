
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { PlayerRanking } from "@/components/PlayerRanking";
import { AuthButton } from "@/components/auth/AuthButton";
import { useAuth } from "@/hooks/useAuth";
import { getGameStats } from "@/services/statsService";
import { SEOHead } from "@/components/SEOHead";
import { StructuredData } from "@/components/StructuredData";
import { GamepadIcon, UsersIcon, AwardIcon } from "lucide-react";

export default function Index() {
  const { user } = useAuth();

  const { data: stats } = useQuery({
    queryKey: ['game-stats'],
    queryFn: getGameStats,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    refetchOnWindowFocus: false,
  });

  return (
    <>
      <SEOHead />
      <StructuredData type="WebSite" />
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm py-4 sticky top-0 z-50">
          <div className="container mx-auto px-4 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3">
              <img 
                src="/lovable-uploads/20457a11-5436-48c6-906d-82b9451bc16d.png" 
                alt="Fluminense FC" 
                className="w-8 h-8"
              />
              <span className="text-2xl font-bold text-flu-grena">Lendas do Flu</span>
            </Link>
            <nav className="flex items-center space-x-6">
              <Link to="/" className="text-flu-verde hover:text-flu-grena transition-colors">
                Início
              </Link>
              <Link to="/select-mode" className="text-flu-verde hover:text-flu-grena transition-colors">
                Jogar
              </Link>
              {user && (
                <Link to="/profile" className="text-flu-verde hover:text-flu-grena transition-colors">
                  Meu Perfil
                </Link>
              )}
              <Link to="/admin/login" className="text-flu-verde hover:text-flu-grena transition-colors">
                Admin
              </Link>
              <AuthButton />
            </nav>
          </div>
        </header>

        {/* Hero Section */}
        <section className="relative py-16 px-4 bg-gradient-to-r from-flu-verde to-flu-grena overflow-hidden">
          <div className="container mx-auto">
            <div className="flex items-center justify-between">
              <div className="flex-1 text-white max-w-2xl">
                <div className="flex items-center gap-4 mb-6">
                  <img 
                    src="/lovable-uploads/20457a11-5436-48c6-906d-82b9451bc16d.png" 
                    alt="Fluminense FC" 
                    className="w-16 h-16"
                  />
                  <div>
                    <h1 className="text-5xl md:text-6xl font-bold leading-tight">
                      Lendas do<br />
                      <span className="text-yellow-300">Fluminense</span>
                    </h1>
                  </div>
                </div>
                <p className="text-xl mb-4 opacity-90 leading-relaxed">
                  Teste seus conhecimentos sobre os maiores<br />
                  ídolos da história tricolor!
                </p>
                <p className="text-lg mb-8 opacity-80">
                  Veja a foto, adivinhe o jogador e conquiste seu lugar<br />
                  entre os verdadeiros conhecedores do Fluzão!
                </p>
                
                <div className="flex gap-4">
                  <Button 
                    size="lg" 
                    className="bg-white text-flu-grena hover:bg-gray-100 font-semibold px-8 py-4 rounded-lg text-lg"
                    asChild
                  >
                    <Link to="/select-mode">
                      Começar Agora
                    </Link>
                  </Button>
                  <Button 
                    size="lg" 
                    variant="outline"
                    className="border-2 border-white text-white hover:bg-white hover:text-flu-grena font-semibold px-8 py-4 rounded-lg text-lg"
                    asChild
                  >
                    <Link to="#ranking">
                      Ver Ranking
                    </Link>
                  </Button>
                </div>
              </div>
              
              <div className="hidden lg:block flex-1">
                <div className="relative w-96 h-96 mx-auto">
                  <div className="absolute inset-0 bg-white/20 rounded-2xl backdrop-blur-sm flex items-center justify-center border border-white/30">
                    <div className="w-80 h-80 bg-gradient-to-br from-white/30 to-white/10 rounded-xl flex items-center justify-center relative overflow-hidden border border-white/20">
                      <div className="text-white text-9xl font-bold opacity-40">?</div>
                      <div className="absolute top-4 right-4">
                        <img 
                          src="/lovable-uploads/20457a11-5436-48c6-906d-82b9451bc16d.png" 
                          alt="Fluminense FC" 
                          className="w-12 h-12 opacity-60"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Ranking Section */}
        <section id="ranking" className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-flu-grena mb-4">
                🏆 Ranking Tricolor
              </h2>
              <p className="text-xl text-gray-600">
                Os maiores conhecedores das lendas do Fluminense
              </p>
            </div>
            <PlayerRanking />
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-20 bg-gradient-to-r from-flu-grena to-flu-verde text-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Estatísticas do Jogo</h2>
              <p className="text-xl opacity-90">Acompanhe os números da nossa comunidade tricolor</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center p-8 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
                <div className="flex items-center justify-center w-20 h-20 bg-white/20 rounded-full mx-auto mb-6">
                  <GamepadIcon className="w-10 h-10 text-white" />
                </div>
                <p className="text-5xl font-bold mb-3">
                  {stats?.totalMatches?.toLocaleString() || '1.234'}
                </p>
                <p className="text-xl opacity-80">partidas jogadas</p>
              </div>
              <div className="text-center p-8 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
                <div className="flex items-center justify-center w-20 h-20 bg-white/20 rounded-full mx-auto mb-6">
                  <UsersIcon className="w-10 h-10 text-white" />
                </div>
                <p className="text-5xl font-bold mb-3">
                  {stats?.activePlayers?.toLocaleString() || '567'}
                </p>
                <p className="text-xl opacity-80">tricolores ativos</p>
              </div>
              <div className="text-center p-8 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
                <div className="flex items-center justify-center w-20 h-20 bg-yellow-400/80 rounded-full mx-auto mb-6">
                  <AwardIcon className="w-10 h-10 text-white" />
                </div>
                <p className="text-5xl font-bold mb-3">
                  {stats?.highestScore?.toLocaleString() || '9.101'}
                </p>
                <p className="text-xl opacity-80">maior pontuação</p>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-flu-grena mb-4">
                Por que jogar Lendas do Flu?
              </h2>
              <p className="text-xl text-gray-600">
                Descubra tudo que nosso jogo oferece para você
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="bg-white rounded-2xl p-8 text-center shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
                <div className="flex items-center justify-center w-20 h-20 bg-flu-grena rounded-full mx-auto mb-6">
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                    <div className="w-5 h-5 bg-flu-grena rounded-full"></div>
                  </div>
                </div>
                <h3 className="text-2xl font-semibold text-flu-grena mb-4">
                  Desafie Amigos
                </h3>
                <p className="text-gray-600 text-lg leading-relaxed">
                  Compartilhe seus resultados e veja quem conhece mais sobre as lendas tricolores
                </p>
              </div>
              
              {/* Feature 2 */}
              <div className="bg-white rounded-2xl p-8 text-center shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
                <div className="flex items-center justify-center w-20 h-20 bg-flu-verde rounded-full mx-auto mb-6">
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                    <AwardIcon className="w-5 h-5 text-flu-verde" />
                  </div>
                </div>
                <h3 className="text-2xl font-semibold text-flu-grena mb-4">
                  Ranking Global
                </h3>
                <p className="text-gray-600 text-lg leading-relaxed">
                  Compete com tricolores do mundo todo e mostre seu conhecimento
                </p>
              </div>
              
              {/* Feature 3 */}
              <div className="bg-white rounded-2xl p-8 text-center shadow-lg hover:shadow-xl transition-shadow border border-gray-100 relative">
                <div className="absolute top-6 right-6">
                  <span className="bg-orange-500 text-white text-sm px-3 py-1 rounded-full font-bold">
                    NOVO
                  </span>
                </div>
                <div className="flex items-center justify-center w-20 h-20 bg-orange-500 rounded-full mx-auto mb-6">
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                    <div className="w-5 h-5 bg-orange-500 rounded-full"></div>
                  </div>
                </div>
                <h3 className="text-2xl font-semibold text-flu-grena mb-4">
                  Sempre Atualizado
                </h3>
                <p className="text-gray-600 text-lg leading-relaxed">
                  Novos jogadores e desafios adicionados regularmente
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-flu-grena py-12 text-white">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-center gap-4 mb-6">
              <img 
                src="/lovable-uploads/20457a11-5436-48c6-906d-82b9451bc16d.png" 
                alt="Fluminense FC" 
                className="w-10 h-10"
              />
              <span className="text-2xl font-bold">Lendas do Flu</span>
            </div>
            <p className="text-center text-lg opacity-80">
              &copy; 2024 Lendas do Flu. Feito com ❤️ pelos tricolores.
            </p>
          </div>
        </footer>
      </div>
    </>
  );
}
