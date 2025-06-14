
import { Achievement } from "@/types/achievements";
import { useToast } from '@/components/ui/use-toast';
import { useEffect } from 'react';

interface ShareSuccessToastProps {
  achievement?: Achievement;
  trigger: boolean;
}

export const ShareSuccessToast = ({ achievement, trigger }: ShareSuccessToastProps) => {
  const { toast } = useToast();

  useEffect(() => {
    if (trigger && achievement) {
      toast({
        title: "🎉 Compartilhamento realizado!",
        description: `Parabéns pela conquista: ${achievement.name}`,
        duration: 4000,
      });
    }
  }, [trigger, achievement, toast]);

  return null;
};
