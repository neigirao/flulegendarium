import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ExcluirContaDialog } from "./ExcluirContaDialog";

const base = { aberto: true, ocupado: false, erro: null, onFechar: vi.fn(), onConfirmar: vi.fn() };

describe("ExcluirContaDialog", () => {
  it("mantém o botão desabilitado até digitar EXCLUIR", () => {
    const onConfirmar = vi.fn();
    render(<ExcluirContaDialog {...base} onConfirmar={onConfirmar} />);
    const botao = screen.getByRole("button", { name: "Excluir definitivamente" }) as HTMLButtonElement;
    expect(botao.disabled).toBe(true);
    fireEvent.change(screen.getByLabelText(/Digite EXCLUIR/), { target: { value: "EXCLUIR" } });
    expect(botao.disabled).toBe(false);
    fireEvent.click(botao);
    expect(onConfirmar).toHaveBeenCalledTimes(1);
  });

  it("mostra o aviso e o erro", () => {
    render(<ExcluirContaDialog {...base} erro="Nada foi apagado." />);
    expect(screen.getByText(/Não dá para desfazer/)).toBeTruthy();
    expect(screen.getByRole("alert").textContent).toContain("Nada foi apagado.");
  });
});
