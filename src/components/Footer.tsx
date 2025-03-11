
import React, { useState } from "react";
import { Bug } from "lucide-react";
import { BugReportModal } from "./BugReportModal";
import { Button } from "@/components/ui/button";

interface FooterProps {
  currentPlayerName?: string;
  currentPlayerId?: string;
}

export const Footer: React.FC<FooterProps> = ({ 
  currentPlayerName, 
  currentPlayerId 
}) => {
  const [isBugModalOpen, setIsBugModalOpen] = useState(false);

  return (
    <footer className="w-full py-4 px-4 bg-white/80 backdrop-blur-sm border-t border-gray-200 mt-auto">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
        <div className="text-center md:text-left text-xs text-gray-500 mb-2 md:mb-0">
          <p>© 2024 Flu Legendarium</p>
          <p>Não afiliado oficialmente ao Fluminense F.C.</p>
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsBugModalOpen(true)}
          className="text-flu-grena border-flu-grena hover:bg-flu-grena/10"
        >
          <Bug className="mr-2 h-4 w-4" />
          Reportar Bug
        </Button>
      </div>

      <BugReportModal
        isOpen={isBugModalOpen}
        onClose={() => setIsBugModalOpen(false)}
        currentPlayerName={currentPlayerName}
        currentPlayerId={currentPlayerId}
      />
    </footer>
  );
};
