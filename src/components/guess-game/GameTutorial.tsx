
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Clock, Trophy, Target, X } from "lucide-react";

interface GameTutorialProps {
  onComplete: () => void;
  onSkip: () => void;
}

export const GameTutorial = ({ onComplete, onSkip }: GameTutorialProps) => {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: "Bem-vindo ao Lendas do Flu!",
      icon: <Trophy className="w-8 h-8 text-flu-grena" />,
      content: (
        <div className="space-y-4">
          <p>Teste seus conhecimentos sobre os ídolos tricolores!</p>
          <p>Você verá uma foto de um jogador lendário do Fluminense e terá que adivinhar quem é.</p>
        </div>
      )
    },
    {
      title: "Como Jogar",
      icon: <Target className="w-8 h-8 text-flu-grena" />,
      content: (
        <div className="space-y-4">
          <p><strong>1.</strong> Uma foto de um jogador será exibida</p>
          <p><strong>2.</strong> Digite o nome ou apelido do jogador</p>
          <p><strong>3.</strong> Confirme seu palpite</p>
          <p><strong>4.</strong> Você tem apenas <strong>1 tentativa</strong> por jogador!</p>
        </div>
      )
    },
    {
      title: "Tempo Limite",
      icon: <Clock className="w-8 h-8 text-flu-grena" />,
      content: (
        <div className="space-y-4">
          <p>Você tem <strong>30 segundos</strong> para cada jogador!</p>
          <p>O cronômetro aparece no canto da tela.</p>
          <p>Se o tempo acabar, você perde automaticamente.</p>
        </div>
      )
    },
    {
      title: "Sistema de Pontuação",
      icon: <Trophy className="w-8 h-8 text-flu-grena" />,
      content: (
        <div className="space-y-4">
          <p><strong>Acertou:</strong> +5 pontos</p>
          <p><strong>Errou ou tempo esgotou:</strong> Game Over</p>
          <p>Tente fazer o maior número de acertos consecutivos!</p>
          <p>Seu recorde será salvo no ranking.</p>
        </div>
      )
    },
    {
      title: "Dicas Importantes",
      icon: <Target className="w-8 h-8 text-flu-verde" />,
      content: (
        <div className="space-y-4">
          <p><strong>✓</strong> Você pode usar nomes oficiais ou apelidos</p>
          <p><strong>✓</strong> Exemplo: "Fred", "Frederico" ou "Chaves Guedes"</p>
          <p><strong>✓</strong> Não é necessário ser exato, nomes parciais funcionam</p>
          <p><strong>✓</strong> Foque nos jogadores mais famosos da história</p>
        </div>
      )
    }
  ];

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {steps[currentStep].icon}
              <CardTitle className="text-xl">
                {steps[currentStep].title}
              </CardTitle>
            </div>
            <Button variant="ghost" size="icon" onClick={onSkip}>
              <X size={20} />
            </Button>
          </div>
          <div className="text-sm text-gray-500">
            Passo {currentStep + 1} de {steps.length}
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="min-h-[120px]">
            {steps[currentStep].content}
          </div>

          {/* Progress bar */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-flu-grena h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>

          <div className="flex justify-between gap-3">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 0}
              className="flex-1"
            >
              Anterior
            </Button>

            {currentStep === steps.length - 1 ? (
              <Button onClick={onComplete} className="flex-1 bg-flu-grena">
                Começar Jogo!
              </Button>
            ) : (
              <Button onClick={nextStep} className="flex-1 bg-flu-grena">
                Próximo
                <ArrowRight size={16} className="ml-1" />
              </Button>
            )}
          </div>

          <Button
            variant="link"
            onClick={onSkip}
            className="w-full text-gray-500"
          >
            Pular Tutorial
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
