
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { User, UserPlus } from "lucide-react";

interface GameAuthSelectionProps {
  onGuestPlay: () => void;
  onAuthenticatedPlay: () => void;
}

export const GameAuthSelection = ({ onGuestPlay, onAuthenticatedPlay }: GameAuthSelectionProps) => {
  const { user } = useAuth();

  if (user) {
    return (
      <Card className="max-w-lg mx-auto shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
        <CardHeader className="text-center pb-4">
          <div className="flex items-center justify-center gap-3 mb-4">
            <img 
              src="/lovable-uploads/0aa3609f-0584-4bf4-8303-e03f50f7e131.png" 
              alt="Fluminense FC" 
              className="w-12 h-12 object-contain"
            />
            <CardTitle className="text-2xl font-bold text-flu-grena">Bem-vindo de volta!</CardTitle>
          </div>
          <p className="text-lg text-gray-600 font-medium">
            Olá, {user.user_metadata?.full_name || user.email}
          </p>
        </CardHeader>
        <CardContent className="space-y-4 pt-2">
          <Button
            onClick={onAuthenticatedPlay}
            size="lg"
            className="w-full bg-flu-grena hover:bg-flu-grena/90 text-white font-semibold py-4 text-lg"
          >
            <User className="mr-3" size={24} />
            Começar Jogo
          </Button>
          <Button
            onClick={onGuestPlay}
            variant="outline"
            size="lg"
            className="w-full border-2 border-flu-verde text-flu-verde hover:bg-flu-verde hover:text-white font-semibold py-4 text-lg"
          >
            <UserPlus className="mr-3" size={24} />
            Jogar como Convidado
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="grid grid-cols-1 gap-8">
        {/* Opção Convidado */}
        <Card className="shadow-2xl border-0 bg-white relative overflow-hidden hover:scale-105 transition-transform duration-300">
          <CardHeader className="text-center pb-4">
            <div className="flex items-center justify-center w-20 h-20 bg-flu-verde/10 rounded-full mx-auto mb-6 border-2 border-flu-verde/30">
              <UserPlus className="w-10 h-10 text-flu-verde" />
            </div>
            <CardTitle className="text-2xl font-bold text-flu-grena mb-4">JOGAR COMO CONVIDADO</CardTitle>
            <p className="text-lg text-gray-600 leading-relaxed">
              Jogue rapidamente sem fazer login. Perfeito para testar o jogo ou uma partida rápida!
            </p>
          </CardHeader>
          <CardContent className="pt-2">
            <Button
              onClick={onGuestPlay}
              size="lg"
              className="w-full bg-flu-verde hover:bg-flu-verde/90 text-white font-bold py-4 text-lg shadow-lg"
            >
              <UserPlus className="mr-3" size={24} />
              Jogar Agora
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Informações adicionais */}
      <div className="mt-12 text-center">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-gray-100">
          <div className="flex items-center justify-center gap-4 mb-6">
            <img 
              src="/lovable-uploads/0aa3609f-0584-4bf4-8303-e03f50f7e131.png" 
              alt="Fluminense FC" 
              className="w-12 h-12 object-contain"
            />
            <h3 className="text-2xl font-bold text-flu-grena">Sobre o Jogo</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div>
              <div className="w-16 h-16 bg-flu-grena/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🏆</span>
              </div>
              <h4 className="font-semibold text-flu-grena mb-2">Ranking Global</h4>
              <p className="text-gray-600">Apareça no ranking dos melhores jogadores tricolores</p>
            </div>
            <div>
              <div className="w-16 h-16 bg-flu-verde/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📊</span>
              </div>
              <h4 className="font-semibold text-flu-grena mb-2">Progresso Salvo</h4>
              <p className="text-gray-600">Acompanhe suas estatísticas e melhor pontuação</p>
            </div>
            <div>
              <div className="w-16 h-16 bg-orange-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🎯</span>
              </div>
              <h4 className="font-semibold text-flu-grena mb-2">Sistema Adaptativo</h4>
              <p className="text-gray-600">Dificuldade que se ajusta ao seu conhecimento</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
