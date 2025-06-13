
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface GuessConfirmDialogProps {
  open: boolean;
  guess: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const GuessConfirmDialog = ({
  open,
  guess,
  onConfirm,
  onCancel,
}: GuessConfirmDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={() => onCancel()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirmar Palpite</DialogTitle>
          <DialogDescription>
            Você tem certeza que o jogador é <strong>"{guess}"</strong>?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button onClick={onConfirm} className="bg-flu-grena">
            Confirmar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
