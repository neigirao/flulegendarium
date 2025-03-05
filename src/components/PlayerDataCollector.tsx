
import { useState } from "react";
import { Player } from "@/services/playerDataService";
import { PlayerList } from "./PlayerList";

export const PlayerDataCollector = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleImageUpdate = (playerId: string, newImageUrl: string) => {
    setPlayers(prevPlayers => 
      prevPlayers.map(player => 
        player.id === playerId 
          ? { ...player, image_url: newImageUrl } 
          : player
      )
    );
  };

  return (
    <div className="space-y-6">
      {errorMessage && (
        <div className="p-4 border border-red-300 bg-red-50 rounded-lg text-red-800">
          <h3 className="font-semibold mb-2">Erro ao coletar dados</h3>
          <p className="text-sm mb-3">{errorMessage}</p>
          <p className="text-sm mb-3">
            Certifique-se que a API Key do OpenAI está configurada corretamente nas configurações da Edge Function.
          </p>
        </div>
      )}

      <PlayerList 
        players={players} 
        onImageUpdate={handleImageUpdate} 
      />
    </div>
  );
};
