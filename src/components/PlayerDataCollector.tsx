
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
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const collectData = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    
    try {
      toast({
        title: "Coletando dados",
        description: "Buscando jogadores do Fluminense desde 1995...",
      });

      console.log("Invocando Edge Function collect-players-data...");
      const { data, error } = await supabase.functions.invoke('collect-players-data');
      
      if (error) {
        console.error("Erro retornado pela edge function:", error);
        throw new Error(error.message || "Erro ao chamar a função de coleta de dados");
      }

      if (!data || !data.players) {
        console.error("Formato de resposta inesperado:", data);
        throw new Error("Resposta da função de coleta de dados em formato inesperado");
      }

      console.log(`Recebidos ${data.players.length} jogadores da Edge Function`);
      setPlayers(data.players);
      
      toast({
        title: "Sucesso!",
        description: `Coletados dados de ${data.players.length} jogadores`,
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
    collectData();
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

      {players.length > 0 && !errorMessage && (
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
