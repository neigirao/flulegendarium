import { SEOManager } from "@/components/seo/SEOManager";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ArrowLeft, HelpCircle, MessageCircle, Trophy, Users, GamepadIcon, Shield, Instagram, Brain, Shirt, Target, TrendingUp, Award, Clock3, Lightbulb, AlertTriangle } from "lucide-react";

const adaptiveTutorialSteps = [
  {
    title: "Bem-vindo ao Advinhe o Jogador",
    icon: Brain,
    content: "Este modo ajusta automaticamente a dificuldade com base no seu desempenho. Quanto melhor você joga, mais desafiador ele fica.",
  },
  {
    title: "Como o sistema adaptativo funciona",
    icon: TrendingUp,
    content: "Acertos em sequência aumentam a dificuldade; erros reduzem um pouco para equilibrar a experiência.",
  },
  {
    title: "Níveis de dificuldade",
    icon: Target,
    content: "Você progride entre Muito Fácil, Fácil, Médio, Difícil e Muito Difícil, com pontuação maior nos níveis altos.",
  },
  {
    title: "Indicadores visuais",
    icon: Award,
    content: "Use barra de progresso, notificações e comportamento da imagem para entender sua evolução durante a partida.",
  },
];

const jerseyTutorialSteps = [
  {
    title: "Bem-vindo ao Quiz das Camisas",
    icon: Shirt,
    content: "Você verá uma camisa histórica do Fluminense e deve identificar o ano correto.",
  },
  {
    title: "Como jogar",
    icon: HelpCircle,
    content: "Cada rodada mostra 3 opções de ano. Escolha a opção que você acredita ser a correta.",
  },
  {
    title: "Regra principal",
    icon: AlertTriangle,
    content: "Se errar, é Game Over. Observe os detalhes visuais para decidir com precisão.",
  },
  {
    title: "Dica de ouro",
    icon: Lightbulb,
    content: "Patrocínio, fornecedor e estilo do uniforme ajudam bastante a reconhecer a época da camisa.",
  },
];

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
        question: "Quais modos de jogo estão disponíveis?",
        answer: "Temos TRÊS modos: 1) Advinhe o Jogador - Sistema inteligente que ajusta a dificuldade baseado no seu desempenho; 2) Advinhe o Jogador por Década - Escolha uma época específica (anos 70, 80, 90, 2000s, 2010s, 2020s); 3) Quiz das Camisas - Veja uma camisa histórica e escolha o ano correto entre 3 opções!"
      },
      {
        question: "Como funciona o Advinhe o Jogador por Década?",
        answer: "No Advinhe o Jogador por Década você escolhe um período específico da história do Fluminense. Por exemplo, se escolher 'Anos 2000s', aparecerão apenas jogadores que atuaram nessa década. É perfeito para nostálgicos ou para testar conhecimento sobre eras específicas!"
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
        answer: "Temos mais de 200 jogadores históricos e atuais do Fluminense, desde os clássicos como Castilho e Telê Santana até os ídolos mais recentes. Novos jogadores são adicionados regularmente!"
      }
    ]
  },
  {
    category: "Quiz das Camisas",
    icon: Shirt,
    questions: [
      {
        question: "O que é o Quiz das Camisas?",
        answer: "É um modo de jogo onde você vê uma camisa histórica do Fluminense e precisa escolher entre 3 opções qual é o ano correto daquele uniforme. É perfeito para quem conhece a história visual do clube!"
      },
      {
        question: "Como funciona a escolha de anos?",
        answer: "Ao ver a camisa, você terá 3 opções de ano para escolher. Uma é a correta e as outras duas são anos próximos (de 1 a 3 anos de diferença). Clique na opção que você acredita ser a correta!"
      },
      {
        question: "O que acontece se eu errar?",
        answer: "Se escolher o ano errado, o jogo termina (Game Over). A opção correta será destacada em verde para você aprender qual era o ano certo daquela camisa."
      },
      {
        question: "Qual é a pontuação do Quiz das Camisas?",
        answer: "A pontuação varia conforme a dificuldade da camisa. Camisas mais antigas e raras valem mais pontos! Quanto mais rápido você acertar, mais pontos ganha."
      },
      {
        question: "Quantas camisas históricas existem no jogo?",
        answer: "Temos dezenas de camisas históricas do Fluminense, desde uniformes clássicos dos anos 1900 até as mais recentes. Novos uniformes são adicionados regularmente!"
      },
      {
        question: "Posso jogar o Quiz das Camisas no celular?",
        answer: "Sim! O modo foi otimizado para telas touch. As 3 opções aparecem lado a lado facilitando a escolha com um simples toque."
      }
    ]
  },
  {
    category: "Como Jogar",
    icon: Trophy,
    questions: [
      {
        question: "Como começar a jogar?",
        answer: "Clique em 'Começar a Jogar' na página inicial, escolha entre Advinhe o Jogador, Advinhe o Jogador por Década ou Quiz das Camisas e use este tutorial como referência para testar seus conhecimentos tricolores!"
      },
      {
        question: "Qual é a diferença entre os modos?",
        answer: "Advinhe o Jogador: dificuldade automática baseada no desempenho. Advinhe o Jogador por Década: você escolhe a era (70s, 80s, 90s, 2000s, 2010s, 2020s) e joga apenas com jogadores daquele período específico. Quiz das Camisas: você identifica o ano de um uniforme histórico."
      },
      {
        question: "Posso tentar mais de uma vez por jogador?",
        answer: "Não! Você tem apenas UMA tentativa por jogador. Se errar ou o tempo esgotar, é Game Over. Isso torna o jogo mais desafiador e emocionante!"
      },
      {
        question: "Quanto tempo tenho para responder?",
        answer: "Você tem exatos 30 segundos para cada jogador no modo padrão. O cronômetro aparece na tela e quando chega a zero, é Game Over automaticamente."
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
        answer: "GAME OVER IMEDIATO! Se você trocar de aba, minimizar ou sair da janela durante o jogo, o jogo termina automaticamente. Esta regra evita que você consulte outras fontes."
      },
      {
        question: "Por que essa regra existe?",
        answer: "Para manter a justiça e o desafio do jogo. Queremos testar seu conhecimento real sobre o Fluminense, não sua habilidade de pesquisar no Google!"
      },
      {
        question: "O jogo funciona offline?",
        answer: "Parcialmente! Graças ao Service Worker, imagens já visualizadas ficam em cache e o jogo pode continuar por um tempo sem internet. Mas recursos novos e salvamento de ranking precisam de conexão."
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
        question: "Existe ranking separado por modo de jogo?",
        answer: "O ranking mostra as melhores pontuações de todos os modos. Jogadores que conseguem alta pontuação no Advinhe o Jogador por Década das décadas mais antigas (mais difíceis) podem alcançar o topo mais facilmente!"
      }
    ]
  },
  {
    category: "Problemas Técnicos",
    icon: Shield,
    questions: [
      {
        question: "As imagens não carregam. O que fazer?",
        answer: "Primeiro, aguarde alguns segundos - nosso sistema de cache pode estar carregando. Se persistir, tente atualizar a página (F5). O Service Worker geralmente resolve problemas de carregamento automaticamente."
      },
      {
        question: "O jogo está lento. Como resolver?",
        answer: "Feche outras abas do navegador para liberar memória. O jogo tem otimizações avançadas e funciona melhor em navegadores atualizados como Chrome, Firefox ou Safari."
      },
      {
        question: "Funciona no celular?",
        answer: "Perfeitamente! Lendas do Flu é totalmente otimizado para celulares e tablets com tecnologias móveis avançadas: touch otimizado, lazy loading, compressão automática de imagens e interface responsiva."
      }
    ]
  }
];

