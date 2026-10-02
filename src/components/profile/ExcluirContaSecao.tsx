import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { noAplicativo, reautenticarComApple } from "@/lib/entrar-nativo";
import {
  CHAVE_EXCLUSAO_PENDENTE,
  ErroDeExclusao,
  apagarDadosDoLendas,
  escolherTokenDaApple,
  revogarApple,
  usaApple,
  type TokenDaApple,
} from "@/lib/excluir-conta";
import { ExcluirContaDialog } from "./ExcluirContaDialog";

const MSG_GENERICA = "Não foi possível excluir agora. Nada foi apagado. Tente de novo.";

export const ExcluirContaSecao = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [aberto, setAberto] = useState(() => {
    try { return sessionStorage.getItem(CHAVE_EXCLUSAO_PENDENTE) !== null; } catch { return false; }
  });
  const [ocupado, setOcupado] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const retomou = useRef(false);

  const concluir = useCallback(async (token: TokenDaApple | null) => {
    if (token) await revogarApple(token);
    await apagarDadosDoLendas();
    try { sessionStorage.removeItem(CHAVE_EXCLUSAO_PENDENTE); } catch { /* sem storage */ }
    await signOut();
    toast({ title: "Conta excluída", description: "Seus dados do Lendas foram apagados." });
    navigate("/", { replace: true });
  }, [navigate, signOut, toast]);

  const falhar = useCallback((e: unknown) => {
    console.error("exclusão de conta falhou:", e);
    const etapaApple = e instanceof ErroDeExclusao && e.etapa === "apple";
    setErro(etapaApple ? "Não foi possível revogar o acesso da Apple. Nada foi apagado. Tente de novo." : MSG_GENERICA);
    setOcupado(false);
  }, []);

  const confirmar = async () => {
    if (!user) return;
    setOcupado(true);
    setErro(null);
    try {
      if (!usaApple(user)) { await concluir(null); return; }
      if (noAplicativo()) {
        const r = await reautenticarComApple();
        if (!r.ok) {
          setErro(r.motivo === "cancelado" ? "Confirmação da Apple cancelada. Nada foi apagado." : MSG_GENERICA);
          setOcupado(false);
          return;
        }
        if (r.usuarioId !== user.id) {
          setErro("Use a mesma conta Apple do seu login. Nada foi apagado.");
          setOcupado(false);
          return;
        }
        await concluir({ token: r.token, dica: r.dica });
        return;
      }
      // Web: a Apple tira a pessoa da página e devolve aqui; o retorno é tratado no efeito abaixo.
      sessionStorage.setItem(CHAVE_EXCLUSAO_PENDENTE, user.id);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "apple",
        options: { redirectTo: window.location.origin + "/perfil" },
      });
      if (error) throw error;
    } catch (e) {
      try { sessionStorage.removeItem(CHAVE_EXCLUSAO_PENDENTE); } catch { /* sem storage */ }
      falhar(e);
    }
  };

  // Volta da Apple na web: pega o token do retorno e termina a exclusão.
  useEffect(() => {
    if (!user || retomou.current) return;
    let pendente: string | null = null;
    try { pendente = sessionStorage.getItem(CHAVE_EXCLUSAO_PENDENTE); } catch { return; }
    if (pendente === null) return;
    retomou.current = true;
    setAberto(true);
    setOcupado(true);
    void (async () => {
      try {
        if (pendente !== user.id) throw new Error("conta_diferente");
        const { data } = await supabase.auth.getSession();
        const token = escolherTokenDaApple(data.session);
        if (!token) throw new Error("sem_token_da_apple");
        await concluir(token);
      } catch (e) {
        try { sessionStorage.removeItem(CHAVE_EXCLUSAO_PENDENTE); } catch { /* sem storage */ }
        falhar(e);
      }
    })();
  }, [user, concluir, falhar]);

  if (!user) return null;

  return (
    <>
      <Card className="mt-8 border-destructive/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg font-display">
            <Trash2 className="w-5 h-5 text-destructive" />
            Excluir conta
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground font-body mb-4">
            Apaga seus dados do Lendas do Flu. Não dá para desfazer.
          </p>
          <Button variant="destructive" className="min-h-11 font-display" onClick={() => { setErro(null); setAberto(true); }}>
            Excluir minha conta
          </Button>
        </CardContent>
      </Card>
      <ExcluirContaDialog
        aberto={aberto}
        ocupado={ocupado}
        erro={erro}
        onFechar={() => setAberto(false)}
        onConfirmar={() => void confirmar()}
      />
    </>
  );
};
