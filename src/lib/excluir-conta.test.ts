import { describe, it, expect, vi, beforeEach } from "vitest";

const invoke = vi.fn();
const rpc = vi.fn();
vi.mock("@/integrations/supabase/client", () => ({
  supabase: { functions: { invoke: (...a: unknown[]) => invoke(...a) }, rpc: (...a: unknown[]) => rpc(...a) },
}));

import {
  apagarDadosDoLendas,
  confirmacaoValida,
  ErroDeExclusao,
  escolherTokenDaApple,
  revogarApple,
  usaApple,
} from "./excluir-conta";

beforeEach(() => { invoke.mockReset(); rpc.mockReset(); });

describe("exclusão de conta", () => {
  it("só libera com a palavra EXCLUIR", () => {
    expect(confirmacaoValida("EXCLUIR")).toBe(true);
    expect(confirmacaoValida("  excluir ")).toBe(true);
    expect(confirmacaoValida("exclui")).toBe(false);
    expect(confirmacaoValida("")).toBe(false);
  });

  it("detecta login pela Apple", () => {
    expect(usaApple({ app_metadata: { providers: ["google", "apple"] } })).toBe(true);
    expect(usaApple({ identities: [{ provider: "apple" }] })).toBe(true);
    expect(usaApple({ app_metadata: { providers: ["google"] } })).toBe(false);
    expect(usaApple(null)).toBe(false);
  });

  it("prefere o token de renovação da Apple", () => {
    expect(escolherTokenDaApple({ provider_refresh_token: "r", provider_token: "a" })).toEqual({ token: "r", dica: "refresh_token" });
    expect(escolherTokenDaApple({ provider_token: "a" })).toEqual({ token: "a", dica: "access_token" });
    expect(escolherTokenDaApple({})).toBeNull();
  });

  it("não segue se a Apple não confirmar a revogação", async () => {
    invoke.mockResolvedValue({ data: { ok: false }, error: null });
    await expect(revogarApple({ token: "t".repeat(12), dica: "refresh_token" })).rejects.toBeInstanceOf(ErroDeExclusao);
    invoke.mockResolvedValue({ data: null, error: { message: "falhou" } });
    await expect(revogarApple({ token: "t".repeat(12), dica: "refresh_token" })).rejects.toMatchObject({ etapa: "apple" });
  });

  it("chama a função do banco e devolve as contagens", async () => {
    rpc.mockResolvedValue({ data: { rankings: 3 }, error: null });
    await expect(apagarDadosDoLendas()).resolves.toEqual({ rankings: 3 });
    expect(rpc).toHaveBeenCalledWith("delete_my_lendas_data");
    rpc.mockResolvedValue({ data: null, error: { message: "boom" } });
    await expect(apagarDadosDoLendas()).rejects.toMatchObject({ etapa: "dados" });
  });
});
