
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function Index() {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-center mb-8">Flu Legendarium</h1>
      
      <div className="max-w-md mx-auto space-y-8">
        <Button 
          onClick={() => navigate("/guess-player")} 
          className="w-full"
        >
          Jogar
        </Button>

        <div className="text-center p-6 bg-gray-50 rounded-lg border">
          <p className="text-gray-600 mb-2">
            Dados dos jogadores são gerenciados manualmente.
          </p>
          <p className="text-sm text-gray-500">
            Entre em contato com o administrador para adicionar novos jogadores.
          </p>
        </div>
      </div>
    </div>
  );
}
