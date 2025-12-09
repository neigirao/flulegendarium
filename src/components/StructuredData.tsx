import { useEffect } from 'react';

const CANONICAL_DOMAIN = "https://lendasdoflu.com";

interface StructuredDataProps {
  type: 'Game' | 'WebSite' | 'Organization';
  data?: any;
}

export const StructuredData = ({ type, data }: StructuredDataProps) => {
  useEffect(() => {
    let structuredData: any = {};

    switch (type) {
      case 'WebSite':
        structuredData = {
          "@context": "https://schema.org",
          "@type": "WebSite",
          "name": "Lendas do Flu",
          "description": "Teste seus conhecimentos sobre os ídolos tricolores do Fluminense",
          "url": `${CANONICAL_DOMAIN}/`,
          "potentialAction": {
            "@type": "SearchAction",
            "target": `${CANONICAL_DOMAIN}/search?q={search_term_string}`,
            "query-input": "required name=search_term_string"
          },
          "publisher": {
            "@type": "Organization",
            "name": "Lendas do Flu",
            "logo": {
              "@type": "ImageObject",
              "url": `${CANONICAL_DOMAIN}/og-image.png`
            }
          }
        };
        break;

      case 'Game':
        structuredData = {
          "@context": "https://schema.org",
          "@type": "Game",
          "name": "Lendas do Flu - Quiz dos Ídolos Tricolores",
          "description": "Jogo interativo onde você precisa adivinhar jogadores lendários do Fluminense através de suas fotos",
          "url": `${CANONICAL_DOMAIN}/jogar`,
          "genre": ["Quiz", "Sports", "Educational"],
          "gameItem": "Conhecimento sobre Fluminense",
          "numberOfPlayers": "1",
          "publisher": {
            "@type": "Organization",
            "name": "Lendas do Flu"
          },
          "applicationCategory": "Game",
          "operatingSystem": "Web Browser",
          "screenshot": `${CANONICAL_DOMAIN}/og-image.png`,
          "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "BRL"
          }
        };
        break;

      case 'Organization':
        structuredData = {
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": "Lendas do Flu",
          "description": "Plataforma interativa para testar conhecimentos sobre a história do Fluminense",
          "url": `${CANONICAL_DOMAIN}/`,
          "logo": `${CANONICAL_DOMAIN}/og-image.png`,
          "sameAs": [
            "https://twitter.com/lendasdoflu",
            "https://instagram.com/lendasdoflu"
          ],
          "contactPoint": {
            "@type": "ContactPoint",
            "contactType": "customer service",
            "availableLanguage": "Portuguese"
          }
        };
        break;
    }

    // Remove existing structured data script
    const existingScript = document.querySelector('script[type="application/ld+json"]');
    if (existingScript) {
      existingScript.remove();
    }

    // Add new structured data script
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(structuredData);
    document.head.appendChild(script);

    return () => {
      // Cleanup on unmount
      const scriptToRemove = document.querySelector('script[type="application/ld+json"]');
      if (scriptToRemove) {
        scriptToRemove.remove();
      }
    };
  }, [type, data]);

  return null;
};
