
import { Button } from "@/components/ui/button";
import { PlayerDataCollector } from "@/components/PlayerDataCollector";
import { AddPlayerForm } from "@/components/AddPlayerForm";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Index() {
  const navigate = useNavigate();
  const [showAddPlayer, setShowAddPlayer] = useState(false);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-center mb-8">Flu Legendarium</h1>
      
      <div className="max-w-md mx-auto space-y-8">
        <div className="flex gap-4">
          <Button 
            onClick={() => navigate("/guess-player")} 
            className="flex-1"
          >
            Jogar
          </Button>
          <Button 
            onClick={() => setShowAddPlayer(!showAddPlayer)} 
            variant="outline" 
            className="flex-1"
          >
            {showAddPlayer ? "Voltar" : "Adicionar Jogador"}
          </Button>
        </div>

        {showAddPlayer ? (
          <AddPlayerForm />
        ) : (
          <div className="text-center p-6 bg-gray-50 rounded-lg border">
            <p className="text-gray-600 mb-2">
              Dados dos jogadores são gerenciados manualmente.
            </p>
            <p className="text-sm text-gray-500">
              Para adicionar novos jogadores, use o botão "Adicionar Jogador" acima.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
