import { useState } from "react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PALAVRA_DE_CONFIRMACAO, confirmacaoValida } from "@/lib/excluir-conta";

interface Props {
  aberto: boolean;
  ocupado: boolean;
  erro: string | null;
  onFechar: () => void;
  onConfirmar: () => void;
}

export const ExcluirContaDialog = ({ aberto, ocupado, erro, onFechar, onConfirmar }: Props) => {
  const [texto, setTexto] = useState("");
  const liberado = confirmacaoValida(texto) && !ocupado;

  return (
    <AlertDialog open={aberto} onOpenChange={(v) => { if (!v && !ocupado) { setTexto(""); onFechar(); } }}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir minha conta do Lendas</AlertDialogTitle>
          <AlertDialogDescription>
            Isso apaga o seu progresso, histórico de jogos, conquistas, desafios, posição no ranking e comentários no
            Lendas do Flu. Não dá para desfazer. O seu login (Google ou Apple) continua existindo e pode ser usado em
            outros apps do mesmo criador, mas os dados do Lendas somem. Se você entrou com a Apple, vamos revogar o
            acesso do app à sua conta Apple.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <label className="block text-sm font-body" htmlFor="confirmar-exclusao">
          Digite {PALAVRA_DE_CONFIRMACAO} para confirmar
        </label>
        <Input
          id="confirmar-exclusao"
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          autoComplete="off"
          autoCapitalize="characters"
          className="min-h-11"
          disabled={ocupado}
        />
        {erro && <p role="alert" className="text-sm text-destructive">{erro}</p>}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={ocupado} className="min-h-11">Cancelar</AlertDialogCancel>
          <Button variant="destructive" className="min-h-11" disabled={!liberado} onClick={onConfirmar}>
            {ocupado ? "Excluindo…" : "Excluir definitivamente"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
