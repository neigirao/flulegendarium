import React, { useState } from 'react';
import { Star, MessageSquare, Send, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { FluCard } from '@/components/ui/flu-card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface FeedbackModalProps {
  trigger?: React.ReactNode;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const FEEDBACK_CATEGORIES = [
  { id: 'gameplay', label: 'Jogabilidade', emoji: '🎮' },
  { id: 'ui', label: 'Interface', emoji: '🎨' },
  { id: 'performance', label: 'Performance', emoji: '⚡' },
  { id: 'content', label: 'Conteúdo', emoji: '📚' },
  { id: 'bug', label: 'Bug Report', emoji: '🐛' },
  { id: 'suggestion', label: 'Sugestão', emoji: '💡' }
];

export const FeedbackModal = ({ trigger, isOpen, onOpenChange }: FeedbackModalProps) => {
  const [rating, setRating] = useState(0);
  const [category, setCategory] = useState('');
  const [comment, setComment] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0 || !category) {
      toast.error('Por favor, selecione uma nota e categoria');
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('user_feedback')
        .insert({
          rating,
          category,
          comment: comment.trim() || null,
          user_email: userEmail.trim() || null,
          status: 'pending'
        });

      if (error) throw error;

      toast.success('Feedback enviado com sucesso! Obrigado por nos ajudar a melhorar.');
      
      // Reset form
      setRating(0);
      setCategory('');
      setComment('');
      setUserEmail('');
      onOpenChange?.(false);
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast.error('Erro ao enviar feedback. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const defaultTrigger = (
    <Button variant="outline" className="gap-2">
      <MessageSquare className="w-4 h-4" />
      Dar Feedback
    </Button>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-flu-grena">
            <MessageSquare className="w-5 h-5" />
            Seu Feedback é Importante
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Rating */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-3 block">
              Como você avalia sua experiência?
            </label>
            <div className="flex gap-2 justify-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className="text-2xl transition-colors hover:scale-110 transform"
                >
                  <Star
                    className={`w-8 h-8 ${
                      star <= rating
                        ? 'text-yellow-400 fill-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-3 block">
              Categoria do feedback
            </label>
            <div className="grid grid-cols-2 gap-2">
              {FEEDBACK_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setCategory(cat.id)}
                  className={`p-3 rounded-lg border text-sm font-medium transition-all ${
                    category === cat.id
                      ? 'border-flu-verde bg-flu-verde/10 text-flu-verde'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <span className="mr-2">{cat.emoji}</span>
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Comment */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Comentário (opcional)
            </label>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Conte-nos mais sobre sua experiência..."
              className="resize-none"
              rows={4}
            />
          </div>

          {/* Email */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Email para resposta (opcional)
            </label>
            <input
              type="email"
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
              placeholder="seu@email.com"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-flu-verde/20 focus:border-flu-verde"
            />
          </div>

          {/* Submit */}
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || rating === 0 || !category}
            className="w-full bg-flu-verde hover:bg-flu-verde/90 text-white"
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Enviando...
              </div>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Enviar Feedback
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};