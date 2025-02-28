
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";
import { useState } from "react";

interface Player {
  id: string;
  name: string;
  position: string;
  image_url: string;
  fun_fact: string;
  achievements: string[];
  year_highlight: string;
  statistics: {
    gols: number;
    jogos: number;
  };
}

export const PlayerDataCollector = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [players, setPlayers] = useState<Player[]>([]);

  const collectData = async () => {
    setIsLoading(true);
    try {
      toast({
        title: "Coletando dados",
        description: "Buscando jogadores do Fluminense desde 1995...",
      });

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
          <div className="grid gap-4 md:grid-cols-2">
            {players.map((player) => (
              <div 
                key={player.id}
                className="p-4 rounded-lg border bg-card text-card-foreground shadow-sm"
              >
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="w-full sm:w-20 h-20 rounded-md overflow-hidden shrink-0">
                    <img 
                      src={player.image_url} 
                      alt={player.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = "/placeholder.svg";
                      }}
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold">{player.name}</h3>
                    <p className="text-sm text-muted-foreground">Posição: {player.position}</p>
                    <p className="text-sm text-muted-foreground">Ano de destaque: {player.year_highlight}</p>
                    <p className="mt-2 text-sm">{player.fun_fact}</p>
                    {player.statistics && (
                      <p className="text-sm mt-1">
                        Estatísticas: {player.statistics.gols} gols em {player.statistics.jogos} jogos
                      </p>
                    )}
                    {player.achievements && player.achievements.length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs font-medium">Conquistas:</p>
                        <ul className="list-disc list-inside text-xs">
                          {player.achievements.map((achievement, i) => (
                            <li key={i}>{achievement}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
