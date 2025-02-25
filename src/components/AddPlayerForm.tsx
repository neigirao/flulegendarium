
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";

export const AddPlayerForm = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState("");
  const [position, setPosition] = useState("");
  const [image, setImage] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!image || !name) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Por favor, selecione uma imagem e informe o nome do jogador.",
      });
      return;
    }

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('image', image);
      formData.append('name', name);
      formData.append('position', position);

      const { data, error } = await supabase.functions.invoke('upload-player', {
        body: formData,
      });

      if (error) throw error;

      toast({
        title: "Sucesso!",
        description: "Jogador adicionado com sucesso!",
      });

      // Limpar formulário
      setName("");
      setPosition("");
      setImage(null);
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
        <Label htmlFor="image">Foto do Jogador</Label>
        <Input
          id="image"
          type="file"
          accept="image/*"
          onChange={(e) => setImage(e.target.files?.[0] || null)}
          disabled={isLoading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="name">Nome do Jogador</Label>
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

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? "Adicionando..." : "Adicionar Jogador"}
      </Button>
    </form>
  );
};
