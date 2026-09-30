import { useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { deleteAccount } from '@/lib/delete-account';

export function DeleteAccountDialog() {
  const [open, setOpen] = useState(false);
  const [confirmation, setConfirmation] = useState('');
  const [busy, setBusy] = useState(false);
  const inFlight = useRef(false);
  const queryClient = useQueryClient();
  async function confirm() {
    if (confirmation !== 'APAGAR' || inFlight.current) return;
    inFlight.current = true;
    setBusy(true);
    try {
      await deleteAccount();
      queryClient.clear();
      window.location.replace('/');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Não foi possível apagar sua conta. Tente novamente.');
      inFlight.current = false;
      setBusy(false);
    }
  }
  return <AlertDialog open={open} onOpenChange={next => { if (!busy) { setOpen(next); setConfirmation(''); } }}>
    <AlertDialogTrigger asChild><Button variant="destructive" className="touch-target"><Trash2 className="mr-2 h-4 w-4" />Apagar minha conta</Button></AlertDialogTrigger>
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Apagar sua conta?</AlertDialogTitle>
        <AlertDialogDescription>Sua conta, perfil, partidas, rankings, conquistas, comentários e desafios serão apagados permanentemente. Não dá para desfazer. Você poderá criar uma conta nova, mas seus dados não voltarão.</AlertDialogDescription>
      </AlertDialogHeader>
      <label htmlFor="delete-account-confirmation" className="text-sm">Digite APAGAR para confirmar</label>
      <Input id="delete-account-confirmation" value={confirmation} onChange={e => setConfirmation(e.target.value)} disabled={busy} autoComplete="off" />
      <AlertDialogFooter>
        <AlertDialogCancel disabled={busy}>Cancelar</AlertDialogCancel>
        <Button variant="destructive" disabled={busy || confirmation !== 'APAGAR'} onClick={() => void confirm()}>{busy ? 'Apagando...' : 'Apagar definitivamente'}</Button>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>;
}
