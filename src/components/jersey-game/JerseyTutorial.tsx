import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Shirt, HelpCircle, AlertTriangle, Lightbulb, ChevronRight, ChevronLeft, X } from "lucide-react";

interface JerseyTutorialProps {
  onComplete: () => void;
  onSkip?: () => void;
}

const tutorialSteps = [
  {
    title: "Bem-vindo ao Quiz das Camisas!",
    content: "Teste seus conhecimentos sobre os uniformes históricos do Fluminense. Você consegue identificar de qual ano é cada camisa?",
    icon: Shirt,
    color: "text-primary"
  },
  {
    title: "Como Jogar",
    content: "Você verá uma camisa histórica do Tricolor e 3 opções de ano. Escolha qual você acha que é o ano correto clicando em uma das opções!",
    icon: HelpCircle,
    color: "text-secondary"
  },
  {
    title: "Atenção!",
    content: "Se errar, é Game Over! Os anos das opções têm diferença de 1 a 3 anos entre si, então preste atenção nos detalhes.",
    icon: AlertTriangle,
    color: "text-destructive"
  },
  {
    title: "Dica de Ouro",
    content: "Preste atenção nos detalhes: patrocínios, fornecedores de material esportivo e estilo do uniforme podem dar pistas sobre a época!",
    icon: Lightbulb,
    color: "text-warning"
  }
];

export const JerseyTutorial = ({ onComplete, onSkip }: JerseyTutorialProps) => {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      onComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const step = tutorialSteps[currentStep];
  const Icon = step.icon;
  const isLastStep = currentStep === tutorialSteps.length - 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
      <Card className="w-full max-w-md animate-in fade-in zoom-in duration-300">
        <CardHeader className="relative">
          {onSkip && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-2"
              onClick={onSkip}
              aria-label="Pular tutorial"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
          
          <div className="flex justify-center mb-4">
            <div className={`p-4 rounded-full bg-muted ${step.color}`}>
              <Icon className="w-12 h-12" />
            </div>
          </div>
          
          <CardTitle className="text-center font-display text-display-sm">
            {step.title}
          </CardTitle>
          
          <CardDescription className="text-center text-base font-body">
            {step.content}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Progress dots */}
          <div className="flex justify-center gap-2">
            {tutorialSteps.map((_, index) => (
              <div
                key={index}
                className={`h-2 w-2 rounded-full transition-colors ${
                  index === currentStep ? 'bg-primary' : 'bg-muted'
                }`}
              />
            ))}
          </div>

          {/* Navigation buttons */}
          <div className="flex justify-between gap-4">
            <Button
              variant="outline"
              onClick={handlePrev}
              disabled={currentStep === 0}
              className="flex-1"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Anterior
            </Button>
            
            <Button
              onClick={handleNext}
              className="flex-1"
            >
              {isLastStep ? (
                "Começar a Jogar!"
              ) : (
                <>
                  Próximo
                  <ChevronRight className="w-4 h-4 ml-1" />
                </>
              )}
            </Button>
          </div>

          {/* Skip link */}
          {onSkip && !isLastStep && (
            <button
              onClick={onSkip}
              className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Pular tutorial
            </button>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default JerseyTutorial;
