import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { PlayerRanking } from "@/components/PlayerRanking";
import { AuthButton } from "@/components/auth/AuthButton";
import { useAuth } from "@/hooks/useAuth";
import { SEOHead } from "@/components/SEOHead";
import { StructuredData } from "@/components/StructuredData";
import { GamepadIcon, UsersIcon, AwardIcon, PlayIcon, TrophyIcon, StarIcon, Menu, X, Instagram } from "lucide-react";
import { UniversalTouchTarget } from "@/components/mobile/UniversalTouchTarget";
import { useMobileKeyboard } from "@/hooks/use-mobile-keyboard";
import { SafeLoadingBoundary } from "@/components/SafeLoadingBoundary";
import { debugLogger } from "@/utils/debugLogger";

export default function Index() {
  debugLogger.info('Index', 'Página inicial renderizada');

  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [pageReady, setPageReady] = useState(false);
  
  // Mobile keyboard handling
  useMobileKeyboard({
    onKeyboardShow: () => setMobileMenuOpen(false),
    adjustViewport: true
  });

  // Simular carregamento da página
  useEffect(() => {
    debugLogger.info('Index', 'Inicializando página');
    
    const timer = setTimeout(() => {
      setPageReady(true);
      debugLogger.info('Index', 'Página pronta para exibição');
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // Mock stats estáticos (para evitar loops infinitos)
  const mockStats = {
    totalMatches: 1234,
    activePlayers: 567,
    highestScore: 9101
  };

  debugLogger.debug('Index', 'Estado atual', {
    user: !!user,
    pageReady,
    mobileMenuOpen
  });

  if (!pageReady) {
    return (
      <SafeLoadingBoundary name="Home Page">
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="w-8 h-8 animate-spin border-4 border-flu-grena border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-flu-grena font-semibold">Carregando Lendas do Flu...</p>
          </div>
        </div>
      </SafeLoadingBoundary>
    );
  }

  return (
    <>
      <SEOHead 
        title="Lendas do Flu - Quiz Oficial dos Tricolores | Teste seu Conhecimento Fluminense"
        description="🏆 Desafie seus conhecimentos sobre o Fluminense! Adivinhe os jogadores pelas fotos, compete no ranking e prove que é um verdadeiro tricolor. Jogue grátis agora!"
        keywords="quiz fluminense, teste fluminense, jogo fluminense, tricolor, adivinhe jogador fluminense, ranking tricolor, quiz futebol, lendas do flu"
        url="https://flulegendarium.lovable.app/"
        canonical="https://flulegendarium.lovable.app/"
      />
      <StructuredData type="WebSite" />
      <SafeLoadingBoundary name="Main Content">
        <div className="min-h-screen bg-gray-50 full-height-mobile">
          {/* Header */}
          <header className="bg-white shadow-sm py-3 md:py-4 sticky top-0 z-50">
            <div className="container mx-auto px-4 flex items-center justify-between">
              <Link to="/" className="flex items-center gap-2 md:gap-3">
                <img 
                  src="/lovable-uploads/0aa3609f-0584-4bf4-8303-e03f50f7e131.png" 
                  alt="Escudo do Fluminense FC" 
                  className="w-6 h-6 md:w-8 md:h-8 object-contain"
                />
                <span className="text-lg md:text-2xl font-bold text-flu-grena">Lendas do Flu</span>
              </Link>
              
              {/* Desktop Navigation */}
              <nav className="hidden md:flex items-center space-x-6">
                <Link to="/" className="text-flu-verde hover:text-flu-grena transition-colors">
                  Início
                </Link>
                <Link to="/guess-player" className="text-flu-verde hover:text-flu-grena transition-colors">
                  Jogar Quiz
                </Link>
                {user && (
                  <Link to="/profile" className="text-flu-verde hover:text-flu-grena transition-colors">
                    Meu Perfil
                  </Link>
                )}
                <Link to="/faq" className="text-flu-verde hover:text-flu-grena transition-colors">
                  FAQ
                </Link>
                <Link to="/admin-login" className="text-flu-verde hover:text-flu-grena transition-colors">
                  Admin
                </Link>
                <AuthButton />
              </nav>

              {/* Mobile Menu Button */}
              <UniversalTouchTarget
                size="md"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden bg-transparent hover:bg-gray-100"
              >
                {mobileMenuOpen ? (
                  <X className="w-6 h-6 text-flu-grena" />
                ) : (
                  <Menu className="w-6 h-6 text-flu-grena" />
                )}
              </UniversalTouchTarget>
            </div>

            {/* Mobile Navigation */}
            {mobileMenuOpen && (
              <div className="md:hidden bg-white border-t shadow-lg">
                <nav className="container mx-auto px-4 py-4 space-y-2">
                  <UniversalTouchTarget
                    size="lg"
                    className="w-full justify-start text-left hover:bg-gray-50"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Link to="/" className="w-full text-flu-verde hover:text-flu-grena transition-colors">
                      Início
                    </Link>
                  </UniversalTouchTarget>
                  
                  <UniversalTouchTarget
                    size="lg"
                    className="w-full justify-start text-left hover:bg-gray-50"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Link to="/guess-player" className="w-full text-flu-verde hover:text-flu-grena transition-colors">
                      Jogar Quiz
                    </Link>
                  </UniversalTouchTarget>
                  
                  {user && (
                    <UniversalTouchTarget
                      size="lg"
                      className="w-full justify-start text-left hover:bg-gray-50"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Link to="/profile" className="w-full text-flu-verde hover:text-flu-grena transition-colors">
                        Meu Perfil
                      </Link>
                    </UniversalTouchTarget>
                  )}
                  
                  <UniversalTouchTarget
                    size="lg"
                    className="w-full justify-start text-left hover:bg-gray-50"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Link to="/faq" className="w-full text-flu-verde hover:text-flu-grena transition-colors">
                      FAQ
                    </Link>
                  </UniversalTouchTarget>
                  
                  <UniversalTouchTarget
                    size="lg"
                    className="w-full justify-start text-left hover:bg-gray-50"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Link to="/admin-login" className="w-full text-flu-verde hover:text-flu-grena transition-colors">
                      Admin
                    </Link>
                  </UniversalTouchTarget>
                  
                  <div className="pt-2">
                    <AuthButton />
                  </div>
                </nav>
              </div>
            )}
          </header>

          {/* Hero Section */}
          <section className="relative py-12 md:py-16 lg:py-20 px-4 bg-gradient-to-br from-flu-grena via-flu-grena/90 to-flu-verde overflow-hidden min-h-[80vh] md:min-h-[90vh] flex items-center">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-white/5 to-transparent"></div>
            
            <div className="container mx-auto relative z-10">
              <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-center">
                <div className="text-white space-y-6 md:space-y-8 text-center lg:text-left">
                  <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-2 md:px-4 md:py-2 rounded-full text-xs md:text-sm font-medium">
                    <StarIcon className="w-3 h-3 md:w-4 md:h-4 text-yellow-300" />
                    <span>Quiz oficial dos tricolores</span>
                  </div>

                  <div className="space-y-3 md:space-y-4">
                    <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black leading-tight">
                      Você Conhece as
                      <span className="block text-yellow-300">Lendas do Flu?</span>
                    </h1>
                    
                    <p className="text-lg md:text-xl lg:text-2xl text-white/90 leading-relaxed max-w-xl mx-auto lg:mx-0">
                      Desafie seu conhecimento tricolor! Veja a foto, adivinhe o jogador e prove que é um verdadeiro fluminense. 🏆
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 pt-4 justify-center lg:justify-start">
                    <Button 
                      size="lg" 
                      className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold px-6 md:px-8 py-3 md:py-4 rounded-xl text-base md:text-lg shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
                      asChild
                    >
                      <Link to="/guess-player" className="flex items-center gap-2 md:gap-3">
                        <PlayIcon className="w-5 h-5 md:w-6 md:h-6" />
                        Jogar Quiz Agora - Grátis
                      </Link>
                    </Button>
                  </div>
                </div>
                
                <div className="relative flex justify-center mt-8 lg:mt-0 lg:justify-end">
                  <div className="relative">
                    <div className="absolute inset-0 bg-yellow-300/20 rounded-full blur-3xl scale-150"></div>
                    
                    <div className="relative w-64 h-64 sm:w-80 sm:h-80 lg:w-96 lg:h-96">
                      <div className="absolute inset-0 bg-white/10 rounded-3xl backdrop-blur-sm border border-white/20"></div>
                      <img 
                        src="/lovable-uploads/1b089617-8fa2-440f-ab41-5192f292f5f3.png" 
                        alt="Desafio: Adivinhe o jogador do Fluminense - Quiz interativo" 
                        className="relative w-full h-full object-contain p-6 md:p-8 drop-shadow-2xl"
                      />
                      
                      <div className="absolute -top-2 -right-2 md:-top-4 md:-right-4 bg-yellow-500 text-black px-3 py-1 md:px-4 md:py-2 rounded-full font-bold text-xs md:text-sm shadow-lg animate-bounce">
                        Quem é?
                      </div>
                      
                      <div className="absolute -bottom-1 -left-2 md:-bottom-2 md:-left-4 bg-white/90 backdrop-blur-sm rounded-full p-2 md:p-3 shadow-lg border border-white/20">
                        <img 
                          src="/lovable-uploads/0aa3609f-0584-4bf4-8303-e03f50f7e131.png" 
                          alt="Escudo do Fluminense FC" 
                          className="w-6 h-6 md:w-8 md:h-8 object-contain"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Ranking Section */}
          <section id="ranking" className="py-16 md:py-24 bg-white relative">
            <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-flu-grena/5 to-transparent"></div>
            <div className="container mx-auto px-4 relative z-10">
              <div className="text-center mb-12 md:mb-16">
                <div className="flex items-center justify-center gap-3 md:gap-4 mb-4 md:mb-6 flex-wrap">
                  <img 
                    src="/lovable-uploads/0aa3609f-0584-4bf4-8303-e03f50f7e131.png" 
                    alt="Fluminense FC" 
                    className="w-8 h-8 md:w-12 md:h-12 object-contain"
                  />
                  <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-flu-grena">
                    TOP 10 TRICOLOR
                  </h2>
                </div>
                <p className="text-lg md:text-xl lg:text-2xl text-gray-600 font-medium">
                  Os maiores conhecedores das lendas do Fluminense
                </p>
              </div>
              <SafeLoadingBoundary name="Player Ranking" timeout={5000}>
                <PlayerRanking />
              </SafeLoadingBoundary>
            </div>
          </section>

          {/* Stats Section */}
          <section className="py-16 md:py-24 bg-gradient-to-br from-flu-gr-ena via-flu-verde to-flu-grena text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="container mx-auto px-4 relative z-10">
              <div className="text-center mb-12 md:mb-16">
                <div className="flex items-center justify-center gap-3 md:gap-4 mb-4 md:mb-6 flex-wrap">
                  <img 
                    src="/lovable-uploads/0aa3609f-0584-4bf4-8303-e03f50f7e131.png" 
                    alt="Fluminense FC" 
                    className="w-8 h-8 md:w-12 md:h-12 object-contain drop-shadow-lg"
                  />
                  <h2 className="text-2xl md:text-3xl lg:text-4xl font-black">ESTATÍSTICAS DO JOGO</h2>
                </div>
                <p className="text-lg md:text-xl opacity-90">Acompanhe os números da nossa comunidade tricolor</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                <div className="text-center p-6 md:p-8 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
                  <div className="flex items-center justify-center w-16 h-16 md:w-20 md:h-20 bg-white/20 rounded-full mx-auto mb-4 md:mb-6">
                    <GamepadIcon className="w-8 h-8 md:w-10 md:h-10 text-white" />
                  </div>
                  <p className="text-3xl md:text-4xl lg:text-5xl font-bold mb-2 md:mb-3">
                    {mockStats.totalMatches.toLocaleString()}
                  </p>
                  <p className="text-lg md:text-xl opacity-80">partidas jogadas</p>
                </div>
                
                <div className="text-center p-6 md:p-8 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
                  <div className="flex items-center justify-center w-16 h-16 md:w-20 md:h-20 bg-white/20 rounded-full mx-auto mb-4 md:mb-6">
                    <UsersIcon className="w-8 h-8 md:w-10 md:h-10 text-white" />
                  </div>
                  <p className="text-3xl md:text-4xl lg:text-5xl font-bold mb-2 md:mb-3">
                    {mockStats.activePlayers.toLocaleString()}
                  </p>
                  <p className="text-lg md:text-xl opacity-80">tricolores ativos</p>
                </div>
                
                <div className="text-center p-6 md:p-8 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
                  <div className="flex items-center justify-center w-16 h-16 md:w-20 md:h-20 bg-yellow-400/80 rounded-full mx-auto mb-4 md:mb-6">
                    <AwardIcon className="w-8 h-8 md:w-10 md:h-10 text-white" />
                  </div>
                  <p className="text-3xl md:text-4xl lg:text-5xl font-bold mb-2 md:mb-3">
                    {mockStats.highestScore.toLocaleString()}
                  </p>
                  <p className="text-lg md:text-xl opacity-80">maior pontuação</p>
                </div>
              </div>
            </div>
          </section>

          {/* Features Section */}
          <section className="py-16 md:py-20 bg-gray-50">
            <div className="container mx-auto px-4">
              <div className="text-center mb-12 md:mb-16">
                <h2 className="text-3xl md:text-4xl font-bold text-flu-grena mb-4">
                  Por que jogar Lendas do Flu?
                </h2>
                <p className="text-lg md:text-xl text-gray-600">
                  Descubra tudo que nosso quiz oferece para você
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                <div className="bg-white rounded-2xl p-6 md:p-8 text-center shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
                  <div className="flex items-center justify-center w-16 h-16 md:w-20 md:h-20 bg-flu-grena rounded-full mx-auto mb-4 md:mb-6">
                    <div className="w-8 h-8 md:w-10 md:h-10 bg-white rounded-full flex items-center justify-center">
                      <div className="w-4 h-4 md:w-5 md:h-5 bg-flu-grena rounded-full"></div>
                    </div>
                  </div>
                  <h3 className="text-xl md:text-2xl font-semibold text-flu-grena mb-3 md:mb-4">
                    Desafie Amigos
                  </h3>
                  <p className="text-gray-600 text-base md:text-lg leading-relaxed">
                    Compartilhe seus resultados e veja quem conhece mais sobre as lendas tricolores
                  </p>
                </div>
                
                <div className="bg-white rounded-2xl p-6 md:p-8 text-center shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
                  <div className="flex items-center justify-center w-16 h-16 md:w-20 md:h-20 bg-flu-verde rounded-full mx-auto mb-4 md:mb-6">
                    <div className="w-8 h-8 md:w-10 md:h-10 bg-white rounded-full flex items-center justify-center">
                      <AwardIcon className="w-4 h-4 md:w-5 md:h-5 text-flu-verde" />
                    </div>
                  </div>
                  <h3 className="text-xl md:text-2xl font-semibold text-flu-grena mb-3 md:mb-4">
                    Ranking Global
                  </h3>
                  <p className="text-gray-600 text-base md:text-lg leading-relaxed">
                    Compete com tricolores do mundo todo e mostre seu conhecimento
                  </p>
                </div>
                
                <div className="bg-white rounded-2xl p-6 md:p-8 text-center shadow-lg hover:shadow-xl transition-shadow border border-gray-100 relative">
                  <div className="absolute top-4 md:top-6 right-4 md:right-6">
                    <span className="bg-orange-500 text-white text-xs md:text-sm px-2 md:px-3 py-1 rounded-full font-bold">
                      NOVO
                    </span>
                  </div>
                  <div className="flex items-center justify-center w-16 h-16 md:w-20 md:h-20 bg-orange-500 rounded-full mx-auto mb-4 md:mb-6">
                    <div className="w-8 h-8 md:w-10 md:h-10 bg-white rounded-full flex items-center justify-center">
                      <div className="w-4 h-4 md:w-5 md:h-5 bg-orange-500 rounded-full"></div>
                    </div>
                  </div>
                  <h3 className="text-xl md:text-2xl font-semibold text-flu-grena mb-3 md:mb-4">
                    Sempre Atualizado
                  </h3>
                  <p className="text-gray-600 text-base md:text-lg leading-relaxed">
                    Novos jogadores e desafios adicionados regularmente
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Footer */}
          <footer className="bg-flu-grena py-8 md:py-12 text-white">
            <div className="container mx-auto px-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
                <div className="text-center md:text-left">
                  <div className="flex items-center justify-center md:justify-start gap-3 md:gap-4 mb-4 md:mb-6">
                    <img 
                      src="/lovable-uploads/0aa3609f-0584-4bf4-8303-e03f50f7e131.png" 
                      alt="Fluminense FC" 
                      className="w-8 h-8 md:w-10 md:h-10"
                    />
                    <span className="text-xl md:text-2xl font-bold">Lendas do Flu</span>
                  </div>
                  <p className="text-base md:text-lg opacity-80 max-w-sm mx-auto md:mx-0">
                    O quiz oficial dos tricolores. Teste seus conhecimentos sobre as lendas do Fluminense!
                  </p>
                </div>

                <div className="text-center">
                  <h3 className="text-lg md:text-xl font-semibold mb-4">Siga-nos</h3>
                  <div className="flex justify-center">
                    <a 
                      href="https://www.instagram.com/jogolendasdoflu" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-300 hover:scale-105 shadow-lg"
                    >
                      <Instagram className="w-5 h-5" />
                      <span className="font-semibold">@jogolendasdoflu</span>
                    </a>
                  </div>
                  <p className="text-sm opacity-70 mt-3">
                    💬 Canal oficial de feedback e novidades
                  </p>
                </div>

                <div className="text-center md:text-right">
                  <h3 className="text-lg md:text-xl font-semibold mb-4">Links Rápidos</h3>
                  <div className="space-y-2">
                    <Link to="/guess-player" className="block text-white/80 hover:text-white transition-colors">
                      Jogar Quiz
                    </Link>
                    <Link to="/faq" className="block text-white/80 hover:text-white transition-colors">
                      FAQ
                    </Link>
                    <Link to="/profile" className="block text-white/80 hover:text-white transition-colors">
                      Meu Perfil
                    </Link>
                  </div>
                </div>
              </div>

              <div className="border-t border-white/20 mt-8 pt-6 text-center">
                <p className="text-base md:text-lg opacity-80">
                  &copy; 2024 Lendas do Flu. Feito com ❤️ pelos tricolores.
                </p>
              </div>
            </div>
          </footer>
        </div>
      </SafeLoadingBoundary>
    </>
  );
}
