
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Play } from "lucide-react";

interface GuestNameFormProps {
  onNameSubmitted: (name: string) => void;
  onCancel: () => void;
}

export const GuestNameForm = ({ onNameSubmitted, onCancel }: GuestNameFormProps) => {
  const [name, setName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onNameSubmitted(name.trim());
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center w-16 h-16 bg-flu-verde/10 rounded-full mx-auto mb-4">
            <User className="w-8 h-8 text-flu-verde" />
          </div>
          <CardTitle className="text-2xl text-flu-grena">Qual é o seu nome?</CardTitle>
          <p className="text-muted-foreground">
            Digite seu nome para começar a jogar como convidado
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Digite seu nome..."
                className="text-center text-lg"
                autoFocus
                maxLength={50}
              />
            </div>
            
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="flex-1"
              >
                Voltar
              </Button>
              <Button
                type="submit"
                disabled={!name.trim()}
                className="flex-1 bg-flu-verde hover:bg-flu-verde/90 text-white"
              >
                <Play className="w-4 h-4 mr-2" />
                Começar Jogo
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
