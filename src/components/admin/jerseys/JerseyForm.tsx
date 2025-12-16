import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import type { Jersey, JerseyType } from "@/types/jersey-game";
import type { DifficultyLevel } from "@/types/guess-game";

interface JerseyFormProps {
  jersey?: Jersey | null;
  onSuccess: () => void;
  onCancel: () => void;
}

const JERSEY_TYPES: { value: JerseyType; label: string }[] = [
  { value: 'home', label: 'Principal (Casa)' },
  { value: 'away', label: 'Visitante (Fora)' },
  { value: 'third', label: 'Terceira' },
  { value: 'special', label: 'Especial/Comemorativa' },
];

const DIFFICULTY_LEVELS: { value: DifficultyLevel; label: string }[] = [
  { value: 'muito_facil', label: 'Muito Fácil' },
  { value: 'facil', label: 'Fácil' },
  { value: 'medio', label: 'Médio' },
  { value: 'dificil', label: 'Difícil' },
  { value: 'muito_dificil', label: 'Muito Difícil' },
];

const DECADES = ['1900', '1910', '1920', '1930', '1940', '1950', '1960', '1970', '1980', '1990', '2000', '2010', '2020'];

export const JerseyForm = ({ jersey, onSuccess, onCancel }: JerseyFormProps) => {
  const { toast } = useToast();
  const isEditing = !!jersey;

  const [year, setYear] = useState(jersey?.year?.toString() || '');
  const [imageUrl, setImageUrl] = useState(jersey?.image_url || '');
  const [type, setType] = useState<JerseyType>(jersey?.type || 'home');
  const [manufacturer, setManufacturer] = useState(jersey?.manufacturer || '');
  const [season, setSeason] = useState(jersey?.season || '');
  const [title, setTitle] = useState(jersey?.title || '');
  const [funFact, setFunFact] = useState(jersey?.fun_fact || '');
  const [nicknames, setNicknames] = useState(jersey?.nicknames?.join(', ') || '');
  const [difficultyLevel, setDifficultyLevel] = useState<DifficultyLevel>(jersey?.difficulty_level || 'medio');
  const [decades, setDecades] = useState<string[]>(jersey?.decades || []);
  const [isLoading, setIsLoading] = useState(false);

  const handleDecadeToggle = (decade: string) => {
    setDecades(prev => 
      prev.includes(decade) 
        ? prev.filter(d => d !== decade)
        : [...prev, decade]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!year || !imageUrl) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Ano e URL da imagem são obrigatórios.",
      });
      return;
    }

    const yearNum = parseInt(year);
    if (isNaN(yearNum) || yearNum < 1900 || yearNum > 2030) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Ano inválido. Use um valor entre 1900 e 2030.",
      });
      return;
    }

    setIsLoading(true);

    try {
      const jerseyData = {
        year: yearNum,
        image_url: imageUrl,
        type,
        manufacturer: manufacturer || null,
        season: season || null,
        title: title || null,
        fun_fact: funFact || null,
        nicknames: nicknames ? nicknames.split(',').map(n => n.trim()).filter(Boolean) : [],
        difficulty_level: difficultyLevel,
        decades: decades.length > 0 ? decades : [Math.floor(yearNum / 10) * 10 + 's'],
      };

      if (isEditing && jersey) {
        const { error } = await supabase
          .from('jerseys')
          .update(jerseyData)
          .eq('id', jersey.id);

        if (error) throw error;

        toast({
          title: "Sucesso!",
          description: "Camisa atualizada com sucesso!",
        });
      } else {
        const { error } = await supabase
          .from('jerseys')
          .insert([jerseyData]);

        if (error) throw error;

        toast({
          title: "Sucesso!",
          description: "Camisa adicionada com sucesso!",
        });
      }

      onSuccess();
    } catch (error) {
      console.error('Erro ao salvar camisa:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Falha ao salvar camisa.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          {isEditing ? `Editar Camisa: ${jersey.year}` : 'Adicionar Nova Camisa'}
        </h3>
        <Button variant="ghost" size="icon" onClick={onCancel}>
          <X size={20} />
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="year">Ano *</Label>
            <Input
              id="year"
              type="number"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              placeholder="Ex: 1984"
              min={1900}
              max={2030}
              disabled={isLoading}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Tipo</Label>
            <Select value={type} onValueChange={(v) => setType(v as JerseyType)} disabled={isLoading}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {JERSEY_TYPES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="imageUrl">URL da Imagem *</Label>
          <Input
            id="imageUrl"
            type="url"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://..."
            disabled={isLoading}
            required
          />
          {imageUrl && (
            <div className="mt-2">
              <img 
                src={imageUrl} 
                alt="Preview" 
                className="max-h-40 rounded-lg border object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/placeholder.svg';
                }}
              />
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="manufacturer">Fabricante</Label>
            <Input
              id="manufacturer"
              value={manufacturer}
              onChange={(e) => setManufacturer(e.target.value)}
              placeholder="Ex: Adidas, Umbro, Reebok"
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="season">Temporada</Label>
            <Input
              id="season"
              value={season}
              onChange={(e) => setSeason(e.target.value)}
              placeholder="Ex: 1984/85"
              disabled={isLoading}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="title">Título/Nome</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ex: Camisa do Tri-campeonato"
            disabled={isLoading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="nicknames">Apelidos (separados por vírgula)</Label>
          <Input
            id="nicknames"
            value={nicknames}
            onChange={(e) => setNicknames(e.target.value)}
            placeholder="Ex: Máquina, Tricolor das Laranjeiras"
            disabled={isLoading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="funFact">Curiosidade</Label>
          <Textarea
            id="funFact"
            value={funFact}
            onChange={(e) => setFunFact(e.target.value)}
            placeholder="Ex: Camisa usada na conquista do campeonato brasileiro..."
            disabled={isLoading}
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="difficultyLevel">Dificuldade Inicial</Label>
          <Select value={difficultyLevel} onValueChange={(v) => setDifficultyLevel(v as DifficultyLevel)} disabled={isLoading}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DIFFICULTY_LEVELS.map((d) => (
                <SelectItem key={d.value} value={d.value}>
                  {d.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            A dificuldade será recalculada automaticamente com base nas estatísticas de jogo.
          </p>
        </div>

        <div className="space-y-2">
          <Label>Décadas</Label>
          <div className="flex flex-wrap gap-2">
            {DECADES.map((decade) => (
              <Button
                key={decade}
                type="button"
                variant={decades.includes(decade) ? "default" : "outline"}
                size="sm"
                onClick={() => handleDecadeToggle(decade)}
                disabled={isLoading}
              >
                {decade}s
              </Button>
            ))}
          </div>
        </div>

        <div className="flex gap-2 pt-4">
          <Button type="submit" disabled={isLoading} className="flex-1">
            {isLoading ? "Salvando..." : isEditing ? "Atualizar Camisa" : "Adicionar Camisa"}
          </Button>
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
        </div>
      </form>
    </div>
  );
};
