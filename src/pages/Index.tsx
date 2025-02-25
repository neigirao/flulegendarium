
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
          <PlayerDataCollector />
        )}
      </div>
    </div>
  );
}
