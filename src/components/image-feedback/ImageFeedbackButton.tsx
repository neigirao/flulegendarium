import { useState, useCallback } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { reportUserImageFeedback } from '@/services/imageReportService';
import { isImageReported } from '@/services/imageReportService';

interface ImageFeedbackButtonProps {
  itemName: string;
  itemType: 'player' | 'jersey';
  imageUrl: string | null;
  itemId?: string;
  onReportSent: () => void;
  className?: string;
}

export const ImageFeedbackButton = ({
  itemName,
  itemType,
  imageUrl,
  itemId,
  onReportSent,
  className = ''
}: ImageFeedbackButtonProps) => {
  const [sending, setSending] = useState(false);

  const alreadyReported = isImageReported(itemId || itemName, imageUrl || '');

  const handleReport = useCallback(async () => {
    setSending(true);
    try {
      await reportUserImageFeedback(itemName, itemType, imageUrl, itemId);
      toast({
        title: '✅ Obrigado pelo feedback!',
        description: 'Sua informação nos ajuda a melhorar o jogo. O jogo será encerrado.',
      });
      onReportSent();
    } catch {
      toast({
        title: 'Erro ao reportar',
        description: 'Tente novamente mais tarde.',
        variant: 'destructive',
      });
    } finally {
      setSending(false);
    }
  }, [itemName, itemType, imageUrl, itemId, onReportSent]);

  if (alreadyReported) return null;

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleReport}
      disabled={sending}
      className={`text-xs text-muted-foreground hover:text-destructive gap-1.5 ${className}`}
    >
      <AlertTriangle className="w-3.5 h-3.5" />
      {sending ? 'Enviando...' : 'Tive um problema'}
    </Button>
  );
};
