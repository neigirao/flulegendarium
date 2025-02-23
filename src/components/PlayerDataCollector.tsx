
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";
import { useState } from "react";

export const PlayerDataCollector = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const collectData = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('collect-players-data');
      
      if (error) throw error;

      toast({
        title: "Sucesso!",
        description: `Coletados dados de ${data.players.length} jogadores`,
      });
    } catch (error) {
      console.error('Erro ao coletar dados:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Falha ao coletar dados dos jogadores",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4">
      <Button
        onClick={collectData}
        disabled={isLoading}
        className="w-full"
      >
        {isLoading ? "Coletando dados..." : "Coletar Dados dos Jogadores"}
      </Button>
    </div>
  );
};
