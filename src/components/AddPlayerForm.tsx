
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { DifficultyLevel } from "@/types/guess-game";
import { getAllDecades } from "@/data/decades";
import { PlayerImageUpload } from "./admin/players/PlayerImageUpload";

const DIFFICULTY_LEVELS = [
  { value: 'muito_facil' as DifficultyLevel, label: 'Muito Fácil' },
  { value: 'facil' as DifficultyLevel, label: 'Fácil' },
  { value: 'medio' as DifficultyLevel, label: 'Médio' },
  { value: 'dificil' as DifficultyLevel, label: 'Difícil' },
  { value: 'muito_dificil' as DifficultyLevel, label: 'Muito Difícil' }
];

export const AddPlayerForm = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [nicknames, setNicknames] = useState("");
  const [difficultyLevel, setDifficultyLevel] = useState<DifficultyLevel>('medio');
  const [selectedDecades, setSelectedDecades] = useState<string[]>([]);

  const decades = getAllDecades();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Por favor, informe o nome do jogador.",
      });
      return;
    }

    if (!imageUrl) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Por favor, adicione uma imagem do jogador.",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Processar apelidos (separar por vírgula e limpar espaços)
      const nicknamesArray = nicknames
        .split(',')
        .map(nick => nick.trim())
        .filter(nick => nick.length > 0);

      // Inserir o jogador no banco
      const { data: player, error: insertError } = await supabase
        .from('players')
        .insert({
          name,
          image_url: imageUrl,
          nicknames: nicknamesArray,
          position: 'Não informada', // Valor padrão já que ainda é obrigatório no banco
          difficulty_level: difficultyLevel,
          decades: selectedDecades,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      toast({
        title: "Sucesso!",
        description: "Jogador adicionado com sucesso!",
      });

      // Limpar formulário
      setName("");
      setImageUrl("");
      setNicknames("");
      setDifficultyLevel('medio');
      setSelectedDecades([]);
    } catch (error) {
      console.error('Erro ao adicionar jogador:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Falha ao adicionar jogador. " + (error instanceof Error ? error.message : ''),
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nome do Jogador *</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ex: Fred"
          disabled={isLoading}
        />
      </div>

      <PlayerImageUpload
        imageUrl={imageUrl}
        onImageUrlChange={setImageUrl}
        disabled={isLoading}
      />

      <div className="space-y-2">
        <Label htmlFor="nicknames">Apelidos (opcional)</Label>
        <Textarea
          id="nicknames"
          value={nicknames}
          onChange={(e) => setNicknames(e.target.value)}
          placeholder="Ex: Fred, Frederico, Chaves Guedes (separar por vírgula)"
          disabled={isLoading}
          rows={3}
        />
        <p className="text-sm text-muted-foreground">
          Separe múltiplos apelidos por vírgula. Estes apelidos serão aceitos no jogo.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="difficulty">Nível de Dificuldade</Label>
        <Select value={difficultyLevel} onValueChange={(value) => setDifficultyLevel(value as DifficultyLevel)} disabled={isLoading}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione a dificuldade" />
          </SelectTrigger>
          <SelectContent>
            {DIFFICULTY_LEVELS.map((level) => (
              <SelectItem key={level.value} value={level.value}>
                {level.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Décadas do Jogador (opcional)</Label>
        <div className="grid grid-cols-2 gap-2">
          {decades.map((decade) => (
            <div key={decade.id} className="flex items-center space-x-2">
              <Checkbox
                id={decade.id}
                checked={selectedDecades.includes(decade.id)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setSelectedDecades([...selectedDecades, decade.id]);
                  } else {
                    setSelectedDecades(selectedDecades.filter(d => d !== decade.id));
                  }
                }}
                disabled={isLoading}
              />
              <Label htmlFor={decade.id} className="text-sm font-normal">
                {decade.label}
              </Label>
            </div>
          ))}
        </div>
        <p className="text-sm text-muted-foreground">
          Selecione as décadas em que o jogador atuou.
        </p>
      </div>

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? "Adicionando..." : "Adicionar Jogador"}
      </Button>
    </form>
  );
};
