
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Edit, Trash2 } from "lucide-react";
import { Player, DifficultyLevel } from "@/types/guess-game";
import { EditPlayerForm } from "./EditPlayerForm";
import { useToast } from "@/components/ui/use-toast";
import { Database } from "@/integrations/supabase/types";
import { convertStatistics } from "@/utils/statistics-converter";
import { SearchWithFilters, FilterConfig, DIFFICULTY_LABELS } from "./shared";

type PlayerRow = Database['public']['Tables']['players']['Row'];

export const PlayersManagement = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);

  const { data: players = [], isLoading, refetch } = useQuery({
    queryKey: ['admin-players'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('players')
        .select('*')
        .order('name');
      
      if (error) {
        throw error;
      }
      
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
        
        return convertedPlayer;
      });
      
      return convertedPlayers;
    },
  });

  const filters: FilterConfig[] = [
    {
      key: 'difficulty',
      label: 'Dificuldade',
      options: Object.entries(DIFFICULTY_LABELS).map(([value, label]) => ({ value, label }))
    },
    {
      key: 'position',
      label: 'Posição',
      options: [
        { value: 'Goleiro', label: 'Goleiro' },
        { value: 'Zagueiro', label: 'Zagueiro' },
        { value: 'Lateral', label: 'Lateral' },
        { value: 'Volante', label: 'Volante' },
        { value: 'Meia', label: 'Meia' },
        { value: 'Atacante', label: 'Atacante' },
      ]
    }
  ];

  const filteredPlayers = players.filter(player => {
    // Text search
    const matchesSearch = player.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      player.nicknames?.some(nick => 
        nick.toLowerCase().includes(searchTerm.toLowerCase())
      );
    
    // Difficulty filter
    const matchesDifficulty = !activeFilters.difficulty || activeFilters.difficulty === 'all' || 
      player.difficulty_level === activeFilters.difficulty;
    
    // Position filter
    const matchesPosition = !activeFilters.position || activeFilters.position === 'all' || 
      player.position?.toLowerCase().includes(activeFilters.position.toLowerCase());
    
    return matchesSearch && matchesDifficulty && matchesPosition;
  });

  const handleFilterChange = (key: string, value: string) => {
    setActiveFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleClearFilters = () => {
    setActiveFilters({});
  };

  const handleEditPlayer = (player: Player) => {
    setEditingPlayer(player);
  };

  const handlePlayerUpdated = () => {
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
      <SearchWithFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        placeholder="Buscar jogador por nome ou apelido..."
        filters={filters}
        activeFilters={activeFilters}
        onFilterChange={handleFilterChange}
        onClearFilters={handleClearFilters}
        totalResults={filteredPlayers.length}
        totalItems={players.length}
      />

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
                  <p className="text-sm text-muted-foreground">{player.position}</p>
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
        <div className="text-center py-8 text-muted-foreground">
          {searchTerm ? 'Nenhum jogador encontrado.' : 'Nenhum jogador cadastrado.'}
        </div>
      )}
    </div>
  );
};
