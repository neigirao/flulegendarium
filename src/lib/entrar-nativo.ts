import { Capacitor, registerPlugin } from "@capacitor/core";
import { supabase } from "@/integrations/supabase/client";

/**
 * ENTRAR NA CONTA DE DENTRO DO APP, ONDE NÃO EXISTE "VOLTAR PARA O SITE".
 *
 * Na web, `signInWithOAuth` com `redirectTo: window.location.origin` devolve a
 * pessoa para o site. Dentro do app o `origin` é `capacitor://localhost`, que
 * não é endereço de internet: o provedor abre no Safari e nunca volta ao app —
 * o defeito relatado na primeira build de teste ("fiz login e fiquei preso no
 * navegador").
 *
 * O caminho nativo: o app abre uma janela de login, o provedor devolve para um
 * ESQUEMA que só este app atende (`lendasdoflu://entrar`), e essa URL volta ao
 * app. O código ou os tokens que vêm nela viram uma sessão.
 *
 * O QUE PRECISA ESTAR REGISTRADO FORA DAQUI — SEM ISSO, NADA FUNCIONA:
 * 1. `lendasdoflu://entrar` na lista de Redirect URLs do Supabase
 *    (Authentication → URL Configuration). O provedor recusa qualquer endereço
 *    que não esteja lá, antes de o app ver qualquer coisa.
 * 2. O esquema `lendasdoflu` no `Info.plist` (`CFBundleURLTypes`).
 *
 * DOIS FORMATOS DE RETORNO: implícito (tokens no FRAGMENTO, fecha com
 * `setSession`) e PKCE (`code` na QUERY, fecha com `exchangeCodeForSession`).
 * O cliente em `src/integrations/supabase/client.ts` é gerado pela Lovable,
 * não define `flowType`, e o padrão do supabase-js é o implícito — mas os dois
 * são lidos aqui para o login não quebrar se o cliente mudar.
 *
 * NO iOS a janela NÃO pode ser o `@capacitor/browser` (SFSafariViewController
 * não abre esquemas próprios — engole o redirect em silêncio). Por isso o
 * plugin nativo `ios/App/App/LoginNativoPlugin.swift` expõe a
 * `ASWebAuthenticationSession`, que recebe o esquema como parâmetro e devolve
 * a URL de retorno. No Android o Custom Tabs segue o esquema e entrega a URL
 * pelo evento `appUrlOpen`, então o navegador serve.
 */

/** O esquema que só este app atende. Tem que bater com o `Info.plist`. */
export const ESQUEMA = "lendasdoflu";

/** Para onde o provedor devolve. Tem que estar registrado no Supabase. */
export const RETORNO_NATIVO = `${ESQUEMA}://entrar`;

export type RetornoDoLogin =
  | { tipo: "codigo"; codigo: string }
  | { tipo: "sessao"; acesso: string; atualizacao: string }
  | { tipo: "erro"; motivo: string }
  | { tipo: "ignorar" };

/**
 * O que veio na URL que o sistema entregou ao app. O app recebe QUALQUER deep
 * link, não só o do login: URL de outro esquema ou sem código é ignorada em
 * silêncio — tratá-la como erro mostraria "não deu para entrar" para quem nem
 * estava tentando entrar.
 */
