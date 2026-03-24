import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { SEOManager } from '@/components/seo/SEOManager';

interface EnhancedSEORouterProps {
  children: React.ReactNode;
}

// SEO-optimized route mapping with semantic URLs
const SEO_ROUTES = {
  '/': {
    title: 'Lendas do Flu - Quiz Tricolor dos Ídolos do Fluminense',
    description: '3 modos de quiz: Jogadores, Por Década e Camisas Históricas! Teste seus conhecimentos sobre os ídolos e uniformes tricolores.',
    keywords: 'quiz fluminense, teste tricolor, jogadores fluminense, ídolos flu, quiz futebol, fluminense história, camisas históricas',
    schema: 'WebSite' as const
  },
  '/quiz-adaptativo': {
    title: 'Advinhe o Jogador - Adivinhe o Jogador do Fluminense',
    description: 'Quiz inteligente que se adapta ao seu nível! Adivinhe jogadores lendários do Fluminense em diferentes níveis de dificuldade.',
    keywords: 'quiz adaptativo fluminense, adivinhe jogador, teste inteligente tricolor, dificuldade progressiva',
    schema: 'Game' as const
  },
  '/quiz-decada': {
    title: 'Quiz por Década - Eras Douradas do Fluminense',
    description: 'Explore as diferentes eras do Fluminense! Quiz organizado por décadas com os maiores ídolos de cada período tricolor.',
    keywords: 'fluminense por década, história tricolor, jogadores anos 80 90 2000, eras douradas flu',
    schema: 'Game' as const
  },
  '/quiz-camisas': {
    title: 'Quiz das Camisas - Adivinhe o Ano dos Uniformes Históricos',
    description: 'Veja a camisa histórica do Fluminense e escolha entre 3 opções qual é o ano correto! Teste seu conhecimento sobre os uniformes tricolores.',
    keywords: 'quiz camisas fluminense, uniformes históricos tricolor, camisas antigas flu, adivinhar ano camisa',
    schema: 'Game' as const
  },
  '/selecionar-modo-jogo': {
    title: 'Modos de Jogo - Escolha seu Desafio Tricolor',
    description: 'Escolha entre 3 modos: Advinhe o Jogador, Por Década ou Camisas Históricas. Diferentes desafios para testar seu conhecimento tricolor!',
    keywords: 'modos jogo fluminense, escolher quiz tricolor, desafio flu, tipos quiz futebol',
    schema: 'Game' as const
  },
  '/faq': {
    title: 'Perguntas Frequentes - Como Jogar o Quiz do Fluminense',
    description: 'Tire suas dúvidas sobre o jogo! Regras, pontuação e dicas para dominar o quiz dos ídolos tricolores.',
    keywords: 'como jogar quiz fluminense, regras jogo tricolor, dúvidas flu, ajuda quiz',
    schema: 'FAQ' as const
  },
  '/conquistas': {
    title: 'Conquistas - Desbloqueie Achievements no Quiz do Fluminense',
    description: 'Desbloqueie conquistas especiais jogando o quiz do Fluminense. Mostre seu conhecimento tricolor e colecione todos os badges!',
    keywords: 'conquistas fluminense, achievements quiz, badges tricolor, medalhas flu',
    schema: 'WebPage' as const
  },
  '/perfil': {
    title: 'Meu Perfil - Estatísticas e Histórico no Quiz do Fluminense',
    description: 'Acompanhe suas estatísticas, histórico de jogos e conquistas no quiz do Fluminense.',
    keywords: 'perfil fluminense, estatísticas quiz, histórico jogos tricolor',
    schema: 'WebPage' as const
  },
  '/doacoes': {
    title: 'Apoie o Projeto - Doações para Lendas do Flu',
    description: 'Ajude a manter o quiz das lendas do Fluminense no ar! Sua contribuição faz a diferença.',
    keywords: 'doar fluminense, apoiar lendas do flu, contribuir quiz tricolor',
    schema: 'WebPage' as const
  },
  '/noticias': {
    title: 'Notícias do Fluminense - Portal Tricolor Atualizado',
    description: 'Últimas notícias, análises e curiosidades sobre o Fluminense. Fique por dentro de tudo sobre o time tricolor.',
    keywords: 'notícias fluminense, portal tricolor, análises flu, curiosidades fluminense',
    schema: 'WebPage' as const
  }
};

export const EnhancedSEORouter = ({ children }: EnhancedSEORouterProps) => {
  const location = useLocation();

  // Get current route SEO data
  const currentSEO = SEO_ROUTES[location.pathname as keyof typeof SEO_ROUTES] || SEO_ROUTES['/'];

  // Track route changes for performance
  useEffect(() => {
    const startTime = performance.now();
    
    if (performance.mark) {
      performance.mark(`route-change-${location.pathname}`);
    }

    return () => {
      const endTime = performance.now();
      const routeChangeTime = endTime - startTime;
      
      if (routeChangeTime > 100) {
        console.warn(`Slow route change to ${location.pathname}: ${routeChangeTime.toFixed(2)}ms`);
      }

      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'page_view', {
          page_title: currentSEO.title,
          page_location: window.location.href,
          page_path: location.pathname,
          route_change_time: Math.round(routeChangeTime)
        });
      }
    };
  }, [location.pathname, currentSEO.title]);

  // Preload next likely pages based on current route
  useEffect(() => {
    const preloadRoutes: string[] = [];

    switch (location.pathname) {
      case '/':
        preloadRoutes.push('/selecionar-modo-jogo', '/quiz-adaptativo');
        break;
      case '/selecionar-modo-jogo':
        preloadRoutes.push('/quiz-adaptativo', '/quiz-decada');
        break;
      case '/quiz-adaptativo':
      case '/quiz-decada':
        preloadRoutes.push('/selecionar-modo-jogo');
        break;
    }

    const preloadTimer = setTimeout(() => {
      preloadRoutes.forEach(route => {
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = route;
        document.head.appendChild(link);
      });
    }, 2000);

    return () => clearTimeout(preloadTimer);
  }, [location.pathname]);

  return (
    <>
      <SEOManager
        title={currentSEO.title}
        description={currentSEO.description}
        keywords={currentSEO.keywords}
        schema={currentSEO.schema}
      />
      {children}
    </>
  );
};
