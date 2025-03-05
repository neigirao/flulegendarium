
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useState } from "react";
import { Player, collectPlayerData } from "@/services/playerDataService";
import { PlayerList } from "./PlayerList";

export const PlayerDataCollector = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [players, setPlayers] = useState<Player[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleCollectData = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    
    try {
      toast({
        title: "Coletando dados",
        description: "Buscando jogadores do Fluminense desde 1995...",
      });

      const collectedPlayers = await collectPlayerData();
      setPlayers(collectedPlayers);
      
      toast({
        title: "Sucesso!",
        description: `Coletados dados de ${collectedPlayers.length} jogadores`,
      });
    } catch (error) {
      console.error('Erro ao coletar dados:', error);
      
      let errorMsg = "Falha ao coletar dados dos jogadores.";
      
      // Tentativa de extrair mensagem de erro mais detalhada
      if (error instanceof Error) {
        errorMsg += " " + error.message;
      } else if (typeof error === 'object' && error !== null) {
        const anyError = error as any;
        if (anyError.message) errorMsg += " " + anyError.message;
        if (anyError.error) errorMsg += " " + anyError.error;
      }
      
      setErrorMessage(errorMsg);
      
      toast({
        variant: "destructive",
        title: "Erro",
        description: errorMsg,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = () => {
    // Limpar o erro e tentar novamente
    setErrorMessage(null);
    handleCollectData();
  };

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
      <Button
        onClick={handleCollectData}
        disabled={isLoading}
        className="w-full"
      >
        {isLoading ? "Coletando dados..." : "Coletar Dados dos Jogadores"}
      </Button>
      
      {errorMessage && (
        <div className="p-4 border border-red-300 bg-red-50 rounded-lg text-red-800">
          <h3 className="font-semibold mb-2">Erro ao coletar dados</h3>
          <p className="text-sm mb-3">{errorMessage}</p>
          <p className="text-sm mb-3">
            Certifique-se que a API Key do OpenAI está configurada corretamente nas configurações da Edge Function.
          </p>
          <Button 
            variant="outline" 
            className="mt-2" 
            onClick={handleRetry}
            size="sm"
          >
            Tentar novamente
          </Button>
        </div>
      )}

      <PlayerList 
        players={players} 
        onImageUpdate={handleImageUpdate} 
      />
    </div>
  );
};
