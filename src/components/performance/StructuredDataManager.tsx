
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export const StructuredDataManager = () => {
  const location = useLocation();

  useEffect(() => {
    const addStructuredData = () => {
      // Remove existing structured data
      const existing = document.querySelector('#structured-data');
      if (existing) {
        existing.remove();
      }

      const script = document.createElement('script');
      script.id = 'structured-data';
      script.type = 'application/ld+json';

      let structuredData;

      if (location.pathname === '/' || location.pathname === '/game') {
        structuredData = {
          "@context": "https://schema.org",
          "@type": "WebApplication",
          "name": "Lendas do Flu",
          "description": "Quiz interativo sobre os ídolos e lendas do Fluminense Football Club",
          "url": "https://flulegendarium.lovable.app",
          "applicationCategory": "GameApplication",
          "operatingSystem": "Web",
          "browserRequirements": "Requires JavaScript. Requires HTML5.",
          "softwareVersion": "1.0",
          "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": "4.8",
            "ratingCount": "150"
          },
          "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "BRL"
          },
          "author": {
            "@type": "Organization",
            "name": "Lendas do Flu",
            "url": "https://flulegendarium.lovable.app"
          },
          "publisher": {
            "@type": "Organization",
            "name": "Lendas do Flu",
            "logo": {
              "@type": "ImageObject",
              "url": "https://flulegendarium.lovable.app/og-image.png"
            }
          },
          "screenshot": "https://flulegendarium.lovable.app/og-image.png",
          "genre": ["Sports", "Quiz", "Education"],
          "keywords": "Fluminense, futebol, quiz, tricolor, lendas, jogadores, Fred, Castilho",
          "inLanguage": "pt-BR",
          "isAccessibleForFree": true,
          "mainEntity": {
            "@type": "Game",
            "name": "Quiz das Lendas Tricolores",
            "description": "Adivinhe o jogador pela foto e teste seus conhecimentos sobre o Fluminense",
            "gameItem": {
              "@type": "Thing",
              "name": "Jogadores do Fluminense"
            }
          }
        };
      } else if (location.pathname === '/profile') {
        structuredData = {
          "@context": "https://schema.org",
          "@type": "ProfilePage",
          "name": "Perfil do Jogador - Lendas do Flu",
          "description": "Perfil do usuário com estatísticas e conquistas no quiz",
          "mainEntity": {
            "@type": "Person",
            "name": "Jogador Tricolor"
          }
        };
      }

      if (structuredData) {
        script.textContent = JSON.stringify(structuredData);
        document.head.appendChild(script);
      }
    };

    addStructuredData();
  }, [location.pathname]);

  return null;
};
