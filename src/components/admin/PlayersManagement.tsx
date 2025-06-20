
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Edit, Search, Trash2 } from "lucide-react";
import { Player } from "@/types/guess-game";
import { EditPlayerForm } from "./EditPlayerForm";
import { useToast } from "@/components/ui/use-toast";
import { Database } from "@/integrations/supabase/types";
import { convertStatistics } from "@/utils/statistics-converter";

type PlayerRow = Database['public']['Tables']['players']['Row'];

export const PlayersManagement = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);

  const { data: players = [], isLoading, refetch } = useQuery({
    queryKey: ['admin-players'],
    queryFn: async () => {
      console.log('🔍 === CARREGANDO JOGADORES PARA ADMIN ===');
      
      const { data, error } = await supabase
        .from('players')
        .select('*')
        .order('name');
      
      if (error) {
        console.error('❌ Erro ao carregar jogadores:', error);
        throw error;
      }
      
      console.log('📊 Dados brutos dos jogadores do banco:', data?.length || 0, 'jogadores');
      
      // Log detalhado dos dados vindos diretamente do banco
      data?.forEach((player, index) => {
        console.log(`${index + 1}. ${player.name}:`);
        console.log(`   - ID: ${player.id}`);
        console.log(`   - Dificuldade RAW do banco: "${player.difficulty_level}"`);
        console.log(`   - Tipo da dificuldade: ${typeof player.difficulty_level}`);
      });
      
      // Convert Supabase row data to Player type with robust statistics conversion
      const convertedPlayers = (data || []).map((player: PlayerRow): Player => {
        const convertedPlayer = {
          id: player.id,
          name: player.name,
          position: player.position,
          image_url: player.image_url,
          year_highlight: player.year_highlight || '',
          fun_fact: player.fun_fact || '',
          achievements: player.achievements || [],
          nicknames: player.nicknames || [],
          statistics: convertStatistics(player.statistics),
          difficulty_level: player.difficulty_level as any || 'medio',
          difficulty_score: player.difficulty_score || 50,
          difficulty_confidence: player.difficulty_confidence || 0,
          total_attempts: player.total_attempts || 0,
          correct_attempts: player.correct_attempts || 0,
          average_guess_time: player.average_guess_time || 30000
        };
        
        console.log(`✅ Jogador "${convertedPlayer.name}" processado:`);
        console.log(`   - Dificuldade original: "${player.difficulty_level}"`);
        console.log(`   - Dificuldade convertida: "${convertedPlayer.difficulty_level}"`);
        
        return convertedPlayer;
      });
      
      console.log('📈 Distribuição final de dificuldades:');
      const difficultyCount: Record<string, number> = {};
      convertedPlayers.forEach(player => {
        const difficulty = player.difficulty_level || 'sem_dificuldade';
        difficultyCount[difficulty] = (difficultyCount[difficulty] || 0) + 1;
      });
      console.log(difficultyCount);
      
      return convertedPlayers;
    },
  });

  const filteredPlayers = players.filter(player =>
    player.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    player.nicknames?.some(nick => 
      nick.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const handleEditPlayer = (player: Player) => {
    console.log('✏️ Abrindo edição do jogador:');
    console.log('  - Nome:', player.name);
    console.log('  - Dificuldade atual:', player.difficulty_level);
    console.log('  - ID:', player.id);
    setEditingPlayer(player);
  };

  const handlePlayerUpdated = () => {
    console.log('🔄 Jogador atualizado, recarregando lista...');
    setEditingPlayer(null);
    refetch();
  };

  const handleDeletePlayer = async (playerId: string, playerName: string) => {
    if (!confirm(`Tem certeza que deseja excluir ${playerName}?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('players')
        .delete()
        .eq('id', playerId);

      if (error) throw error;

      toast({
        title: "Sucesso!",
        description: "Jogador excluído com sucesso!",
      });

      refetch();
    } catch (error) {
      console.error('Erro ao excluir jogador:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Falha ao excluir jogador.",
      });
    }
  };

  if (editingPlayer) {
    return (
      <EditPlayerForm
        player={editingPlayer}
        onPlayerUpdated={handlePlayerUpdated}
        onCancel={() => setEditingPlayer(null)}
      />
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <div className="w-8 h-8 border-4 border-flu-grena border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <Input
            placeholder="Buscar jogador..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPlayers.map((player) => (
          <Card key={player.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <img
                  src={player.image_url}
                  alt={player.name}
                  className="w-12 h-12 rounded-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/placeholder.svg';
                  }}
                />
                <div className="flex-1">
                  <CardTitle className="text-lg">{player.name}</CardTitle>
                  <p className="text-sm text-gray-600">{player.position}</p>
                  <p className="text-xs text-muted-foreground">
                    <strong>Dificuldade:</strong> {player.difficulty_level || 'Não definida'}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                {player.nicknames && player.nicknames.length > 0 && (
                  <p><strong>Apelidos:</strong> {player.nicknames.join(', ')}</p>
                )}
                <p><strong>Gols:</strong> {player.statistics?.gols || 0}</p>
                <p><strong>Jogos:</strong> {player.statistics?.jogos || 0}</p>
              </div>
              
              <div className="flex gap-2 mt-4">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleEditPlayer(player)}
                  className="flex-1"
                >
                  <Edit size={16} className="mr-1" />
                  Editar
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleDeletePlayer(player.id, player.name)}
                >
                  <Trash2 size={16} />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredPlayers.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          {searchTerm ? 'Nenhum jogador encontrado.' : 'Nenhum jogador cadastrado.'}
        </div>
      )}
    </div>
  );
};
