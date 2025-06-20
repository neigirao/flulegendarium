
import { SEOHead } from "@/components/SEOHead";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ArrowLeft, HelpCircle, MessageCircle, Trophy, Users, GamepadIcon, Shield, Instagram, Brain } from "lucide-react";

const faqData = [
  {
    category: "Sobre o Jogo",
    icon: GamepadIcon,
    questions: [
      {
        question: "O que é Lendas do Flu?",
        answer: "Lendas do Flu é um quiz adaptativo onde você testa seus conhecimentos sobre os jogadores históricos e atuais do Fluminense FC. Veja a foto do jogador e tente adivinhar quem é! É o desafio perfeito para todo tricolor que se preza."
      },
      {
        question: "Como funciona o jogo?",
        answer: "É muito simples! Uma foto de um jogador do Fluminense aparece na tela e você tem que adivinhar o nome correto. Você tem apenas 30 segundos e UMA tentativa por jogador. Cada acerto vale pontos e você compete no ranking global com outros tricolores."
      },
      {
        question: "Como funciona o sistema adaptativo?",
        answer: "O sistema adaptativo ajusta automaticamente a dificuldade do jogo baseado no seu desempenho. Acertou várias seguidas? O jogo fica mais difícil. Errou? Diminui um pouco a dificuldade. É como ter um treinador pessoal para seu conhecimento tricolor!"
      },
      {
        question: "Como funciona a progressão de dificuldade?",
        answer: "Começamos com jogadores mais conhecidos (Muito Fácil). Conforme você acerta consecutivamente, a dificuldade aumenta gradualmente: Fácil → Médio → Difícil → Muito Difícil, mostrando jogadores mais históricos ou menos conhecidos. Se você errar, a dificuldade diminui para manter o jogo desafiador mas justo."
      },
      {
        question: "O jogo é gratuito?",
        answer: "Sim! Lendas do Flu é completamente gratuito. Você pode jogar como convidado sem nenhuma restrição. Para aparecer no ranking oficial, basta inserir seu nome após cada partida."
      },
      {
        question: "Quantos jogadores estão no jogo?",
        answer: "Temos uma base crescente com dezenas de jogadores históricos e atuais do Fluminense, desde os clássicos como Castilho e Telê Santana até os ídolos mais recentes. Novos jogadores são adicionados regularmente!"
      }
    ]
  },
  {
    category: "Sistema Adaptativo",
    icon: Brain,
    questions: [
      {
        question: "Por que usar um sistema adaptativo?",
        answer: "O sistema adaptativo oferece uma experiência personalizada que se ajusta ao seu nível de conhecimento. Isso mantém o jogo sempre desafiador, mas não impossível, maximizando seu aprendizado e diversão."
      },
      {
        question: "Como o jogo sabe qual dificuldade usar?",
        answer: "O sistema analisa seu desempenho em tempo real. Três acertos consecutivos aumentam a dificuldade, dois erros consecutivos diminuem. Assim você sempre tem um desafio equilibrado para seu nível atual."
      },
      {
        question: "Posso escolher a dificuldade manualmente?",
        answer: "Não, a dificuldade é totalmente automática. Isso garante que você sempre tenha o nível ideal de desafio baseado na sua performance atual, tornando o jogo mais justo e envolvente."
      },
      {
        question: "O que significam os níveis de dificuldade?",
        answer: "Temos 5 níveis: Muito Fácil (jogadores icônicos), Fácil (jogadores conhecidos), Médio (moderadamente conhecidos), Difícil (menos conhecidos) e Muito Difícil (jogadores históricos/obscuros). Cada nível tem pontuação diferente!"
      }
    ]
  },
  {
    category: "Como Jogar",
    icon: Trophy,
    questions: [
      {
        question: "Como começar a jogar?",
        answer: "Clique em 'Jogar Quiz Agora' na página inicial, escolha jogar como convidado, passe pelo tutorial (se for sua primeira vez) e comece a testar seus conhecimentos tricolores!"
      },
      {
        question: "Posso tentar mais de uma vez por jogador?",
        answer: "Não! Você tem apenas UMA tentativa por jogador. Se errar ou o tempo esgotar, é Game Over. Isso torna o jogo mais desafiador e emocionante!"
      },
      {
        question: "Quanto tempo tenho para responder?",
        answer: "Você tem exatos 30 segundos para cada jogador. O cronômetro aparece na tela e quando chega a zero, é Game Over automaticamente."
      },
      {
        question: "Como funciona a pontuação?",
        answer: "Os pontos variam conforme a dificuldade do jogador - jogadores mais difíceis valem mais pontos! No nível Muito Fácil você ganha 2,5 pontos, Fácil: 3,75 pontos, Médio: 5 pontos, Difícil: 7,5 pontos e Muito Difícil: 10 pontos por acerto."
      },
      {
        question: "Posso usar nomes e apelidos?",
        answer: "Sim! Você pode usar tanto nomes oficiais quanto apelidos famosos. Por exemplo: 'Fred', 'Frederico' ou 'Chaves Guedes' - todos funcionam. O sistema é inteligente e reconhece variações dos nomes."
      }
    ]
  },
  {
    category: "Regras Importantes",
    icon: Shield,
    questions: [
      {
        question: "O que acontece se eu trocar de aba?",
        answer: "GAME OVER IMEDIATO! Se você trocar de aba, minimizar ou sair da janela durante o jogo, o jogo termina automaticamente. Esta regra evita que você consulte outras fontes. Mantenha o foco!"
      },
      {
        question: "Por que essa regra existe?",
        answer: "Para manter a justiça e o desafio do jogo. Queremos testar seu conhecimento real sobre o Fluminense, não sua habilidade de pesquisar no Google!"
      },
      {
        question: "E se minha conexão cair?",
        answer: "Infelizmente, problemas de conexão também resultam em Game Over. Certifique-se de ter uma conexão estável antes de começar uma partida séria."
      }
    ]
  },
  {
    category: "Ranking e Perfil",
    icon: Users,
    questions: [
      {
        question: "Como apareço no ranking?",
        answer: "Após cada partida, você pode inserir seu nome para aparecer no ranking global. Se quiser, pode adicionar seu @ do Instagram para que sua foto apareça no ranking e seu nome vire um link para seu perfil!"
      },
      {
        question: "Como adicionar meu Instagram ao ranking?",
        answer: "Ao salvar sua pontuação, coloque seu nome seguido de (@seuinstagram). Por exemplo: 'João Silva (@joaosilva)'. Assim sua foto do Instagram aparecerá no ranking e seu nome virará um link para seu perfil."
      },
      {
        question: "Posso alterar meu nome no ranking?",
        answer: "Cada entrada no ranking é individual por partida. Para mudar como você aparece, simplesmente use o nome desejado (com ou sem Instagram) na próxima vez que salvar uma pontuação."
      },
      {
        question: "Como funciona o ranking?",
        answer: "O ranking mostra as melhores pontuações de todos os jogadores. Quanto maior sua pontuação, melhor sua posição. Jogadores com Instagram aparecem com foto e link para o perfil."
      }
    ]
  },
  {
    category: "Problemas Técnicos",
    icon: Shield,
    questions: [
      {
        question: "As imagens não carregam. O que fazer?",
        answer: "Verifique sua conexão com a internet primeiro. Se o problema persistir, tente atualizar a página (F5) ou limpar o cache do navegador (Ctrl+F5)."
      },
      {
        question: "O jogo está lento. Como resolver?",
        answer: "Feche outras abas do navegador para liberar memória. O jogo funciona melhor em navegadores atualizados como Chrome, Firefox ou Safari. Evite usar navegadores muito antigos."
      },
      {
        question: "Funciona no celular?",
        answer: "Perfeitamente! Lendas do Flu é totalmente otimizado para celulares e tablets. A experiência mobile é tão boa quanto no desktop."
      },
      {
        question: "Minha pontuação não foi salva!",
        answer: "Isso pode acontecer se houve problema de conexão durante o salvamento. Certifique-se de ter uma conexão estável ao salvar sua pontuação no ranking."
      },
      {
        question: "O cronômetro está travando!",
        answer: "Isso pode acontecer em conexões muito lentas. Tente fechar outras abas e aplicativos que usam internet. Se persistir, atualize a página e tente novamente."
      }
    ]
  }
];

