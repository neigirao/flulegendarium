import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Plus, Shirt } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { JerseyForm } from "./JerseyForm";
import type { Jersey, JerseyType } from "@/types/jersey-game";
import type { DifficultyLevel } from "@/types/guess-game";
import { SearchWithFilters, FilterConfig, DIFFICULTY_LABELS } from "@/components/admin/shared";

const TYPE_LABELS: Record<JerseyType, string> = {
  home: 'Principal',
  away: 'Visitante',
  third: 'Terceira',
  special: 'Especial',
};

const DECADES = ['1900', '1910', '1920', '1930', '1940', '1950', '1960', '1970', '1980', '1990', '2000', '2010', '2020'];

export const JerseysManagement = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});
  const [editingJersey, setEditingJersey] = useState<Jersey | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);

  const { data: jerseys = [], isLoading, refetch } = useQuery({
    queryKey: ['admin-jerseys'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('jerseys')
        .select('*')
        .order('years', { ascending: true });
      
      if (error) throw error;
      
      return (data || []).map((jersey): Jersey => ({
        id: jersey.id,
        years: jersey.years,
        image_url: jersey.image_url,
        type: jersey.type as JerseyType,
        manufacturer: jersey.manufacturer,
        season: jersey.season,
        title: jersey.title,
        fun_fact: jersey.fun_fact,
        nicknames: jersey.nicknames,
        difficulty_level: jersey.difficulty_level as DifficultyLevel,
        difficulty_score: jersey.difficulty_score,
        difficulty_confidence: jersey.difficulty_confidence,
        total_attempts: jersey.total_attempts,
        correct_attempts: jersey.correct_attempts,
        average_guess_time: jersey.average_guess_time,
        decades: jersey.decades,
        created_at: jersey.created_at,
      }));
    },
  });

  const filters: FilterConfig[] = [
    {
      key: 'difficulty',
      label: 'Dificuldade',
      options: Object.entries(DIFFICULTY_LABELS).map(([value, label]) => ({ value, label }))
    },
    {
      key: 'type',
      label: 'Tipo',
      options: Object.entries(TYPE_LABELS).map(([value, label]) => ({ value, label }))
    },
    {
      key: 'decade',
      label: 'Década',
      options: DECADES.map(d => ({ value: d, label: `${d}s` }))
    }
  ];

  const filteredJerseys = jerseys.filter(jersey => {
    const searchLower = searchTerm.toLowerCase();
    const yearsString = jersey.years.join(', ');
    
    // Text search
    const matchesSearch = yearsString.includes(searchTerm) ||
      jersey.title?.toLowerCase().includes(searchLower) ||
      jersey.manufacturer?.toLowerCase().includes(searchLower) ||
      jersey.nicknames?.some(nick => nick.toLowerCase().includes(searchLower));
    
    // Difficulty filter
    const matchesDifficulty = !activeFilters.difficulty || activeFilters.difficulty === 'all' || 
      jersey.difficulty_level === activeFilters.difficulty;
    
    // Type filter
    const matchesType = !activeFilters.type || activeFilters.type === 'all' || 
      jersey.type === activeFilters.type;
    
    // Decade filter
    const matchesDecade = !activeFilters.decade || activeFilters.decade === 'all' || 
      jersey.decades?.includes(activeFilters.decade);
    
    return matchesSearch && matchesDifficulty && matchesType && matchesDecade;
  });

  const handleFilterChange = (key: string, value: string) => {
    setActiveFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleClearFilters = () => {
    setActiveFilters({});
  };

  const handleDeleteJersey = async (jerseyId: string, jerseyYears: number[]) => {
    const yearsDisplay = jerseyYears.join(', ');
    if (!confirm(`Tem certeza que deseja excluir a camisa de ${yearsDisplay}?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('jerseys')
        .delete()
        .eq('id', jerseyId);

      if (error) throw error;

      toast({
        title: "Sucesso!",
        description: "Camisa excluída com sucesso!",
      });

      refetch();
    } catch (error) {
      console.error('Erro ao excluir camisa:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Falha ao excluir camisa.",
      });
    }
  };

  const handleFormSuccess = () => {
    setEditingJersey(null);
    setIsAddingNew(false);
    refetch();
  };

  const formatYears = (years: number[]): string => {
    if (years.length === 0) return '-';
    if (years.length === 1) return String(years[0]);
    
    // Check if consecutive years
    const sorted = [...years].sort((a, b) => a - b);
    const isConsecutive = sorted.every((year, i) => 
      i === 0 || year === sorted[i - 1] + 1
    );
    
    if (isConsecutive && years.length > 2) {
      return `${sorted[0]}-${sorted[sorted.length - 1]}`;
    }
    
    return sorted.join(', ');
  };

  if (editingJersey || isAddingNew) {
    return (
      <JerseyForm
        jersey={editingJersey}
        onSuccess={handleFormSuccess}
        onCancel={() => {
          setEditingJersey(null);
          setIsAddingNew(false);
        }}
      />
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SearchWithFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        placeholder="Buscar camisa por ano, título ou fabricante..."
        filters={filters}
        activeFilters={activeFilters}
        onFilterChange={handleFilterChange}
        onClearFilters={handleClearFilters}
        totalResults={filteredJerseys.length}
        totalItems={jerseys.length}
      >
        <Button onClick={() => setIsAddingNew(true)} className="flex items-center gap-2">
          <Plus size={16} />
          Nova Camisa
        </Button>
      </SearchWithFilters>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredJerseys.map((jersey) => (
          <Card key={jersey.id}>
            <CardHeader className="pb-3">
              <div className="flex items-start gap-3">
                <div className="w-20 h-20 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                  <img
                    src={jersey.image_url}
                    alt={`Camisa ${formatYears(jersey.years)}`}
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/lovable-uploads/0aa3609f-0584-4bf4-8303-e03f50f7e131.png';
                    }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Shirt size={18} className="text-primary" />
                    {formatYears(jersey.years)}
                  </CardTitle>
                  <div className="flex flex-wrap gap-1 mt-1">
                    <Badge variant="outline" className="text-xs">
                      {TYPE_LABELS[jersey.type]}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      {DIFFICULTY_LABELS[jersey.difficulty_level || 'medio']}
                    </Badge>
                  </div>
                  {jersey.title && (
                    <p className="text-sm text-muted-foreground mt-1 truncate">
                      {jersey.title}
                    </p>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                {jersey.manufacturer && (
                  <p><strong>Fabricante:</strong> {jersey.manufacturer}</p>
                )}
                {jersey.season && (
                  <p><strong>Temporada:</strong> {jersey.season}</p>
                )}
                {jersey.nicknames && jersey.nicknames.length > 0 && (
                  <p><strong>Apelidos:</strong> {jersey.nicknames.join(', ')}</p>
                )}
                {jersey.decades && jersey.decades.length > 0 && (
                  <p><strong>Décadas:</strong> {jersey.decades.join(', ')}</p>
                )}
                <div className="pt-2 border-t">
                  <p className="text-xs text-muted-foreground">
                    Tentativas: {jersey.total_attempts || 0} | 
                    Acertos: {jersey.correct_attempts || 0}
                  </p>
                </div>
              </div>
              
              <div className="flex gap-2 mt-4">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setEditingJersey(jersey)}
                  className="flex-1"
                >
                  <Edit size={16} className="mr-1" />
                  Editar
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleDeleteJersey(jersey.id, jersey.years)}
                >
                  <Trash2 size={16} />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredJerseys.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          {searchTerm ? 'Nenhuma camisa encontrada.' : 'Nenhuma camisa cadastrada. Clique em "Nova Camisa" para adicionar.'}
        </div>
      )}
    </div>
  );
};