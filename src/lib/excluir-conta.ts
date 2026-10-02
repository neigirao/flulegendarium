import { supabase } from "@/integrations/supabase/client";

/**
 * EXCLUSÃO DE CONTA (Apple 5.1.1).
 *
 * Apaga os dados do Lendas do usuário logado e MANTÉM o login: o banco é
 * compartilhado com outros projetos do mesmo criador, então `auth.users` não
 * é tocado. Quem entrou com a Apple tem o acesso do app revogado na Apple
 * antes de qualquer dado ser apagado.
 */

/** Palavra que a pessoa digita para liberar o botão. */
export const PALAVRA_DE_CONFIRMACAO = "EXCLUIR";

/** Chave de sessionStorage: o login da Apple na web sai da página e volta. */
export const CHAVE_EXCLUSAO_PENDENTE = "lendas:exclusao-pendente";

export const confirmacaoValida = (texto: string): boolean =>
  texto.trim().toUpperCase() === PALAVRA_DE_CONFIRMACAO;

interface UsuarioComIdentidades {
  app_metadata?: { providers?: unknown; provider?: unknown } | null;
  identities?: Array<{ provider?: string }> | null;
}

/** A conta tem login pela Apple? Então a Apple precisa receber a revogação. */
export function usaApple(usuario: UsuarioComIdentidades | null | undefined): boolean {
  if (!usuario) return false;
  const providers = usuario.app_metadata?.providers;
  if (Array.isArray(providers) && providers.includes("apple")) return true;
  if (usuario.app_metadata?.provider === "apple") return true;
  return (usuario.identities ?? []).some((i) => i.provider === "apple");
}

export type TokenDaApple = { token: string; dica: "refresh_token" | "access_token" };

/** Escolhe o token que a Apple devolveu: o de renovação é o preferido. */
export function escolherTokenDaApple(
  sessao: { provider_refresh_token?: string | null; provider_token?: string | null } | null | undefined,
): TokenDaApple | null {
  if (!sessao) return null;
  if (sessao.provider_refresh_token) return { token: sessao.provider_refresh_token, dica: "refresh_token" };
  if (sessao.provider_token) return { token: sessao.provider_token, dica: "access_token" };
  return null;
}

export class ErroDeExclusao extends Error {
  etapa: "apple" | "dados";
  constructor(etapa: "apple" | "dados", mensagem: string) {
    super(mensagem);
    this.etapa = etapa;
  }
}

/** Pede para a Apple encerrar o acesso do app. Falhou? Nada é apagado. */
export async function revogarApple(t: TokenDaApple): Promise<void> {
  const { data, error } = await supabase.functions.invoke("revoke-apple-token", {
    body: { token: t.token, token_type_hint: t.dica },
  });
  if (error) throw new ErroDeExclusao("apple", error.message);
  if (!data || (data as { ok?: boolean }).ok !== true) {
    throw new ErroDeExclusao("apple", "A Apple não confirmou a revogação.");
  }
}

type RpcSemTipo = {
  rpc: (fn: string) => Promise<{ data: unknown; error: { message: string } | null }>;
};

/** Apaga os dados do Lendas da conta logada. Devolve as contagens por tabela. */
export async function apagarDadosDoLendas(): Promise<Record<string, number>> {
  const { data, error } = await (supabase as unknown as RpcSemTipo).rpc("delete_my_lendas_data");
  if (error) throw new ErroDeExclusao("dados", error.message);
  return (data ?? {}) as Record<string, number>;
  }