export default function Tutorial() {
  return (
    <>
      <SEOManager
        title="Tutorial do Jogo | Lendas do Flu"
        description="Guia completo para aprender os modos do Lendas do Flu com regras, dicas, pontuação e FAQ em uma única página."
        keywords="tutorial lendas do flu, guia jogo fluminense, como jogar quiz tricolor, regras e pontuação"
        schema="FAQ"
      />

      <div className="min-h-screen page-warm bg-tricolor-vertical-border safe-area-top safe-area-bottom">
        <header className="bg-background/95 backdrop-blur-md shadow-sm py-4 sticky top-0 z-40">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" asChild className="touch-target">
                <Link to="/" className="flex items-center gap-2 font-body">
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
                  <h1 className="font-display text-display-sm text-primary">Tutorial do Jogo</h1>
                  <p className="font-body text-sm text-muted-foreground">Guia completo e FAQ</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <section className="py-12 bg-gradient-to-br from-primary to-secondary text-primary-foreground">
          <div className="container mx-auto px-4 text-center">
            <div className="flex items-center justify-center gap-3 mb-6">
              <HelpCircle className="w-12 h-12" />
            </div>
            <h2 className="font-display text-display-hero mb-4">Como jogar Lendas do Flu</h2>
            <p className="font-body text-xl opacity-90 max-w-3xl mx-auto">
              Reunimos em uma única página as instruções dos tutoriais e as principais dúvidas do jogo.
            </p>
          </div>
        </section>

        <section className="py-16">
          <div className="container mx-auto px-4 max-w-5xl space-y-8">
            <Card className="overflow-hidden border-primary/20">
              <CardHeader className="bg-muted/50">
                <CardTitle className="flex items-center gap-3 text-primary font-display text-display-sm">
                  <Brain className="w-6 h-6" />
                  Tutorial do modo Advinhe o Jogador
                </CardTitle>
                <CardDescription className="font-body">Etapas principais do modo adaptativo</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2 p-6">
                {adaptiveTutorialSteps.map((step, index) => (
                  <div key={step.title} className="rounded-xl border border-border/60 bg-card p-4">
                    <p className="text-xs uppercase text-muted-foreground mb-2 font-medium">Etapa {index + 1}</p>
                    <div className="flex items-start gap-3">
                      <step.icon className="w-5 h-5 text-primary mt-0.5" />
                      <div>
                        <h3 className="font-display text-base text-foreground">{step.title}</h3>
                        <p className="font-body text-sm text-muted-foreground mt-1">{step.content}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="overflow-hidden border-primary/20">
              <CardHeader className="bg-muted/50">
                <CardTitle className="flex items-center gap-3 text-primary font-display text-display-sm">
                  <Shirt className="w-6 h-6" />
                  Tutorial do Quiz das Camisas
                </CardTitle>
                <CardDescription className="font-body">Resumo do fluxo do modo de uniformes históricos</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2 p-6">
                {jerseyTutorialSteps.map((step, index) => (
                  <div key={step.title} className="rounded-xl border border-border/60 bg-card p-4">
                    <p className="text-xs uppercase text-muted-foreground mb-2 font-medium">Etapa {index + 1}</p>
                    <div className="flex items-start gap-3">
                      <step.icon className="w-5 h-5 text-primary mt-0.5" />
                      <div>
                        <h3 className="font-display text-base text-foreground">{step.title}</h3>
                        <p className="font-body text-sm text-muted-foreground mt-1">{step.content}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="overflow-hidden border-primary/20">
              <CardHeader className="bg-muted/50">
                <CardTitle className="flex items-center gap-3 text-primary font-display text-display-sm">
                  <Clock3 className="w-6 h-6" />
                  Regras rápidas
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <ul className="space-y-2 font-body text-muted-foreground">
                  <li>• Você tem tempo limitado para responder cada rodada.</li>
                  <li>• Errou a resposta? A partida termina em Game Over.</li>
                  <li>• A pontuação sobe com dificuldade e rapidez da resposta.</li>
                  <li>• Trocar de aba durante a partida encerra o jogo.</li>
                </ul>
              </CardContent>
            </Card>

            <div className="space-y-8">
              {faqData.map((category, categoryIndex) => (
                <Card key={categoryIndex} className="overflow-hidden border-primary/20">
                  <CardHeader className="bg-muted/50">
                    <CardTitle className="flex items-center gap-3 text-primary font-display text-display-sm">
                      <category.icon className="w-6 h-6" />
                      {category.category}
                    </CardTitle>
                    <CardDescription className="font-body">
                      Dúvidas sobre {category.category.toLowerCase()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                    <Accordion type="single" collapsible className="w-full">
                      {category.questions.map((faq, index) => (
                        <AccordionItem key={index} value={`${categoryIndex}-${index}`} className="px-6">
                          <AccordionTrigger className="text-left py-4 hover:text-primary touch-target font-body font-medium">
                            {faq.question}
                          </AccordionTrigger>
                          <AccordionContent className="pb-4 text-muted-foreground leading-relaxed font-body">
                            {faq.answer}
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="mt-12 bg-gradient-to-r from-accent to-primary text-primary-foreground border-0">
              <CardHeader className="text-center">
                <CardTitle className="flex items-center justify-center gap-3 font-display text-display-subtitle">
                  <Instagram className="w-8 h-8" />
                  Não encontrou sua resposta?
                </CardTitle>
                <CardDescription className="text-primary-foreground/90 text-lg font-body">
                  💬 Fale conosco diretamente no Instagram!
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <p className="mb-6 text-primary-foreground/90 text-lg font-body">
                  Nossa equipe responde rapidamente no <strong>@jogolendasdoflu</strong>
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    variant="secondary"
                    size="lg"
                    className="bg-background text-accent-foreground hover:bg-muted font-display touch-target-lg"
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
                    className="bg-background text-primary hover:bg-muted font-display touch-target-lg"
                    asChild
                  >
                    <Link to="/selecionar-modo-jogo">
                      Começar a Jogar
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="mt-8 bg-gradient-to-r from-primary to-secondary text-primary-foreground border-0">
              <CardHeader className="text-center">
                <CardTitle className="flex items-center justify-center gap-3 font-display text-display-subtitle">
                  <MessageCircle className="w-8 h-8" />
                  Outras formas de contato
                </CardTitle>
                <CardDescription className="text-primary-foreground/90 text-lg font-body">
                  Estamos sempre prontos para ajudar você
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <p className="font-body text-primary-foreground/90">
                  Se preferir, envie uma mensagem com detalhes do problema e do seu dispositivo.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </>
  );
}
