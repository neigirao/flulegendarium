
import { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, X, Play, Home } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface GameTutorialProps {
  onComplete: () => void;
  onSkip: () => void;
}

const tutorialSteps = [
  {
    title: "Bem-vindo ao Lendas do Flu! 🏆",
    content: "Teste seus conhecimentos sobre os maiores ídolos da história do Fluminense Football Club!",
    image: "/lovable-uploads/0aa3609f-0584-4bf4-8303-e03f50f7e131.png"
  },
  {
    title: "Como Jogar 🎯",
    content: "Você verá a foto de uma lenda tricolor e terá que adivinhar quem é. Use o nome oficial ou apelidos conhecidos!",
    image: "/lovable-uploads/16f7afff-6bba-4b39-a454-daa6c2373151.png"
  },
  {
    title: "Sistema de Pontos ⭐",
    content: "Cada acerto vale 5 pontos! Você tem 3 tentativas por jogador e 60 segundos para responder.",
    image: "/lovable-uploads/1b089617-8fa2-440f-ab41-5192f292f5f3.png"
  },
  {
    title: "Ranking Global 🏅",
    content: "Compare sua pontuação com outros fãs tricolores no ranking global. Será que você conhece mais lendas?",
    image: "/lovable-uploads/20457a11-5436-48c6-906d-82b9451bc16d.png"
  },
  {
    title: "Pronto para começar? 🚀",
    content: "Agora que você já sabe como jogar, que tal testar seus conhecimentos sobre as lendas do Flu?",
    image: "/lovable-uploads/efaf362c-8726-4049-98bc-ebb26dcdd4e1.png"
  }
];

export const GameTutorial = ({ onComplete, onSkip }: GameTutorialProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const navigate = useNavigate();

  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleClose = () => {
    // Redirecionar para home ao fechar o tutorial
    navigate("/");
  };

  const currentTutorial = tutorialSteps[currentStep];

  return (
    <Dialog open={true} onOpenChange={() => {}}>
      <DialogContent className="max-w-lg mx-auto bg-white rounded-2xl shadow-2xl border-0">
        <div className="absolute right-4 top-4 z-50">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
            className="h-8 w-8 rounded-full hover:bg-gray-100"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <DialogTitle className="sr-only">Tutorial do Jogo</DialogTitle>
        
        <div className="text-center space-y-6 p-6">
          {/* Progress indicator */}
          <div className="flex justify-center space-x-2 mb-6">
            {tutorialSteps.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentStep ? 'bg-flu-grena' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>

          {/* Tutorial image */}
          <div className="w-32 h-32 mx-auto mb-6 rounded-full overflow-hidden border-4 border-flu-verde shadow-lg">
            <img 
              src={currentTutorial.image} 
              alt="Tutorial" 
              className="w-full h-full object-cover"
            />
          </div>

          {/* Tutorial content */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-flu-grena">
              {currentTutorial.title}
            </h2>
            <p className="text-gray-600 text-lg leading-relaxed">
              {currentTutorial.content}
            </p>
          </div>

          {/* Navigation buttons */}
          <div className="flex justify-between items-center pt-6">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className="flex items-center gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Anterior
            </Button>

            <div className="flex gap-3">
              {currentStep < tutorialSteps.length - 1 ? (
                <>
                  <Button
                    variant="outline"
                    onClick={onSkip}
                    className="flex items-center gap-2"
                  >
                    Pular Tutorial
                  </Button>
                  <Button
                    onClick={handleNext}
                    className="bg-flu-grena hover:bg-flu-grena/90 text-white flex items-center gap-2"
                  >
                    Próximo
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </>
              ) : (
                <Button
                  onClick={onComplete}
                  className="bg-flu-grena hover:bg-flu-grena/90 text-white flex items-center gap-2 px-8"
                >
                  <Play className="w-4 h-4" />
                  Começar a Jogar!
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
