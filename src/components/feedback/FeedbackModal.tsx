import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { Star, Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  gameMode?: string;
  playerName?: string;
}

export const FeedbackModal = ({ isOpen, onClose, gameMode, playerName }: FeedbackModalProps) => {
  const [rating, setRating] = useState<string>('5');
  const [category, setCategory] = useState<string>('general');
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('user_feedback')
        .insert({
          rating: parseInt(rating),
          category,
          comment: comment.trim() || null,
          user_id: user?.id || null,
          user_email: user?.email || null
        });

      if (error) throw error;

      toast({
        title: "✨ Feedback enviado!",
        description: "Obrigado por ajudar a melhorar nossa experiência!",
      });

      onClose();
      setRating('5');
      setCategory('general');
      setComment('');
    } catch (error) {
      console.error('Erro ao enviar feedback:', error);
      toast({
        title: "Erro ao enviar feedback",
        description: "Tente novamente em alguns instantes.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-500" />
            Como foi sua experiência?
          </DialogTitle>
          <DialogDescription>
            Seu feedback é muito importante para melhorarmos o jogo!
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-3">
            <Label htmlFor="rating">Avaliação geral</Label>
            <RadioGroup value={rating} onValueChange={setRating} className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <div key={star} className="flex items-center space-x-2">
                  <RadioGroupItem value={star.toString()} id={`rating-${star}`} />
                  <Label htmlFor={`rating-${star}`} className="flex items-center">
                    {star} <Star className="w-4 h-4 ml-1 text-yellow-500" />
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <div className="space-y-3">
            <Label htmlFor="category">Categoria</Label>
            <RadioGroup value={category} onValueChange={setCategory}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="general" id="general" />
                <Label htmlFor="general">Experiência geral</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="difficulty" id="difficulty" />
                <Label htmlFor="difficulty">Dificuldade do jogo</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="interface" id="interface" />
                <Label htmlFor="interface">Interface e usabilidade</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="performance" id="performance" />
                <Label htmlFor="performance">Performance</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="bug" id="bug" />
                <Label htmlFor="bug">Problema/Bug</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-3">
            <Label htmlFor="comment">Comentários (opcional)</Label>
            <Textarea
              id="comment"
              placeholder="Conte-nos mais sobre sua experiência..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
            />
          </div>

          <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Enviando...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Send className="w-4 h-4" />
                  Enviar
                </div>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};