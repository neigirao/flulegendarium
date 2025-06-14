
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
      <StructuredData />
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm py-4 sticky top-0 z-50">
          <div className="container mx-auto px-4 flex items-center justify-between">
            <Link to="/" className="text-2xl font-bold text-flu-grena">
              Lendas do Flu
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
        <section className="relative py-12 px-4 bg-gradient-to-r from-flu-verde to-flu-grena overflow-hidden">
          <div className="container mx-auto">
            <div className="flex items-center justify-between">
              <div className="flex-1 text-white">
                <h1 className="text-4xl md:text-5xl font-bold mb-4">
                  Desafie-se no<br />
                  Lendas do Flu
                </h1>
                <p className="text-xl mb-4 opacity-90">
                  Descubra se você conhece os maiores<br />
                  ídolos do Fluzão!
                </p>
                <p className="text-lg mb-8 opacity-80">
                  Veja a foto, adivinhe o jogador<br />
                  e suba no ranking tricolor!
                </p>
                
                <div className="flex gap-4">
                  <Button 
                    size="lg" 
                    className="bg-white text-flu-grena hover:bg-gray-100 font-semibold px-8 py-3 rounded-lg"
                    asChild
                  >
                    <Link to="/select-mode">
                      Começar Jogo
                    </Link>
                  </Button>
                  <Button 
                    size="lg" 
                    variant="outline"
                    className="border-white text-white hover:bg-white hover:text-flu-grena font-semibold px-8 py-3 rounded-lg"
                    asChild
                  >
                    <Link to="#ranking">
                      Ver Ranking
                    </Link>
                  </Button>
                </div>
              </div>
              
              <div className="hidden md:block flex-1">
                <div className="relative w-80 h-80 mx-auto">
                  <div className="absolute inset-0 bg-white/20 rounded-lg backdrop-blur-sm flex items-center justify-center">
                    <div className="w-64 h-64 bg-gradient-to-br from-flu-grena to-flu-verde rounded-lg flex items-center justify-center relative overflow-hidden">
                      <div className="text-white text-8xl font-bold opacity-50">?</div>
                      <div className="absolute inset-0 bg-black/10"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Ranking Section */}
        <section id="ranking" className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-flu-grena mb-8 text-center">
              Ranking dos Tricolores
            </h2>
            <PlayerRanking />
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-12 bg-gray-800 text-white">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div className="flex flex-col items-center">
                <div className="flex items-center justify-center w-16 h-16 bg-flu-verde rounded-full mb-4">
                  <GamepadIcon className="w-8 h-8 text-white" />
                </div>
                <p className="text-4xl font-bold mb-2">
                  {stats?.totalMatches?.toLocaleString() || '1234'}
                </p>
                <p className="text-gray-300">partidas jogadas</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="flex items-center justify-center w-16 h-16 bg-flu-verde rounded-full mb-4">
                  <UsersIcon className="w-8 h-8 text-white" />
                </div>
                <p className="text-4xl font-bold mb-2">
                  {stats?.activePlayers?.toLocaleString() || '5678'}
                </p>
                <p className="text-gray-300">jogadores ativos</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="flex items-center justify-center w-16 h-16 bg-yellow-500 rounded-full mb-4">
                  <AwardIcon className="w-8 h-8 text-white" />
                </div>
                <p className="text-4xl font-bold mb-2">
                  {stats?.highestScore?.toLocaleString() || '9101'}
                </p>
                <p className="text-gray-300">Recorde: 9101</p>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-flu-grena mb-8 text-center">
              Funcionalidades
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="bg-white rounded-lg p-6 text-center shadow-sm">
                <div className="flex items-center justify-center w-16 h-16 bg-flu-grena rounded-full mx-auto mb-4">
                  <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                    <div className="w-4 h-4 bg-flu-grena rounded-full"></div>
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-flu-grena mb-2">
                  Desafie Amigos
                </h3>
                <p className="text-gray-700">
                  Compartilhe e jogue junto
                </p>
              </div>
              
              {/* Feature 2 */}
              <div className="bg-white rounded-lg p-6 text-center shadow-sm">
                <div className="flex items-center justify-center w-16 h-16 bg-flu-verde rounded-full mx-auto mb-4">
                  <div className="w-8 h-8 bg-white rounded-full"></div>
                </div>
                <h3 className="text-xl font-semibold text-flu-grena mb-2">
                  Ranking Online
                </h3>
                <p className="text-gray-700">
                  Veja sua colocação no mundo tricolor
                </p>
              </div>
              
              {/* Feature 3 */}
              <div className="bg-white rounded-lg p-6 text-center shadow-sm relative">
                <div className="absolute top-4 right-4">
                  <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                    NEW
                  </span>
                </div>
                <div className="flex items-center justify-center w-16 h-16 bg-orange-500 rounded-full mx-auto mb-4">
                  <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                    <div className="w-4 h-4 bg-orange-500 rounded-full"></div>
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-flu-grena mb-2">
                  Atualizações Semanais
                </h3>
                <p className="text-gray-700">
                  Novos jogadores e desafios toda semana!
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-flu-grena py-8 text-white text-center">
          <div className="container mx-auto px-4">
            <p>&copy; 2024 Lendas do Flu. Todos os direitos reservados.</p>
          </div>
        </footer>
      </div>
    </>
  );
}
