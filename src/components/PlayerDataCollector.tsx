
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

// URLs confiáveis para jogadores específicos
const playerImagesFallbacks = {
  "Germán Cano": "https://tntsports.com.br/__export/1670800795599/sites/esporteinterativo/img/2022/12/11/gettyimages-1447173498_crop1670800794814.jpg",
  "Fred": "https://s2.glbimg.com/9Lbh2qz19LDtffAJQQwP8OYx3II=/0x0:2000x1333/984x0/smart/filters:strip_icc()/i.s3.glbimg.com/v1/AUTH_bc8228b6673f488aa253bbcb03c80ec5/internal_photos/bs/2022/d/U/aqeGG8S0yAlBPYa4nK3g/agif22071013182553.jpg",
  "Felipe Melo": "https://www.ofutebolero.com.br/__export/1671836222411/sites/elfutbolero/img/2022/12/23/whatsapp_image_2022-12-23_at_18_22_44_crop1671836221785.jpeg",
  "Thiago Silva": "https://assets.goal.com/v3/assets/bltcc7a7ffd2fbf71f5/blt38eff59ed13fff34/60dac1480401cb0ebfa64d18/8aa23e84f5bbad02d6d5dcc9144ae9d8e8c4574e.jpg",
  "Marcelo": "https://pbs.twimg.com/media/Fyvk3Q2XoAIIrij.jpg",
  "Conca": "https://sportbuzz.uol.com.br/media/_versions/conca-fluminense-getty_widelg.jpg",
  "Deco": "https://pbs.twimg.com/media/Fn5QoQGXgAEs8XV.jpg",
  "Romário": "https://sportbuzz.uol.com.br/media/_versions/gettyimages-1151058_widelg.jpg",
  "Ganso": "https://www.estadao.com.br/resizer/1WdpAwkDH08BnCXP-FMkBmIEHe8=/arc-anglerfish-arc2-prod-estadao/public/4L7AWZVKHRAJJCUXNPPX4HL35A.jpg",
  "Fábio": "https://tntsports.com.br/__export/1694550747175/sites/esporteinterativo/img/2023/09/12/fabio-flu.jpg_1216690859.jpg",
  "Nino": "https://s2.glbimg.com/fy5zdRuvzwJuIcAo8v8E0cptPYk=/0x0:2048x1365/984x0/smart/filters:strip_icc()/i.s3.glbimg.com/v1/AUTH_bc8228b6673f488aa253bbcb03c80ec5/internal_photos/bs/2023/w/E/Ae5qy7QS2EGXzFIY5RQQ/img-2915.jpg",
  "Arias": "https://www.ofutebolero.com.br/__export/1675798714386/sites/elfutbolero/img/2023/02/07/jhon_arias_copy_crop1675798713637.jpg"
};

// Imagem de fallback padrão
const defaultImage = "https://uploads.metropoles.com/wp-content/uploads/2023/10/31123243/Fluminense-campeao-Libertadores-2023-12.jpg";

// Função para obter uma URL de imagem confiável
const getReliableImageUrl = (player: Player) => {
  // Tenta encontrar correspondência exata
  if (playerImagesFallbacks[player.name]) {
    return playerImagesFallbacks[player.name];
  }
  
  // Tenta encontrar correspondência parcial
  for (const [key, url] of Object.entries(playerImagesFallbacks)) {
    if (player.name.includes(key) || key.includes(player.name)) {
      return url;
    }
  }
  
  // Verifica se a URL original parece válida
  if (player.image_url && 
      (player.image_url.startsWith('http') || 
       player.image_url.startsWith('https'))) {
    return player.image_url;
  }
  
  // Retorna imagem padrão
  return defaultImage;
};

export const PlayerDataCollector = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [players, setPlayers] = useState<Player[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

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
      
      // Garantir que todos os jogadores tenham uma imagem confiável
      const playersWithImages = data.players.map((player: Player) => ({
        ...player,
        image_url: getReliableImageUrl(player)
      }));
      
      setPlayers(playersWithImages);
      
      // Atualizar as imagens no banco de dados também
      for (const player of playersWithImages) {
        try {
          await supabase
            .from('players')
            .update({ image_url: player.image_url })
            .eq('id', player.id);
        } catch (err) {
          console.error(`Erro ao atualizar imagem do jogador ${player.name}:`, err);
        }
      }
      
      toast({
        title: "Sucesso!",
        description: `Coletados dados de ${playersWithImages.length} jogadores`,
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

  const fixPlayerImage = async (player: Player) => {
    try {
      // Encontrar uma imagem alternativa no dicionário de fallbacks
      let newImageUrl = "";
      
      // Verificar se já temos imagem do jogador nas fallbacks
      for (const [key, url] of Object.entries(playerImagesFallbacks)) {
        if (player.name.includes(key) || key.includes(player.name)) {
          newImageUrl = url;
          break;
        }
      }
      
      // Se não encontramos, usar a imagem padrão
      if (!newImageUrl) {
        newImageUrl = defaultImage;
      }
      
      const { error } = await supabase
        .from('players')
        .update({ image_url: newImageUrl })
        .eq('id', player.id);
      
      if (error) throw error;
      
      // Atualiza a imagem localmente
      setPlayers(prevPlayers => 
        prevPlayers.map(p => 
          p.id === player.id ? { ...p, image_url: newImageUrl } : p
        )
      );
      
      // Remove do registro de erros
      setImageErrors(prev => {
        const newErrors = {...prev};
        delete newErrors[player.id];
        return newErrors;
      });
      
      toast({
        title: "Imagem corrigida",
        description: `A imagem de ${player.name} foi atualizada com sucesso.`,
      });
    } catch (err) {
      console.error(`Erro ao atualizar imagem do jogador ${player.name}:`, err);
      toast({
        variant: "destructive",
        title: "Erro",
        description: `Não foi possível corrigir a imagem de ${player.name}.`,
      });
    }
  };

  const handleImageError = (player: Player) => {
    console.error(`Erro ao carregar imagem para ${player.name}`);
    setImageErrors(prev => ({
      ...prev,
      [player.id]: true
    }));
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
                  <div className="w-full sm:w-20 h-20 rounded-md overflow-hidden shrink-0 relative">
                    {imageErrors[player.id] ? (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <button
                          onClick={() => fixPlayerImage(player)}
                          className="text-xs text-flu-grena p-1"
                        >
                          Corrigir
                        </button>
                      </div>
                    ) : (
                      <img 
                        src={player.image_url || defaultImage} 
                        alt={player.name}
                        className="w-full h-full object-cover"
                        onError={() => handleImageError(player)}
                      />
                    )}
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="absolute top-0 right-0 bg-white/80 w-6 h-6 p-1"
                      onClick={() => fixPlayerImage(player)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                        <path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                      </svg>
                    </Button>
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
