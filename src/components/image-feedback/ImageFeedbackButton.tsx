import { useState, useCallback } from 'react';
import { Flag } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { reportUserImageFeedback } from '@/services/imageReportService';
import { isImageReported } from '@/services/imageReportService';

interface ImageFeedbackButtonProps {
  itemName: string;
  itemType: 'player' | 'jersey';
  imageUrl: string | null;
  itemId?: string;
  className?: string;
}

export const ImageFeedbackButton = ({
  itemName,
  itemType,
  imageUrl,
  itemId,
  className = ''
}: ImageFeedbackButtonProps) => {
  const [open, setOpen] = useState(false);
  const [sending, setSending] = useState(false);

  const alreadyReported = isImageReported(itemId || itemName, imageUrl || '');

  const handleReport = useCallback(async () => {
    setSending(true);
    try {
      await reportUserImageFeedback(itemName, itemType, imageUrl, itemId);
      toast({
        title: '✅ Obrigado pelo feedback!',
        description: `Problema com a imagem de "${itemName}" foi reportado.`,
      });
      setOpen(false);
    } catch {
      toast({
        title: 'Erro ao reportar',
        description: 'Tente novamente mais tarde.',
        variant: 'destructive',
      });
    } finally {
      setSending(false);
    }
  }, [itemName, itemType, imageUrl, itemId]);

  if (alreadyReported) return null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className={`absolute bottom-2 right-2 z-10 p-1.5 rounded-full bg-background/80 backdrop-blur-sm border border-border shadow-sm hover:bg-destructive/10 hover:border-destructive/50 transition-colors ${className}`}
          title="Reportar problema com imagem"
          aria-label="Reportar imagem com problema"
        >
          <Flag className="w-3.5 h-3.5 text-muted-foreground" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-3" side="top">
        <p className="text-sm font-medium mb-2">Imagem com problema?</p>
        <p className="text-xs text-muted-foreground mb-3">
          Reportar que a imagem de <strong>{itemName}</strong> não está sendo exibida corretamente.
        </p>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setOpen(false)}
            className="flex-1 text-xs"
          >
            Cancelar
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={handleReport}
            disabled={sending}
            className="flex-1 text-xs"
          >
            {sending ? 'Enviando...' : 'Reportar'}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};
