
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Brain, Target, Zap, TrendingUp } from "lucide-react";

interface GameModeSelectorProps {
  onModeSelect: (mode: 'classic' | 'adaptive') => void;
}

export const GameModeSelector = ({ onModeSelect }: GameModeSelectorProps) => {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-flu-grena mb-4">Escolha seu Modo de Jogo</h2>
        <p className="text-lg text-gray-600">
          Cada modo oferece uma experiência única para testar seu conhecimento tricolor
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Classic Mode */}
        <Card className="shadow-2xl border-0 bg-white relative overflow-hidden hover:scale-105 transition-transform duration-300">
          <CardHeader className="text-center pb-4">
            <div className="flex items-center justify-center w-20 h-20 bg-flu-grena/10 rounded-full mx-auto mb-6 border-2 border-flu-grena/30">
              <Target className="w-10 h-10 text-flu-grena" />
            </div>
            <CardTitle className="text-2xl font-bold text-flu-grena mb-4">MODO CLÁSSICO</CardTitle>
            <p className="text-lg text-gray-600 leading-relaxed">
              Jogue com dificuldade fixa e desafie seus conhecimentos sobre as lendas do Fluminense.
            </p>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 bg-flu-grena rounded-full"></div>
                <span>Dificuldade estável</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 bg-flu-grena rounded-full"></div>
                <span>Ideal para iniciantes</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 bg-flu-grena rounded-full"></div>
                <span>Progressão linear</span>
              </div>
            </div>
            <Button
              onClick={() => onModeSelect('classic')}
              size="lg"
              className="w-full bg-flu-grena hover:bg-flu-grena/90 text-white font-bold py-4 text-lg shadow-lg"
            >
              <Target className="mr-3" size={24} />
              Jogar Clássico
            </Button>
          </CardContent>
        </Card>

        {/* Adaptive Mode */}
        <Card className="shadow-2xl border-0 bg-gradient-to-br from-flu-verde via-flu-verde to-flu-grena text-white relative overflow-hidden hover:scale-105 transition-transform duration-300">
          <div className="absolute inset-0 bg-black/10"></div>
          <CardHeader className="text-center relative z-10 pb-4">
            <div className="flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full mx-auto mb-6 border-2 border-white/30">
              <Brain className="w-10 h-10 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold mb-4">MODO ADAPTATIVO</CardTitle>
            <div className="inline-flex items-center gap-2 bg-yellow-500 text-yellow-900 px-3 py-1 rounded-full text-sm font-bold mb-4">
              <Zap className="w-4 h-4" />
              NOVO!
            </div>
            <p className="text-lg opacity-90 leading-relaxed">
              IA que se adapta ao seu nível! A dificuldade muda baseada no seu desempenho em tempo real.
            </p>
          </CardHeader>
          <CardContent className="relative z-10 pt-2">
            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                <span>Dificuldade inteligente</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                <span>Desafio personalizado</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                <span>Progressão otimizada</span>
              </div>
            </div>
            <Button
              onClick={() => onModeSelect('adaptive')}
              size="lg"
              className="w-full bg-white text-flu-verde hover:bg-gray-100 font-bold py-4 text-lg shadow-lg"
            >
              <Brain className="mr-3" size={24} />
              Jogar Adaptativo
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Comparison */}
      <div className="mt-12 text-center">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-gray-100">
          <h3 className="text-2xl font-bold text-flu-grena mb-6">Por que escolher o Modo Adaptativo?</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div>
              <div className="w-16 h-16 bg-flu-verde/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-flu-verde" />
              </div>
              <h4 className="font-semibold text-flu-grena mb-2">Aprendizado Otimizado</h4>
              <p className="text-gray-600">A IA ajusta a dificuldade para maximizar seu aprendizado</p>
            </div>
            <div>
              <div className="w-16 h-16 bg-flu-grena/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Brain className="w-8 h-8 text-flu-grena" />
              </div>
              <h4 className="font-semibold text-flu-grena mb-2">Desafio Personalizado</h4>
              <p className="text-gray-600">Cada jogador tem uma experiência única e desafiadora</p>
            </div>
            <div>
              <div className="w-16 h-16 bg-orange-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-orange-500" />
              </div>
              <h4 className="font-semibold text-flu-grena mb-2">Engajamento Máximo</h4>
              <p className="text-gray-600">Mantém o jogo interessante, nem fácil nem impossível</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
