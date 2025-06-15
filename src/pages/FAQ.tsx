
import { SEOHead } from "@/components/SEOHead";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ArrowLeft, HelpCircle, MessageCircle, Trophy, Users, GamepadIcon, Shield } from "lucide-react";

const faqData = [
  {
    category: "Sobre o Jogo",
    icon: GamepadIcon,
    questions: [
      {
        question: "O que é Lendas do Flu?",
        answer: "Lendas do Flu é um quiz interativo onde você testa seus conhecimentos sobre os jogadores históricos e atuais do Fluminense FC. Veja a foto do jogador e tente adivinhar quem é!"
      },
      {
        question: "Como funciona o jogo?",
        answer: "É simples! Você verá a foto de um jogador do Fluminense e terá que adivinhar o nome correto. Cada acerto vale pontos e você pode competir no ranking global com outros tricolores."
      },
      {
        question: "O jogo é gratuito?",
        answer: "Sim! Lendas do Flu é completamente gratuito. Você só precisa criar uma conta para salvar seu progresso e participar do ranking."
      },
      {
        question: "Quantos jogadores estão disponíveis no jogo?",
        answer: "Temos uma base de dados em constante crescimento com dezenas de jogadores históricos e atuais do Fluminense. Novos jogadores são adicionados regularmente."
      }
    ]
  },
  {
    category: "Como Jogar",
    icon: Trophy,
    questions: [
      {
        question: "Como posso começar a jogar?",
        answer: "Clique em 'Jogar Quiz Agora' na página inicial, escolha o modo de jogo desejado e comece a testar seus conhecimentos tricolores!"
      },
      {
        question: "Existe limite de tentativas?",
        answer: "Não há limite de tentativas! Você pode jogar quantas vezes quiser e tentar melhorar sua pontuação."
      },
      {
        question: "Como funciona a pontuação?",
        answer: "Você ganha pontos por cada resposta correta. A pontuação pode variar dependendo da dificuldade do jogador e do tempo que levou para responder."
      },
      {
        question: "Posso pular uma pergunta?",
        answer: "Sim, você pode pular perguntas se não souber a resposta, mas não ganhará pontos por ela."
      }
    ]
  },
  {
    category: "Conta e Perfil",
    icon: Users,
    questions: [
      {
        question: "Preciso criar uma conta?",
        answer: "Para jogar casualmente, não é necessário. Mas recomendamos criar uma conta para salvar seu progresso, participar do ranking e acompanhar suas estatísticas."
      },
      {
        question: "Como criar uma conta?",
        answer: "Clique em 'Entrar' no topo da página e escolha entre fazer login com Google ou criar uma conta com email e senha."
      },
      {
        question: "Posso alterar meu nome de usuário?",
        answer: "Sim, você pode alterar seu nome de usuário acessando seu perfil em 'Meu Perfil Tricolor'."
      },
      {
        question: "Como vejo minhas estatísticas?",
        answer: "Suas estatísticas estão disponíveis na página 'Meu Perfil Tricolor', onde você pode ver seu desempenho, conquistas e histórico de jogos."
      }
    ]
  },
  {
    category: "Problemas Técnicos",
    icon: Shield,
    questions: [
      {
        question: "As imagens não estão carregando. O que fazer?",
        answer: "Verifique sua conexão com a internet. Se o problema persistir, tente atualizar a página ou limpar o cache do navegador."
      },
      {
        question: "O jogo está lento. Como resolver?",
        answer: "Isso pode ser devido à sua conexão com a internet. Tente fechar outras abas do navegador ou verificar sua conexão. O jogo funciona melhor em navegadores atualizados."
      },
      {
        question: "Não consigo fazer login. O que fazer?",
        answer: "Verifique se você está usando as credenciais corretas. Se esqueceu a senha, use a opção 'Esqueci minha senha'. Se o problema persistir, entre em contato conosco."
      },
      {
        question: "O jogo funciona no celular?",
        answer: "Sim! Lendas do Flu é totalmente otimizado para dispositivos móveis. Você pode jogar no seu smartphone ou tablet normalmente."
      }
    ]
  }
];

export default function FAQ() {
  return (
    <>
      <SEOHead 
        title="FAQ - Perguntas Frequentes | Lendas do Flu"
        description="Tire suas dúvidas sobre o Lendas do Flu. Encontre respostas para as perguntas mais comuns sobre como jogar, criar conta, pontuação e muito mais."
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

            {/* Contact Section */}
            <Card className="mt-12 bg-gradient-to-r from-flu-grena to-flu-verde text-white">
              <CardHeader className="text-center">
                <CardTitle className="flex items-center justify-center gap-3 text-2xl">
                  <MessageCircle className="w-8 h-8" />
                  Não encontrou sua resposta?
                </CardTitle>
                <CardDescription className="text-white/90 text-lg">
                  Entre em contato conosco e teremos prazer em ajudar
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
                    <Link to="/meu-perfil-tricolor">
                      Ir para Meu Perfil
                    </Link>
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
          </div>
        </section>
      </div>
    </>
  );
}
