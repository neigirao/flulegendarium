import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface AdvancedSchemaMarkupProps {
  type: 'Organization' | 'SportsTeam' | 'VideoGame' | 'FAQ' | 'NewsPortal' | 'WebApplication';
  data?: any;
}

export const AdvancedSchemaMarkup = ({ type, data }: AdvancedSchemaMarkupProps) => {
  const location = useLocation();

  useEffect(() => {
    let schemaData: any = {};

    switch (type) {
      case 'Organization':
        schemaData = {
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": "Lendas do Flu",
          "alternateName": "Quiz Tricolor",
          "description": "Plataforma interativa para testar conhecimentos sobre a história e ídolos do Fluminense Football Club",
          "url": "https://flulegendarium.lovable.app/",
          "logo": {
            "@type": "ImageObject",
            "url": "https://flulegendarium.lovable.app/og-image.png",
            "width": 1200,
            "height": 630
          },
          "foundingDate": "2024",
          "founder": {
            "@type": "Person",
            "name": "Desenvolvedor Tricolor"
          },
          "contactPoint": {
            "@type": "ContactPoint",
            "contactType": "customer service",
            "availableLanguage": ["Portuguese"],
            "email": "contato@flulegendarium.com"
          },
          "sameAs": [
            "https://twitter.com/lendasdoflu",
            "https://instagram.com/lendasdoflu",
            "https://facebook.com/lendasdoflu"
          ],
          "knowsAbout": [
            "Fluminense Football Club",
            "Futebol Brasileiro",
            "História do Fluminense",
            "Jogadores Históricos",
            "Quiz Interativo"
          ]
        };
        break;

      case 'SportsTeam':
        schemaData = {
          "@context": "https://schema.org",
          "@type": "SportsTeam",
          "name": "Fluminense Football Club",
          "alternateName": ["Flu", "Tricolor", "Time de Guerreiros"],
          "description": "Clube de futebol fundado em 1902, um dos maiores do Brasil",
          "foundingDate": "1902-07-21",
          "sport": "Futebol",
          "url": "https://www.fluminense.com.br/",
          "logo": {
            "@type": "ImageObject",
            "url": "https://flulegendarium.lovable.app/lovable-uploads/0aa3609f-0584-4bf4-8303-e03f50f7e131.png"
          },
          "location": {
            "@type": "Place",
            "name": "Rio de Janeiro",
            "address": {
              "@type": "PostalAddress",
              "addressLocality": "Rio de Janeiro",
              "addressRegion": "RJ",
              "addressCountry": "BR"
            }
          },
          "homeLocation": {
            "@type": "Stadium",
            "name": "Estádio de São Januário",
            "address": {
              "@type": "PostalAddress",
              "streetAddress": "Rua General Almério de Moura, 131",
              "addressLocality": "Rio de Janeiro",
              "addressRegion": "RJ",
              "postalCode": "20921-060",
              "addressCountry": "BR"
            }
          },
          "memberOf": {
            "@type": "SportsOrganization",
            "name": "Campeonato Brasileiro",
            "alternateName": "Brasileirão"
          }
        };
        break;

      case 'VideoGame':
        schemaData = {
          "@context": "https://schema.org",
          "@type": "VideoGame",
          "name": "Lendas do Flu - Quiz dos Ídolos Tricolores",
          "alternateName": "Quiz Fluminense",
          "description": "Jogo interativo onde você testa seus conhecimentos sobre jogadores históricos do Fluminense",
          "url": `https://flulegendarium.lovable.app${location.pathname}`,
          "genre": ["Quiz", "Educational", "Sports", "Trivia"],
          "gameItem": [
            "Conhecimento sobre Fluminense",
            "Identificação de Jogadores",
            "História do Futebol"
          ],
          "numberOfPlayers": "1",
          "playMode": ["SinglePlayer"],
          "applicationCategory": "WebApplication",
          "operatingSystem": ["Web Browser", "iOS", "Android"],
          "gamePlatform": ["Web", "Mobile"],
          "contentRating": {
            "@type": "GamePlayMode",
            "name": "Livre para todos os públicos"
          },
          "publisher": {
            "@type": "Organization",
            "name": "Lendas do Flu"
          },
          "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "BRL",
            "availability": "https://schema.org/InStock"
          },
          "screenshot": [
            "https://flulegendarium.lovable.app/og-image.png"
          ],
          "trailer": {
            "@type": "VideoObject",
            "name": "Como jogar Lendas do Flu",
            "description": "Tutorial do quiz interativo do Fluminense"
          },
          "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": 4.8,
            "ratingCount": 150,
            "bestRating": 5
          },
          "gameLocation": {
            "@type": "Place",
            "name": "Online - Disponível mundialmente"
          }
        };
        break;

      case 'FAQ':
        schemaData = {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": [
            {
              "@type": "Question",
              "name": "Como funciona o quiz do Fluminense?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "O quiz apresenta fotos de jogadores históricos do Fluminense e você deve adivinhar quem são. Há dois modos: adaptativo (dificuldade ajustável) e por década."
              }
            },
            {
              "@type": "Question", 
              "name": "Como é calculada a pontuação?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "A pontuação é baseada na dificuldade do jogador, tempo de resposta e sequência de acertos. Jogadores mais raros valem mais pontos."
              }
            },
            {
              "@type": "Question",
              "name": "Posso jogar no celular?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Sim! O jogo é totalmente otimizado para dispositivos móveis e funciona em qualquer navegador."
              }
            },
            {
              "@type": "Question",
              "name": "Quantos jogadores estão no banco de dados?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Temos mais de 200 jogadores históricos do Fluminense, desde os pioneiros até os ídolos modernos."
              }
            }
          ]
        };
        break;

      case 'NewsPortal':
        schemaData = {
          "@context": "https://schema.org",
          "@type": "WebSite",
          "name": "Portal de Notícias - Lendas do Flu",
          "url": "https://flulegendarium.lovable.app/noticias",
          "description": "Últimas notícias, análises e curiosidades sobre o Fluminense",
          "publisher": {
            "@type": "Organization",
            "name": "Lendas do Flu"
          },
          "potentialAction": {
            "@type": "SearchAction",
            "target": "https://flulegendarium.lovable.app/noticias?q={search_term_string}",
            "query-input": "required name=search_term_string"
          },
          "about": {
            "@type": "SportsTeam",
            "name": "Fluminense Football Club"
          }
        };
        break;

      case 'WebApplication':
        schemaData = {
          "@context": "https://schema.org",
          "@type": "WebApplication",
          "name": "Lendas do Flu",
          "description": "Aplicação web interativa para testar conhecimentos sobre o Fluminense",
          "url": "https://flulegendarium.lovable.app/",
          "applicationCategory": "GameApplication",
          "operatingSystem": "All",
          "browserRequirements": "Requires JavaScript. Requires HTML5.",
          "softwareVersion": "2.0",
          "dateModified": new Date().toISOString(),
          "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "BRL"
          },
          "screenshot": {
            "@type": "ImageObject",
            "url": "https://flulegendarium.lovable.app/og-image.png"
          },
          "featureList": [
            "Quiz interativo sobre jogadores do Fluminense",
            "Modo adaptativo com dificuldade ajustável",
            "Quiz organizado por décadas",
            "Sistema de pontuação e ranking",
            "Otimizado para dispositivos móveis",
            "Funciona offline"
          ]
        };
        break;
    }

    // Remove existing schema and add new one
    const existingSchema = document.querySelector(`script[data-schema="${type}"]`);
    if (existingSchema) {
      existingSchema.remove();
    }

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-schema', type);
    script.textContent = JSON.stringify(schemaData);
    document.head.appendChild(script);

    return () => {
      const scriptToRemove = document.querySelector(`script[data-schema="${type}"]`);
      if (scriptToRemove) {
        scriptToRemove.remove();
      }
    };
  }, [type, data, location.pathname]);

  return null;
};