export function lerRetornoDoLogin(url: string): RetornoDoLogin {
  let lida: URL;
  try {
    lida = new URL(url);
  } catch {
    return { tipo: "ignorar" };
  }
  if (lida.protocol !== `${ESQUEMA}:`) return { tipo: "ignorar" };

  const fragmento = new URLSearchParams(lida.hash.replace(/^#/, ""));

  const acesso = fragmento.get("access_token");
  const atualizacao = fragmento.get("refresh_token");
  if (acesso !== null && acesso !== "" && atualizacao !== null && atualizacao !== "") {
    return { tipo: "sessao", acesso, atualizacao };
  }

  const codigo = lida.searchParams.get("code");
  if (codigo !== null && codigo !== "") return { tipo: "codigo", codigo };

  for (const fonte of [fragmento, lida.searchParams]) {
    const erro = fonte.get("error");
    if (erro !== null && erro !== "") {
      return { tipo: "erro", motivo: fonte.get("error_description") ?? erro };
    }
  }
  return { tipo: "ignorar" };
}

/** Se o app está rodando dentro de um aplicativo, e não num navegador. */
export const noAplicativo = (): boolean => Capacitor.isNativePlatform();

interface JanelaDeLogin {
  abrir(opcoes: { url: string; esquema: string }): Promise<{ url?: string; cancelado?: boolean }>;
}

/*
 * Só existe no iOS. Registrar no Android ou na web devolve um objeto que
 * rejeita quando chamado — e ninguém o chama nessas plataformas, porque
 * `entrarNoAplicativo` escolhe pelo `getPlatform()`.
 */
const LoginNativo = registerPlugin<JanelaDeLogin>("LoginNativo");

/** iOS: a janela da Apple, que devolve o endereço de retorno a quem chamou. */
async function pelaJanelaDeAutenticacao(url: string): Promise<RetornoDoLogin | "cancelado"> {
  const r = await LoginNativo.abrir({ url, esquema: ESQUEMA });
  if (r.cancelado === true) return "cancelado";
  if (r.url === undefined || r.url === "") return "cancelado";
  return lerRetornoDoLogin(r.url);
}

/** Android: o navegador segue o esquema, e o sistema entrega a URL ao app. */
async function peloNavegadorEOEsquema(url: string): Promise<RetornoDoLogin | "cancelado"> {
  const [{ App }, { Browser }] = await Promise.all([
    import("@capacitor/app"),
    import("@capacitor/browser"),
  ]);

  /*
   * Os dois ouvintes são registrados ANTES de abrir o navegador. Registrar
   * depois abre uma janela em que o retorno chega antes de haver quem o
   * escute — e num login rápido, com a sessão do provedor já ativa, essa
   * janela é o caso normal, não o raro.
   */
  const retorno = await new Promise<RetornoDoLogin | "cancelado">((resolve) => {
    let pronto = false;
    const terminar = (r: RetornoDoLogin | "cancelado") => {
      if (pronto) return;
      pronto = true;
      resolve(r);
    };
    void App.addListener("appUrlOpen", ({ url: recebida }) => {
      const lido = lerRetornoDoLogin(recebida);
      if (lido.tipo !== "ignorar") terminar(lido);
    });
    void Browser.addListener("browserFinished", () => terminar("cancelado"));
    void Browser.open({ url });
  });

  await App.removeAllListeners();
  await Browser.removeAllListeners();

  if (retorno !== "cancelado" && (retorno.tipo === "codigo" || retorno.tipo === "sessao")) {
    await Browser.close();
  }
  return retorno;
}

/**
 * Abre o provedor, espera o retorno, e troca o código por uma sessão.
 *
 * Resolve com `null` quando deu certo, ou com o motivo quando não deu —
 * inclusive `"cancelado"` quando a pessoa fechou a janela, que NÃO é erro.
 * Esta função nunca estoura: quem chama faz setState de "abrindo…" antes e
 * depois do `await`, e uma exceção pularia o "depois" — botão travado para
 * sempre, sem erro na tela. Qualquer falha vira um motivo devolvido.
 */
export async function entrarNoAplicativo(
  provedor: "google" | "apple",
): Promise<null | "cancelado" | string> {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: provedor,
      options: { redirectTo: RETORNO_NATIVO, skipBrowserRedirect: true },
    });
    if (error) return error.message;
    if (!data.url) return "sem_url";

    const retorno =
      Capacitor.getPlatform() === "ios"
        ? await pelaJanelaDeAutenticacao(data.url)
        : await peloNavegadorEOEsquema(data.url);

    if (retorno === "cancelado") return "cancelado";
    if (retorno.tipo === "erro") return retorno.motivo;
    if (retorno.tipo === "ignorar") return "cancelado";

    /*
     * `setSession` NÃO é atalho: no fluxo implícito o provedor já emitiu os
     * tokens, e não existe código para trocar — `exchangeCodeForSession` aqui
     * falharia pedindo um `code_verifier` que nunca foi gerado.
     */
    if (retorno.tipo === "sessao") {
      const posta = await supabase.auth.setSession({
        access_token: retorno.acesso,
        refresh_token: retorno.atualizacao,
      });
      return posta.error ? posta.error.message : null;
    }

    const troca = await supabase.auth.exchangeCodeForSession(retorno.codigo);
    return troca.error ? troca.error.message : null;
  } catch (falha) {
    return falha instanceof Error ? falha.message : "falha_inesperada";
  }
}
