
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AlertTriangle } from "lucide-react";

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
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-500" />
            Confirmar Palpite
          </DialogTitle>
          <DialogDescription className="text-base">
            Você tem certeza que o jogador é <strong className="text-flu-grena">"{guess}"</strong>?
            <br />
            <span className="text-sm text-gray-500 mt-2 block">
              Lembre-se: você tem apenas uma tentativa por jogador!
            </span>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button onClick={onConfirm} className="bg-flu-grena hover:bg-flu-grena/90">
            Confirmar Palpite
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
