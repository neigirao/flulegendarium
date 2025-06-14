
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
import { GamepadIcon, UsersIcon, AwardIcon, PlayIcon, TrophyIcon, StarIcon } from "lucide-react";

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
                src="/lovable-uploads/0aa3609f-0584-4bf4-8303-e03f50f7e131.png" 
                alt="Fluminense FC" 
                className="w-8 h-8 object-contain"
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

        {/* Hero Section Redesigned */}
        <section className="relative py-16 px-4 bg-gradient-to-br from-flu-grena via-flu-grena/90 to-flu-verde overflow-hidden min-h-[90vh] flex items-center">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-white/5 to-transparent"></div>
          
          <div className="container mx-auto relative z-10">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Content Side */}
              <div className="text-white space-y-8">
                {/* Badge/Tag */}
                <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium">
                  <StarIcon className="w-4 h-4 text-yellow-300" />
                  <span>Jogo oficial dos tricolores</span>
                </div>

                {/* Main Headline */}
                <div className="space-y-4">
                  <h1 className="text-5xl lg:text-7xl font-black leading-tight">
                    Você Conhece as
                    <span className="block text-yellow-300">Lendas do Flu?</span>
                  </h1>
                  
                  <p className="text-xl lg:text-2xl text-white/90 leading-relaxed max-w-xl">
                    Desafie seu conhecimento tricolor! Veja a foto, adivinhe o jogador e prove que é um verdadeiro fluminense.
                  </p>
                </div>

                {/* Social Proof */}
                <div className="flex items-center gap-6 text-white/80">
                  <div className="flex items-center gap-2">
                    <UsersIcon className="w-5 h-5" />
                    <span className="text-lg font-semibold">{stats?.activePlayers?.toLocaleString() || '567'}+</span>
                    <span>jogadores</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <GamepadIcon className="w-5 h-5" />
                    <span className="text-lg font-semibold">{stats?.totalMatches?.toLocaleString() || '1.234'}+</span>
                    <span>partidas</span>
                  </div>
                </div>

                {/* Call to Actions */}
                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <Button 
                    size="lg" 
                    className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold px-8 py-4 rounded-xl text-lg shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
                    asChild
                  >
                    <Link to="/select-mode" className="flex items-center gap-3">
                      <PlayIcon className="w-6 h-6" />
                      Jogar Agora - Grátis
                    </Link>
                  </Button>
                  
                  <Button 
                    size="lg" 
                    variant="outline"
                    className="border-white/30 text-white hover:bg-white/10 font-semibold px-8 py-4 rounded-xl text-lg backdrop-blur-sm"
                    asChild
                  >
                    <Link to="#ranking" className="flex items-center gap-3">
                      <TrophyIcon className="w-5 h-5" />
                      Ver Ranking
                    </Link>
                  </Button>
                </div>

                {/* Trust Indicators */}
                <div className="flex items-center gap-4 pt-6 text-white/70 text-sm">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span>100% Gratuito</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span>Sem cadastro obrigatório</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span>Jogue no celular</span>
                  </div>
                </div>
              </div>
              
              {/* Image Side */}
              <div className="relative flex justify-center lg:justify-end">
                <div className="relative">
                  {/* Glow Effect */}
                  <div className="absolute inset-0 bg-yellow-300/20 rounded-full blur-3xl scale-150"></div>
                  
                  {/* Main Image Container */}
                  <div className="relative w-80 h-80 lg:w-96 lg:h-96">
                    <div className="absolute inset-0 bg-white/10 rounded-3xl backdrop-blur-sm border border-white/20"></div>
                    <img 
                      src="/lovable-uploads/1b089617-8fa2-440f-ab41-5192f292f5f3.png" 
                      alt="Desafio: Adivinhe o jogador do Fluminense" 
                      className="relative w-full h-full object-contain p-8 drop-shadow-2xl"
                    />
                    
                    {/* Floating Elements */}
                    <div className="absolute -top-4 -right-4 bg-yellow-500 text-black px-4 py-2 rounded-full font-bold text-sm shadow-lg animate-bounce">
                      Quem é?
                    </div>
                    
                    <div className="absolute -bottom-2 -left-4 bg-white/90 text-flu-grena px-4 py-2 rounded-full font-semibold text-sm shadow-lg">
                      Lenda Tricolor
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Ranking Section */}
        <section id="ranking" className="py-24 bg-white relative">
          <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-flu-grena/5 to-transparent"></div>
          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center mb-16">
              <div className="flex items-center justify-center gap-4 mb-6">
                <img 
                  src="/lovable-uploads/0aa3609f-0584-4bf4-8303-e03f50f7e131.png" 
                  alt="Fluminense FC" 
                  className="w-12 h-12 object-contain"
                />
                <h2 className="text-5xl font-black text-flu-grena">
                  TOP 10 TRICOLOR
                </h2>
              </div>
              <p className="text-2xl text-gray-600 font-medium">
                Os maiores conhecedores das lendas do Fluminense
              </p>
            </div>
            <PlayerRanking />
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-24 bg-gradient-to-br from-flu-grena via-flu-verde to-flu-grena text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center mb-16">
              <div className="flex items-center justify-center gap-4 mb-6">
                <img 
                  src="/lovable-uploads/0aa3609f-0584-4bf4-8303-e03f50f7e131.png" 
                  alt="Fluminense FC" 
                  className="w-12 h-12 object-contain drop-shadow-lg"
                />
                <h2 className="text-4xl font-black">ESTATÍSTICAS DO JOGO</h2>
              </div>
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
                src="/lovable-uploads/0aa3609f-0584-4bf4-8303-e03f50f7e131.png" 
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
