
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Trophy } from "lucide-react";
import { RankingDisplay } from "@/components/guess-game/RankingDisplay";
import { useState } from "react";

export default function Index() {
  const navigate = useNavigate();
  const [showRanking, setShowRanking] = useState(true);

  return (
    <div className="min-h-screen bg-flu-stripes">
      <div className="container mx-auto px-4 py-8 relative">
        <div className="max-w-md mx-auto bg-white/90 backdrop-blur-sm rounded-xl shadow-xl p-8 space-y-8">
          <div className="flex flex-col items-center">
            <img 
              src="/lovable-uploads/efaf362c-8726-4049-98bc-ebb26dcdd4e1.png" 
              alt="Fluminense Logo" 
              className="w-32 h-auto mb-4 animate-float" 
            />
            <h1 className="text-4xl font-bold text-flu-grena text-center">Flu Legendarium</h1>
            <p className="text-flu-verde mt-2 text-center">Teste seus conhecimentos sobre os ídolos tricolores</p>
          </div>
          
          <div className="space-y-8">
            <Button 
              onClick={() => navigate("/guess-player")} 
              className="w-full bg-flu-grena hover:bg-flu-grena/90 text-white font-bold py-3"
            >
              <Trophy className="mr-2 h-5 w-5" />
              Jogar Agora
            </Button>

            <Button 
              onClick={() => setShowRanking(prev => !prev)} 
              className="w-full bg-flu-verde hover:bg-flu-verde/90 text-white font-bold py-3"
            >
              {showRanking ? "Ocultar Ranking" : "Mostrar Ranking"}
            </Button>

            {showRanking && <RankingDisplay />}

            <div className="text-center p-6 bg-flu-verde/10 rounded-lg border border-flu-verde/30">
              <p className="text-flu-verde font-medium mb-2">
                Dados dos jogadores são gerenciados manualmente.
              </p>
              <p className="text-sm text-gray-600">
                Entre em contato com o administrador para adicionar novos jogadores.
              </p>
            </div>
            
            <div className="text-center text-xs text-gray-500">
              <p>© 2024 Flu Legendarium</p>
              <p>Não afiliado oficialmente ao Fluminense F.C.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