export default function FAQ() {
  return (
    <>
      <SEOHead 
        title="FAQ - Perguntas Frequentes | Lendas do Flu"
        description="Tire suas dúvidas sobre o Lendas do Flu. Encontre respostas para as perguntas mais comuns sobre como jogar, ranking, pontuação e muito mais."
        keywords="faq lendas do flu, perguntas frequentes fluminense, ajuda quiz tricolor, dúvidas jogo fluminense"
        url="https://flulegendarium.lovable.app/faq"
      />
      
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm py-4">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" asChild>
                <Link to="/" className="flex items-center gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  Voltar
                </Link>
              </Button>
              <div className="flex items-center gap-3">
                <img 
                  src="/lovable-uploads/0aa3609f-0584-4bf4-8303-e03f50f7e131.png" 
                  alt="Escudo do Fluminense FC" 
                  className="w-8 h-8 object-contain"
                />
                <div>
                  <h1 className="text-2xl font-bold text-flu-grena">FAQ</h1>
                  <p className="text-sm text-gray-600">Perguntas Frequentes</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="py-12 bg-gradient-to-br from-flu-grena to-flu-verde text-white">
          <div className="container mx-auto px-4 text-center">
            <div className="flex items-center justify-center gap-3 mb-6">
              <HelpCircle className="w-12 h-12" />
            </div>
            <h2 className="text-4xl font-bold mb-4">Como podemos ajudar?</h2>
            <p className="text-xl opacity-90 max-w-2xl mx-auto">
              Encontre respostas para as perguntas mais comuns sobre o Lendas do Flu
            </p>
          </div>
        </section>

        {/* FAQ Content */}
        <section className="py-16">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="space-y-8">
              {faqData.map((category, categoryIndex) => (
                <Card key={categoryIndex} className="overflow-hidden">
                  <CardHeader className="bg-gray-50">
                    <CardTitle className="flex items-center gap-3 text-flu-grena">
                      <category.icon className="w-6 h-6" />
                      {category.category}
                    </CardTitle>
                    <CardDescription>
                      Perguntas sobre {category.category.toLowerCase()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                    <Accordion type="single" collapsible className="w-full">
                      {category.questions.map((faq, index) => (
                        <AccordionItem key={index} value={`${categoryIndex}-${index}`} className="px-6">
                          <AccordionTrigger className="text-left py-4 hover:text-flu-grena">
                            {faq.question}
                          </AccordionTrigger>
                          <AccordionContent className="pb-4 text-gray-700 leading-relaxed">
                            {faq.answer}
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Instagram Feedback Section */}
            <Card className="mt-12 bg-gradient-to-r from-purple-600 to-pink-600 text-white border-0">
              <CardHeader className="text-center">
                <CardTitle className="flex items-center justify-center gap-3 text-2xl">
                  <Instagram className="w-8 h-8" />
                  Não encontrou sua resposta?
                </CardTitle>
                <CardDescription className="text-white/90 text-lg">
                  💬 Fale conosco diretamente no Instagram!
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <p className="mb-6 text-white/90 text-lg">
                  Nossa equipe responde rapidamente no <strong>@jogolendasdoflu</strong>
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button 
                    variant="secondary" 
                    size="lg"
                    className="bg-white text-purple-600 hover:bg-gray-100 font-semibold"
                    asChild
                  >
                    <a 
                      href="https://www.instagram.com/jogolendasdoflu" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-2"
                    >
                      <Instagram className="w-5 h-5" />
                      Seguir @jogolendasdoflu
                    </a>
                  </Button>
                  <Button 
                    variant="secondary" 
                    size="lg"
                    className="bg-white text-flu-grena hover:bg-gray-100"
                    asChild
                  >
                    <Link to="/selecionar-modo-jogo">
                      Começar a Jogar
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Contact Section */}
            <Card className="mt-8 bg-gradient-to-r from-flu-grena to-flu-verde text-white">
              <CardHeader className="text-center">
                <CardTitle className="flex items-center justify-center gap-3 text-2xl">
                  <MessageCircle className="w-8 h-8" />
                  Outras formas de contato
                </CardTitle>
                <CardDescription className="text-white/90 text-lg">
                  Estamos sempre prontos para ajudar você
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <p className="mb-6 text-white/90">
                  Nossa equipe está sempre pronta para esclarecer suas dúvidas sobre o Lendas do Flu
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button 
                    variant="secondary" 
                    size="lg"
                    className="bg-white text-flu-grena hover:bg-gray-100"
                    asChild
                  >
                    <Link to="/selecionar-modo-jogo">
                      Jogar Agora
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </>
  );
}
