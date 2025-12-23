
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowLeft, Target, TrendingUp, Award, Brain } from "lucide-react";

interface AdaptiveTutorialProps {
  isOpen: boolean;
  onComplete: () => void;
}

const tutorialSteps = [
  {
    title: "Bem-vindo ao Quiz Adaptativo!",
    icon: Brain,
    content: (
      <div className="space-y-4">
        <p>Este modo especial ajusta automaticamente a dificuldade baseado no seu desempenho!</p>
        <div className="bg-flu-grena/10 p-4 rounded-lg">
          <p className="text-sm text-flu-grena font-medium">
            🧠 A IA aprende com você e oferece o desafio perfeito
          </p>
        </div>
      </div>
    )
  },
  {
    title: "Como Funciona",
    icon: TrendingUp,
    content: (
      <div className="space-y-4">
        <p>O sistema monitora seu desempenho em tempo real:</p>
        <ul className="space-y-2 text-sm">
          <li className="flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            <strong>Acertando muito?</strong> Dificuldade aumenta
          </li>
          <li className="flex items-center gap-2">
            <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
            <strong>Errando muito?</strong> Dificuldade diminui
          </li>
          <li className="flex items-center gap-2">
            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
            <strong>Mantendo o equilíbrio</strong> Dificuldade estável
          </li>
        </ul>
      </div>
    )
  },
  {
    title: "Níveis de Dificuldade",
    icon: Target,
    content: (
      <div className="space-y-3">
        <p>Existem 5 níveis adaptativos:</p>
        <div className="grid grid-cols-1 gap-2 text-sm">
          <div className="flex items-center gap-2 p-2 bg-green-50 rounded">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span><strong>Muito Fácil:</strong> Ídolos mais conhecidos</span>
          </div>
          <div className="flex items-center gap-2 p-2 bg-blue-50 rounded">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span><strong>Fácil:</strong> Jogadores populares</span>
          </div>
          <div className="flex items-center gap-2 p-2 bg-yellow-50 rounded">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <span><strong>Médio:</strong> Históricos importantes</span>
          </div>
          <div className="flex items-center gap-2 p-2 bg-orange-50 rounded">
            <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
            <span><strong>Difícil:</strong> Lendas menos conhecidas</span>
          </div>
          <div className="flex items-center gap-2 p-2 bg-red-50 rounded">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span><strong>Muito Difícil:</strong> Para verdadeiros experts</span>
          </div>
        </div>
      </div>
    )
  },
  {
    title: "Indicadores Visuais",
    icon: Award,
    content: (
      <div className="space-y-4">
        <p>Acompanhe seu progresso através dos indicadores:</p>
        <ul className="space-y-2 text-sm">
          <li>📊 <strong>Barra de Progresso:</strong> Mostra evolução para próximo nível</li>
          <li>🎯 <strong>Efeitos na Imagem:</strong> Dificuldade afeta nitidez da foto</li>
          <li>🏆 <strong>Notificações:</strong> Avisa quando muda de nível</li>
          <li>📈 <strong>Estatísticas:</strong> Acompanhe seu desempenho</li>
        </ul>
        <div className="bg-flu-verde/10 p-4 rounded-lg">
          <p className="text-sm text-flu-verde font-medium">
            ✨ Quanto melhor você fica, mais desafiante o jogo se torna!
          </p>
        </div>
      </div>
    )
  }
];

export const AdaptiveTutorial = ({ isOpen, onComplete }: AdaptiveTutorialProps) => {
  const [currentStep, setCurrentStep] = useState(0);

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

  const step = tutorialSteps[currentStep];
  const Icon = step.icon;

  return (
    <Dialog open={isOpen}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="p-2 bg-flu-grena rounded-full">
              <Icon className="w-5 h-5 text-white" />
            </div>
            {step.title}
          </DialogTitle>
        </DialogHeader>

        <div className="py-4">
          {step.content}
        </div>

        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex gap-1">
            {tutorialSteps.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentStep ? 'bg-flu-grena' : 'bg-muted'
                }`}
              />
            ))}
          </div>

          <div className="flex gap-2">
            {currentStep > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrevious}
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Anterior
              </Button>
            )}
            
            <Button
              onClick={handleNext}
              className="bg-flu-grena hover:bg-flu-grena/90"
            >
              {currentStep === tutorialSteps.length - 1 ? 'Começar!' : 'Próximo'}
              {currentStep < tutorialSteps.length - 1 && (
                <ArrowRight className="w-4 h-4 ml-1" />
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
