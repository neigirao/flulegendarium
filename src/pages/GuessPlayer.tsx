
import { useState, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

interface Player {
  id: string;
  name: string;
  position: string;
  image_url: string;
  year_highlight: string;
  fun_fact: string;
  achievements: string[];
  statistics: {
    gols: number;
    jogos: number;
  };
}

const MAX_ATTEMPTS = 3;

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

const GuessPlayer = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [score, setScore] = useState(0);
  const [guess, setGuess] = useState("");
  const [gameOver, setGameOver] = useState(false);
  const [imageError, setImageError] = useState(false);
  
  // Busca jogadores do Supabase com tratamento de erro melhorado e mais logs
  const { data: players = [], isLoading, error: playersError } = useQuery({
    queryKey: ['players'],
    queryFn: async () => {
      try {
        console.log("Iniciando busca de jogadores...");
        
        const { data, error } = await supabase
          .from('players')
          .select('*');
        
        if (error) {
          console.error("Erro ao buscar jogadores:", error);
          throw error;
        }
        
        console.log("Jogadores carregados com sucesso:", data?.length || 0, "jogadores");
        if (data && data.length > 0) {
          console.log("Primeiro jogador:", data[0].name);
          
          // Corrigir URLs de imagens para todos os jogadores
          const enhancedPlayers = data.map((player: Player) => ({
            ...player,
            image_url: getReliableImageUrl(player)
          }));
          
          // Atualizar as imagens no banco de dados também
          for (const player of enhancedPlayers) {
            try {
              const newUrl = getReliableImageUrl(player);
              if (newUrl !== player.image_url) {
                await supabase
                  .from('players')
                  .update({ image_url: newUrl })
                  .eq('id', player.id);
              }
            } catch (err) {
              console.error(`Erro ao atualizar imagem do jogador ${player.name}:`, err);
            }
          }
          
          return enhancedPlayers;
        }
        return data as Player[];
      } catch (err) {
        console.error("Exceção ao buscar jogadores:", err);
        throw err;
      }
    },
    retry: 3, // Tenta mais vezes em caso de falha
    refetchOnWindowFocus: false, // Evita refetch desnecessário
  });

  useEffect(() => {
    if (players?.length > 0 && !currentPlayer) {
      console.log("Selecionando jogador aleatório entre", players.length, "jogadores");
      selectRandomPlayer();
    }
  }, [players]);

  const selectRandomPlayer = () => {
    if (!players || players.length === 0) {
      console.log("Não há jogadores disponíveis para selecionar");
      return;
    }
    
    const randomIndex = Math.floor(Math.random() * players.length);
    const player = players[randomIndex];
    console.log("Jogador selecionado:", player?.name || "Desconhecido");
    
    // Certificar que temos uma imagem válida
    if (player) {
      player.image_url = getReliableImageUrl(player);
    }
    
    setCurrentPlayer(player);
    setAttempts(0);
    setGuess("");
    setGameOver(false);
    setImageError(false);
  };

  const handleGuess = () => {
    if (!currentPlayer || !guess || gameOver) return;

    // Verificação simplificada do nome (case insensitive)
    const normalizedGuess = guess.toLowerCase().trim();
    const normalizedPlayerName = currentPlayer.name.toLowerCase().trim();
    
    console.log(`Comparando "${normalizedGuess}" com "${normalizedPlayerName}"`);
    
    if (normalizedGuess === normalizedPlayerName) {
      // Acertou!
      const points = (MAX_ATTEMPTS - attempts) * 5;
      setScore((prev) => prev + points);
      
      toast({
        title: "Parabéns!",
        description: `Você acertou e ganhou ${points} pontos!`,
      });
      
      selectRandomPlayer();
    } else {
      // Errou
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      
      // Mostrar dicas conforme as tentativas
      if (newAttempts === 1) {
        toast({
          title: "Dica!",
          description: `Posição: ${currentPlayer.position}`,
        });
      } else if (newAttempts === 2) {
        if (currentPlayer.achievements && currentPlayer.achievements.length > 0) {
          toast({
            title: "Dica!",
            description: `Conquistas: ${currentPlayer.achievements.join(", ")}`,
          });
        } else {
          toast({
            title: "Dica!",
            description: `Ano de destaque: ${currentPlayer.year_highlight}`,
          });
        }
      } else {
        // Game over após 3 tentativas
        setGameOver(true);
        toast({
          variant: "destructive",
          title: "Game Over!",
          description: `O jogador era ${currentPlayer.name}`,
        });
      }
    }
    
    setGuess("");
  };

  // Função para corrigir a imagem de um jogador diretamente no jogo
  const fixPlayerImage = async (player: Player) => {
    try {
      // Encontrar uma imagem alternativa no dicionário de fallbacks
      let newUrl = "";
      
      // Verificar se já temos imagem do jogador nas fallbacks
      for (const [key, url] of Object.entries(playerImagesFallbacks)) {
        if (player.name.includes(key) || key.includes(player.name)) {
          newUrl = url;
          break;
        }
      }
      
      // Se não encontramos, usar a imagem padrão
      if (!newUrl) {
        newUrl = defaultImage;
      }
      
      // Atualizar no banco de dados
      await supabase
        .from('players')
        .update({ image_url: newUrl })
        .eq('id', player.id);
      
      // Atualizar o jogador atual se for o mesmo
      if (currentPlayer && currentPlayer.id === player.id) {
        setCurrentPlayer({
          ...currentPlayer,
          image_url: newUrl
        });
        setImageError(false);
      }
      
      toast({
        title: "Imagem corrigida",
        description: "A imagem do jogador foi atualizada.",
      });
    } catch (err) {
      console.error("Erro ao corrigir imagem:", err);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível corrigir a imagem."
      });
    }
  };

  if (isLoading) {
    return <div className="text-center p-8">Carregando jogadores...</div>;
  }

  if (playersError) {
    console.error("Erro exibido na UI:", playersError);
    return (
      <div className="text-center p-8">
        <p className="text-red-500 font-semibold mb-4">Erro ao carregar jogadores.</p>
        <p className="text-sm text-gray-600 mb-4">
          {playersError instanceof Error ? playersError.message : "Erro desconhecido"}
        </p>
        <pre className="bg-gray-100 p-4 rounded text-xs overflow-auto max-h-48 mb-4">
          {JSON.stringify(playersError, null, 2)}
        </pre>
        <button 
          onClick={() => navigate("/")}
          className="bg-flu-grena text-white px-4 py-2 rounded-lg"
        >
          Voltar
        </button>
      </div>
    );
  }

  if (!players || players.length === 0) {
    return (
      <div className="text-center p-8">
        <p className="mb-4">Nenhum jogador cadastrado ainda.</p>
        <p className="text-sm text-gray-600 mb-4">
          Adicione jogadores na página inicial para começar a jogar.
        </p>
        <button 
          onClick={() => navigate("/")}
          className="bg-flu-grena text-white px-4 py-2 rounded-lg"
        >
          Voltar
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-flu-verde to-white p-4">
      <div className="container mx-auto max-w-4xl">
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate("/")}
            className="flex items-center text-flu-grena hover:opacity-80"
          >
            <ArrowLeft className="mr-2" />
            Voltar
          </button>
          <div className="text-flu-grena font-semibold">
            {score} pontos
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6 shadow-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-flu-grena mb-2">
              Adivinhe o Jogador
            </h1>
            <p className="text-gray-600">Use apelidos ou nomes oficiais!</p>
            <p className="text-sm text-gray-500 mt-2">
              Total de jogadores: {players ? players.length : 0}
            </p>
          </div>

          {currentPlayer && (
            <div className="space-y-6">
              <div className="relative aspect-video rounded-lg overflow-hidden">
                {imageError ? (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <div className="text-center p-4">
                      <p className="text-gray-600 mb-2">Erro ao carregar imagem</p>
                      <button
                        onClick={() => currentPlayer && fixPlayerImage(currentPlayer)}
                        className="bg-flu-grena text-white px-4 py-2 rounded-lg text-sm"
                      >
                        Corrigir imagem
                      </button>
                    </div>
                  </div>
                ) : (
                  <img
                    src={currentPlayer.image_url || defaultImage}
                    alt="Jogador"
                    className="w-full h-full object-cover transition-all duration-500"
                    onError={(e) => {
                      console.error("Erro ao carregar imagem:", e);
                      // Marcar que houve erro na imagem
                      setImageError(true);
                      // Corrigir a imagem na base de dados
                      if (currentPlayer) {
                        fixPlayerImage(currentPlayer);
                      }
                    }}
                  />
                )}
                <button
                  onClick={() => currentPlayer && fixPlayerImage(currentPlayer)}
                  className="absolute top-2 right-2 bg-white/80 p-2 rounded-full shadow-md hover:bg-white"
                  title="Corrigir imagem"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                  </svg>
                </button>
              </div>

              <div className="flex gap-4">
                <input
                  type="text"
                  value={guess}
                  onChange={(e) => setGuess(e.target.value)}
                  placeholder="Nome ou apelido do jogador..."
                  className="flex-1 px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-flu-grena"
                  onKeyDown={(e) => e.key === "Enter" && handleGuess()}
                  disabled={gameOver}
                />
                <button
                  onClick={handleGuess}
                  disabled={!guess || gameOver}
                  className="bg-flu-grena text-white px-6 py-2 rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Adivinhar
                </button>
              </div>

              {gameOver && (
                <div className="text-center mt-4">
                  <button
                    onClick={selectRandomPlayer}
                    className="bg-flu-grena text-white px-6 py-2 rounded-lg hover:opacity-90"
                  >
                    Próximo Jogador
                  </button>
                </div>
              )}

              <div className="text-sm text-gray-600">
                <p>Tentativas restantes: {MAX_ATTEMPTS - attempts}</p>
                <p>Dicas desbloqueadas: {attempts}/{MAX_ATTEMPTS}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GuessPlayer;
