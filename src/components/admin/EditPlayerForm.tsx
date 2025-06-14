
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, Link, X } from "lucide-react";
import { Player } from "@/types/guess-game";

interface EditPlayerFormProps {
  player: Player;
  onPlayerUpdated: () => void;
  onCancel: () => void;
}

export const EditPlayerForm = ({ player, onPlayerUpdated, onCancel }: EditPlayerFormProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState(player.name);
  const [imageUrl, setImageUrl] = useState(player.image_url);
  const [image, setImage] = useState<File | null>(null);
  const [nicknames, setNicknames] = useState(player.nicknames?.join(', ') || '');
  const [position, setPosition] = useState(player.position);
  const [yearHighlight, setYearHighlight] = useState(player.year_highlight || '');
  const [funFact, setFunFact] = useState(player.fun_fact || '');
  const [achievements, setAchievements] = useState(player.achievements?.join(', ') || '');
  const [gols, setGols] = useState(player.statistics?.gols || 0);
  const [jogos, setJogos] = useState(player.statistics?.jogos || 0);
  const [uploadMethod, setUploadMethod] = useState<'file' | 'url'>('url');

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

    setIsLoading(true);
    try {
      let finalImageUrl = imageUrl;

      // Se for upload de arquivo, fazer upload para o storage
      if (uploadMethod === 'file' && image) {
        const fileExt = image.name.split('.').pop();
        const fileName = `${name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.${fileExt}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('players')
          .upload(fileName, image);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('players')
          .getPublicUrl(fileName);

        finalImageUrl = publicUrl;
      }

      // Processar dados
      const nicknamesArray = nicknames
        .split(',')
        .map(nick => nick.trim())
        .filter(nick => nick.length > 0);

      const achievementsArray = achievements
        .split(',')
        .map(ach => ach.trim())
        .filter(ach => ach.length > 0);

      // Atualizar o jogador no banco
      const { error: updateError } = await supabase
        .from('players')
        .update({
          name,
          image_url: finalImageUrl,
          nicknames: nicknamesArray,
          position,
          year_highlight: yearHighlight,
          fun_fact: funFact,
          achievements: achievementsArray,
          statistics: { gols, jogos }
        })
        .eq('id', player.id);

      if (updateError) throw updateError;

      toast({
        title: "Sucesso!",
        description: "Jogador atualizado com sucesso!",
      });

      onPlayerUpdated();
    } catch (error) {
      console.error('Erro ao atualizar jogador:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Falha ao atualizar jogador. " + (error instanceof Error ? error.message : ''),
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Editar Jogador: {player.name}</h3>
        <Button variant="ghost" size="icon" onClick={onCancel}>
          <X size={20} />
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

          <div className="space-y-2">
            <Label htmlFor="position">Posição</Label>
            <Input
              id="position"
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              placeholder="Ex: Atacante"
              disabled={isLoading}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Imagem do Jogador</Label>
          <Tabs value={uploadMethod} onValueChange={(value) => setUploadMethod(value as 'file' | 'url')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="file" className="flex items-center gap-2">
                <Upload size={16} />
                Upload
              </TabsTrigger>
              <TabsTrigger value="url" className="flex items-center gap-2">
                <Link size={16} />
                URL
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="file" className="space-y-2">
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => setImage(e.target.files?.[0] || null)}
                disabled={isLoading}
              />
            </TabsContent>
            
            <TabsContent value="url" className="space-y-2">
              <Input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://exemplo.com/imagem.jpg"
                disabled={isLoading}
              />
            </TabsContent>
          </Tabs>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="gols">Gols</Label>
            <Input
              id="gols"
              type="number"
              value={gols}
              onChange={(e) => setGols(Number(e.target.value))}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="jogos">Jogos</Label>
            <Input
              id="jogos"
              type="number"
              value={jogos}
              onChange={(e) => setJogos(Number(e.target.value))}
              disabled={isLoading}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="yearHighlight">Ano de Destaque</Label>
          <Input
            id="yearHighlight"
            value={yearHighlight}
            onChange={(e) => setYearHighlight(e.target.value)}
            placeholder="Ex: 2010"
            disabled={isLoading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="nicknames">Apelidos</Label>
          <Textarea
            id="nicknames"
            value={nicknames}
            onChange={(e) => setNicknames(e.target.value)}
            placeholder="Ex: Fred, Frederico, Chaves Guedes (separar por vírgula)"
            disabled={isLoading}
            rows={2}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="funFact">Curiosidade</Label>
          <Textarea
            id="funFact"
            value={funFact}
            onChange={(e) => setFunFact(e.target.value)}
            placeholder="Curiosidade sobre o jogador"
            disabled={isLoading}
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="achievements">Conquistas</Label>
          <Textarea
            id="achievements"
            value={achievements}
            onChange={(e) => setAchievements(e.target.value)}
            placeholder="Ex: Campeão Brasileiro 2010, Campeão Carioca 2012 (separar por vírgula)"
            disabled={isLoading}
            rows={3}
          />
        </div>

        <div className="flex gap-2">
          <Button type="submit" disabled={isLoading} className="flex-1">
            {isLoading ? "Atualizando..." : "Atualizar Jogador"}
          </Button>
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
        </div>
      </form>
    </div>
  );
};
