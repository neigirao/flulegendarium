
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { User, UserPlus, Mail, Lock } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface GameAuthSelectionProps {
  onGuestPlay: () => void;
  onAuthenticatedPlay: () => void;
}

export const GameAuthSelection = ({ onGuestPlay, onAuthenticatedPlay }: GameAuthSelectionProps) => {
  const { user, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    try {
      const { error } = await signInWithGoogle();
      if (error) {
        toast.error("Erro ao fazer login com Google: " + error.message);
      } else {
        toast.success("Login realizado com sucesso!");
        onAuthenticatedPlay();
      }
    } catch (err) {
      toast.error("Erro ao conectar com Google. Tente novamente.");
    } finally {
      setIsGoogleLoading(false);
    }
  };

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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Opção Login com Google */}
        <Card className="shadow-2xl border-0 bg-white relative overflow-hidden hover:scale-105 transition-transform duration-300">
          <CardHeader className="text-center pb-4">
            <div className="flex items-center justify-center w-20 h-20 bg-blue-500/10 rounded-full mx-auto mb-6 border-2 border-blue-500/30">
              <User className="w-10 h-10 text-blue-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-flu-grena mb-4">FAZER LOGIN</CardTitle>
            <p className="text-lg text-gray-600 leading-relaxed">
              Entre com sua conta Google para salvar progresso e competir no ranking!
            </p>
          </CardHeader>
          <CardContent className="space-y-3 pt-2">
            <Button
              onClick={handleGoogleSignIn}
              disabled={isGoogleLoading}
              size="lg"
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 text-lg shadow-lg"
            >
              {isGoogleLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                  Conectando...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continuar com Google
                </>
              )}
            </Button>
            <Button
              onClick={() => navigate('/auth')}
              variant="outline"
              size="lg"
              className="w-full border-2 border-flu-grena text-flu-grena hover:bg-flu-grena hover:text-white font-semibold py-4 text-lg"
            >
              <Mail className="mr-3" size={20} />
              Login com Email
            </Button>
          </CardContent>
        </Card>

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
