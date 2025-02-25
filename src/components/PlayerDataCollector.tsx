
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";
import { useState } from "react";

interface Player {
  name: string;
  position: string;
  funFact: string;
  achievements: string[];
}

export const PlayerDataCollector = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [players, setPlayers] = useState<Player[]>([]);

  const collectData = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('collect-players-data');
      
      if (error) throw error;

      setPlayers(data.players);
      toast({
        title: "Sucesso!",
        description: `Coletados dados de ${data.players.length} jogadores`,
      });
    } catch (error) {
      console.error('Erro ao coletar dados:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Falha ao coletar dados dos jogadores. " + (error instanceof Error ? error.message : ''),
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Button
        onClick={collectData}
        disabled={isLoading}
        className="w-full"
      >
        {isLoading ? "Coletando dados..." : "Coletar Dados dos Jogadores"}
      </Button>

      {players.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Jogadores Coletados</h2>
          <div className="grid gap-4">
            {players.map((player, index) => (
              <div 
                key={index}
                className="p-4 rounded-lg border bg-card text-card-foreground shadow-sm"
              >
                <h3 className="text-lg font-semibold">{player.name}</h3>
                <p className="text-sm text-muted-foreground">Posição: {player.position}</p>
                <p className="mt-2">{player.funFact}</p>
                {player.achievements.length > 0 && (
                  <div className="mt-2">
                    <p className="font-medium">Conquistas:</p>
                    <ul className="list-disc list-inside text-sm">
                      {player.achievements.map((achievement, i) => (
                        <li key={i}>{achievement}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
