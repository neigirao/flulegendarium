import { useEffect } from 'react';
import { SEOHead } from '@/components/SEOHead';
import { useLocation } from 'react-router-dom';

interface Player {
  id: string;
  name: string;
  position: string;
  image_url: string;
  fun_fact?: string;
}

interface DynamicSEOProps {
  player?: Player;
  gameMode?: string;
  difficulty?: string;
  customTitle?: string;
  customDescription?: string;
}

export const DynamicSEO = ({ 
  player, 
  gameMode, 
  difficulty,
  customTitle,
  customDescription 
}: DynamicSEOProps) => {
  const location = useLocation();
  const baseUrl = "https://lendasdoflu.com";
  const generateTitle = () => {
    if (customTitle) return customTitle;
    
    // NUNCA revelar nome do jogador no título durante o jogo - isso é trapaça!
    // Removido: if (player) { return `${player.name} - ...` }
    
    if (gameMode === 'decade') {
      return `Jogo por Década${difficulty ? ` - ${difficulty}` : ''} | Lendas do Flu`;
    }
    
    if (gameMode === 'adaptive') {
      return `Jogo Adaptivo${difficulty ? ` - ${difficulty}` : ''} | Lendas do Flu`;
    }
    
    return "Lendas do Flu - Teste seus conhecimentos tricolores";
  };

  const generateDescription = () => {
    if (customDescription) return customDescription;
    
    // NUNCA revelar informações do jogador durante o jogo
    // Removido: if (player) { return `Descubra tudo sobre ${player.name}...` }
    
    if (gameMode === 'decade') {
      return `Teste seus conhecimentos sobre as lendas do Fluminense por década${difficulty ? ` em modo ${difficulty}` : ''}. Adivinhe o jogador pela foto e prove que é um verdadeiro tricolor!`;
    }
    
    if (gameMode === 'adaptive') {
      return `Jogo adaptivo que se ajusta ao seu nível de conhecimento sobre o Fluminense${difficulty ? ` - atualmente em ${difficulty}` : ''}. Desafie-se e descubra o quanto você conhece das lendas tricolores!`;
    }
    
    return "Descubra se você realmente conhece as lendas do Fluminense. Adivinhe o jogador pela foto e prove que é um verdadeiro tricolor!";
  };

  const generateKeywords = () => {
    const baseKeywords = "quiz fluminense, teste fluminense, jogo fluminense, tricolor, futebol";
    
    // NUNCA incluir dados do jogador nas keywords durante o jogo
    
    if (gameMode === 'decade') {
      return `${baseKeywords}, jogo por década, história fluminense, décadas fluminense`;
    }
    
    if (gameMode === 'adaptive') {
      return `${baseKeywords}, jogo adaptivo, dificuldade progressiva, desafio fluminense`;
    }
    
    return `${baseKeywords}, adivinhe jogador`;
  };

  const generateImage = () => {
    if (player && player.image_url) {
      return player.image_url;
    }
    
    return "/lovable-uploads/1b089617-8fa2-440f-ab41-5192f292f5f3.png";
  };

  const generateUrl = () => {
    return `${baseUrl}${location.pathname}`;
  };

  // Generate JSON-LD structured data
  useEffect(() => {
    const structuredData: any = {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": generateTitle(),
      "description": generateDescription(),
      "url": generateUrl(),
      "image": generateImage(),
      "inLanguage": "pt-BR",
      "isPartOf": {
        "@type": "WebSite",
        "name": "Lendas do Flu",
        "url": baseUrl,
        "description": "O maior quiz sobre as lendas do Fluminense Football Club"
      }
    };

    if (player) {
      structuredData["@type"] = "ProfilePage";
      structuredData.mainEntity = {
        "@type": "Person",
        "name": player.name,
        "description": `${player.position} do Fluminense Football Club`,
        "image": player.image_url,
        "memberOf": {
          "@type": "SportsTeam",
          "name": "Fluminense Football Club",
          "sport": "Futebol"
        }
      };
    }

    if (gameMode) {
      structuredData.about = {
        "@type": "Game",
        "name": `Quiz ${gameMode === 'decade' ? 'por Década' : 'Adaptivo'} - Lendas do Flu`,
        "description": generateDescription(),
        "genre": "Quiz",
        "audience": {
          "@type": "Audience",
          "audienceType": "Torcedores do Fluminense"
        }
      };
    }

    // Update or create JSON-LD script
    let jsonLdScript = document.querySelector('script[type="application/ld+json"][data-dynamic]');
    if (!jsonLdScript) {
      jsonLdScript = document.createElement('script');
      jsonLdScript.setAttribute('type', 'application/ld+json');
      jsonLdScript.setAttribute('data-dynamic', 'true');
      document.head.appendChild(jsonLdScript);
    }
    jsonLdScript.textContent = JSON.stringify(structuredData);

    return () => {
      // Cleanup on unmount
      const script = document.querySelector('script[type="application/ld+json"][data-dynamic]');
      if (script) {
        script.remove();
      }
    };
  }, [player, gameMode, difficulty, location.pathname]);

  return (
    <SEOHead
      title={generateTitle()}
      description={generateDescription()}
      keywords={generateKeywords()}
      image={generateImage()}
      url={generateUrl()}
      canonical={generateUrl()}
    />
  );
};