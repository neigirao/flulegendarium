
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { PlayerRanking } from "@/components/PlayerRanking";

export default function Index() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-flu-verde/50 to-white">
      {/* Header */}
      <header className="bg-white shadow-md py-4">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold text-flu-grena">
            Flu Legendarium
          </Link>
          <nav>
            <ul className="flex space-x-6">
              <li>
                <Link to="/" className="text-flu-verde hover:text-flu-grena">
                  Início
                </Link>
              </li>
              <li>
                <Link to="/guess-player" className="text-flu-verde hover:text-flu-grena">
                  Jogar
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-flu-grena mb-6 flu-shadow">
            Flu Legendarium
          </h1>
          <p className="text-xl md:text-2xl text-flu-verde mb-8 font-medium">
            Teste seus conhecimentos sobre os ídolos tricolores!
          </p>
          <p className="text-lg text-gray-700 mb-8 max-w-2xl mx-auto">
            Descubra se você realmente conhece as lendas do Fluminense. 
            Adivinhe o jogador pela foto e prove que é um verdadeiro tricolor!
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Button 
              size="lg" 
              className="bg-flu-grena text-white font-semibold flu-shadow hover:scale-105 transition-transform"
              asChild
            >
              <Link to="/guess-player">
                Começar Jogo
              </Link>
            </Button>
            
            <Button 
              variant="outline" 
              size="lg" 
              className="border-flu-verde text-flu-verde hover:bg-flu-verde hover:text-white font-semibold"
              asChild
            >
              <Link to="/admin/login">
                Área Admin
              </Link>
            </Button>
          </div>

          {/* Credenciais de teste */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 max-w-md mx-auto">
            <h3 className="font-semibold text-yellow-800 mb-2">🔧 Credenciais de Teste (Admin)</h3>
            <div className="text-sm text-yellow-700">
              <p><strong>Usuário:</strong> admin</p>
              <p><strong>Senha:</strong> admin123</p>
            </div>
          </div>
        </div>
      </section>

      {/* Ranking Section */}
      <section className="py-16 bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-flu-grena mb-8 text-center">
            Ranking dos Tricolores
          </h2>
          <PlayerRanking />
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-flu-verde/10">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-flu-grena mb-8">
            Estatísticas do Jogo
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <p className="text-5xl font-bold text-flu-verde">1234</p>
              <p className="text-lg text-gray-700">Partidas Jogadas</p>
            </div>
            <div>
              <p className="text-5xl font-bold text-flu-verde">5678</p>
              <p className="text-lg text-gray-700">Jogadores Ativos</p>
            </div>
            <div>
              <p className="text-5xl font-bold text-flu-verde">9101</p>
              <p className="text-lg text-gray-700">Recorde de Pontos</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-flu-grena mb-8 text-center">
            Funcionalidades
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold text-flu-grena mb-2">
                Desafie seus amigos
              </h3>
              <p className="text-gray-700">
                Convide seus amigos para ver quem conhece mais sobre o
                Fluminense.
              </p>
            </div>
            {/* Feature 2 */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold text-flu-grena mb-2">
                Ranking Online
              </h3>
              <p className="text-gray-700">
                Compare sua pontuação com outros tricolores apaixonados.
              </p>
            </div>
            {/* Feature 3 */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold text-flu-grena mb-2">
                Atualizações Semanais
              </h3>
              <p className="text-gray-700">
                Novos jogadores e desafios toda semana para você não ficar
                entediado.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-flu-grena py-8 text-white text-center">
        <p>&copy; 2024 Flu Legendarium. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}
