
import React, { useState } from "react";
import { X, Bug, Send } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import html2canvas from "html2canvas";

interface BugReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPlayerName?: string;
  currentPlayerId?: string;
}

export const BugReportModal: React.FC<BugReportModalProps> = ({
  isOpen,
  onClose,
  currentPlayerName,
  currentPlayerId,
}) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const location = useLocation();

  // Handle modal click to prevent closing when clicking inside
  const handleModalClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const captureScreenshot = async (): Promise<string | null> => {
    try {
      // Find the app root (excluding the modal itself)
      const appRoot = document.getElementById("root");
      if (!appRoot) return null;

      // Take screenshot
      const canvas = await html2canvas(appRoot, {
        logging: false,
        allowTaint: true,
        useCORS: true,
      });

      // Convert to base64 data URL
      return canvas.toDataURL("image/png");
    } catch (error) {
      console.error("Failed to capture screenshot:", error);
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !email.trim() || !description.trim()) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos.",
        variant: "destructive",
      });
      return;
    }

    if (!email.includes("@") || !email.includes(".")) {
      toast({
        title: "Email inválido",
        description: "Por favor, forneça um email válido.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);

      // Capture screenshot
      const screenshotData = await captureScreenshot();

      // Insert bug report into Supabase
      const { error } = await supabase.from("bugs").insert({
        name,
        email,
        description,
        player_id: currentPlayerId || null,
        player_name: currentPlayerName || null,
        screenshot_url: screenshotData,
        page_url: window.location.href,
      });

      if (error) throw error;

      toast({
        title: "Bug reportado com sucesso!",
        description: "Obrigado pela sua contribuição para melhorar o jogo.",
      });

      // Reset form and close modal
      setName("");
      setEmail("");
      setDescription("");
      onClose();
    } catch (error) {
      console.error("Error submitting bug report:", error);
      toast({
        title: "Erro ao enviar",
        description: "Não foi possível enviar seu relatório. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden"
        onClick={handleModalClick}
      >
        <div className="flex items-center justify-between bg-flu-grena p-4 text-white">
          <div className="flex items-center gap-2">
            <Bug className="h-5 w-5" />
            <h2 className="text-lg font-semibold">Reportar Bug</h2>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-1">
            <label htmlFor="name" className="text-sm font-medium">
              Seu nome
            </label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Digite seu nome"
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="email" className="text-sm font-medium">
              Seu email
            </label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Digite seu email"
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="description" className="text-sm font-medium">
              Descrição do bug
            </label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva o bug com detalhes"
              rows={4}
              disabled={isSubmitting}
            />
          </div>

          {currentPlayerName && (
            <div className="p-3 bg-gray-50 rounded-md text-sm">
              <p className="font-medium">Jogador atual:</p>
              <p>{currentPlayerName}</p>
            </div>
          )}

          <div className="pt-2">
            <Button
              type="submit"
              className="w-full bg-flu-verde hover:bg-flu-verde/90"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                "Enviando..."
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" /> Enviar Relatório
                </>
              )}
            </Button>
          </div>

          <p className="text-xs text-gray-500 text-center mt-2">
            Um screenshot da tela atual será capturado automaticamente.
          </p>
        </form>
      </div>
    </div>
  );
};
