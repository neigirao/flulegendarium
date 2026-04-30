
import { useState, useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Edit, Trash2, ImageOff, Image as ImageIcon, AlertTriangle } from "lucide-react";
import { Player, DifficultyLevel } from "@/types/guess-game";
import { EditPlayerForm } from "./EditPlayerForm";
import { useToast } from "@/components/ui/use-toast";
import { Database } from "@/integrations/supabase/types";
import { convertStatistics } from "@/utils/statistics-converter";
import { SearchWithFilters, FilterConfig, DIFFICULTY_LABELS } from "./shared";
import { Badge } from "@/components/ui/badge";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { isProblematicDomain } from "@/utils/player-image/problematicUrls";

const ITEMS_PER_PAGE = 24;

type PlayerRow = Database['public']['Tables']['players']['Row'];

// Image status types for filtering
type ImageStatusFilter = 'all' | 'local' | 'external' | 'problematic';

const IMAGE_STATUS_OPTIONS = [
  { value: 'local', label: 'Storage Local' },
  { value: 'external', label: 'URL Externa' },
  { value: 'problematic', label: 'Problemáticas' },
];

const getImageStatus = (url: string): 'local' | 'external' | 'problematic' => {
  if (!url) return 'external';
  
  // Check if it's from Supabase storage
  if (url.includes('supabase') && url.includes('storage')) {
    return 'local';
  }
  
  // Check if domain is problematic
  if (isProblematicDomain(url)) {
    return 'problematic';
  }
  
  return 'external';
};

export const PlayersManagement = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

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
          difficulty_level: (player.difficulty_level as DifficultyLevel) || 'medio',
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

  // Calculate image statistics
  const imageStats = useMemo(() => {
    const stats = { local: 0, external: 0, problematic: 0 };
    players.forEach(player => {
      const status = getImageStatus(player.image_url);
      stats[status]++;
    });
    return stats;
  }, [players]);

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
    },
    {
      key: 'imageStatus',
      label: 'Status da Imagem',
      options: IMAGE_STATUS_OPTIONS
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
    
    // Image status filter
    const imageStatus = getImageStatus(player.image_url);
    const matchesImageStatus = !activeFilters.imageStatus || activeFilters.imageStatus === 'all' || 
      imageStatus === activeFilters.imageStatus;
    
    return matchesSearch && matchesDifficulty && matchesPosition && matchesImageStatus;
  });

  const totalPages = Math.max(1, Math.ceil(filteredPlayers.length / ITEMS_PER_PAGE));
  const paginatedPlayers = useMemo(
    () => filteredPlayers.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE),
    [filteredPlayers, currentPage]
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, activeFilters]);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

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
      {/* Image Statistics Summary */}
      <div className="grid grid-cols-3 gap-3">
        <div className="flex items-center gap-2 p-3 rounded-lg bg-success/10 border border-success/20">
          <ImageIcon className="h-4 w-4 text-success" />
          <div>
            <p className="text-xs text-muted-foreground">Storage Local</p>
            <p className="text-lg font-semibold text-success">{imageStats.local}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 p-3 rounded-lg bg-muted border border-border">
          <ImageOff className="h-4 w-4 text-muted-foreground" />
          <div>
            <p className="text-xs text-muted-foreground">URLs Externas</p>
            <p className="text-lg font-semibold">{imageStats.external}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
          <AlertTriangle className="h-4 w-4 text-destructive" />
          <div>
            <p className="text-xs text-muted-foreground">Problemáticas</p>
            <p className="text-lg font-semibold text-destructive">{imageStats.problematic}</p>
          </div>
        </div>
      </div>

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
        {paginatedPlayers.map((player) => (
          <Card key={player.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <img
                  src={player.image_url}
                  alt={player.name}
                  className="w-12 h-12 rounded-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/lovable-uploads/0aa3609f-0584-4bf4-8303-e03f50f7e131.png';
                  }}
                />
                <div className="flex-1">
                  <CardTitle className="text-lg">{player.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">{player.position}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant={
                      player.difficulty_level === 'muito_facil' ? 'default' :
                      player.difficulty_level === 'facil' ? 'secondary' :
                      player.difficulty_level === 'medio' ? 'outline' :
                      player.difficulty_level === 'dificil' ? 'destructive' :
                      'destructive'
                    } className="text-xs">
                      {DIFFICULTY_LABELS[player.difficulty_level as keyof typeof DIFFICULTY_LABELS] || 'Médio'}
                    </Badge>
                    {(() => {
                      const imgStatus = getImageStatus(player.image_url);
                      return (
                        <Badge variant={
                          imgStatus === 'local' ? 'default' :
                          imgStatus === 'problematic' ? 'destructive' :
                          'outline'
                        } className="text-xs">
                          {imgStatus === 'local' ? '✓ Local' :
                           imgStatus === 'problematic' ? '⚠ Problemática' :
                           'Externa'}
                        </Badge>
                      );
                    })()}
                  </div>
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

      {totalPages > 1 && (
        <div className="flex flex-col items-center gap-2 pt-4">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <PaginationItem key={page}>
                  <PaginationLink
                    onClick={() => setCurrentPage(page)}
                    isActive={currentPage === page}
                    className="cursor-pointer"
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
          <p className="text-xs text-muted-foreground">
            Página {currentPage} de {totalPages} — {filteredPlayers.length} jogadores
          </p>
        </div>
      )}
    </div>
  );
};
