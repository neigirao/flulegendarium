import { useEffect } from 'react';

const CANONICAL_DOMAIN = "https://lendasdoflu.com";

interface WebPageData {
  title?: string;
  description?: string;
  path?: string;
  breadcrumbs?: Array<{ name: string; url: string }>;
}

interface StructuredDataProps {
  type: 'Game' | 'WebSite' | 'Organization' | 'FAQ' | 'WebPage';
  data?: WebPageData;
}

export const StructuredData = ({ type, data }: StructuredDataProps) => {
  useEffect(() => {
    let structuredData: Record<string, unknown> = {};

    switch (type) {
      case 'WebSite':
        structuredData = {
          "@context": "https://schema.org",
          "@type": "WebSite",
          "name": "Lendas do Flu",
          "description": "Teste seus conhecimentos sobre os ídolos tricolores do Fluminense",
          "url": `${CANONICAL_DOMAIN}/`,
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
          "url": `${CANONICAL_DOMAIN}/selecionar-modo-jogo`,
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

      case 'FAQ':
        structuredData = {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "name": "FAQ - Lendas do Flu",
          "description": "Perguntas frequentes sobre o quiz do Fluminense",
          "url": `${CANONICAL_DOMAIN}/faq`,
          "mainEntity": [
            {
              "@type": "Question",
              "name": "O que é Lendas do Flu?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Lendas do Flu é um quiz interativo onde você testa seus conhecimentos sobre jogadores históricos e atuais do Fluminense FC."
              }
            },
            {
              "@type": "Question",
              "name": "Quais modos de jogo estão disponíveis?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Temos TRÊS modos: Quiz Adaptativo (dificuldade automática), Quiz por Década (escolha a era) e Quiz das Camisas (adivinhe o ano entre 3 opções)."
              }
            },
            {
              "@type": "Question",
              "name": "O que é o Quiz das Camisas?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "É um modo onde você vê uma camisa histórica do Fluminense e precisa escolher entre 3 opções qual é o ano correto daquele uniforme."
              }
            }
          ]
        };
        break;

      case 'WebPage':
        structuredData = {
          "@context": "https://schema.org",
          "@type": "WebPage",
          "name": data?.title || "Lendas do Flu",
          "description": data?.description || "Quiz interativo do Fluminense",
          "url": `${CANONICAL_DOMAIN}${data?.path || '/'}`,
          "isPartOf": {
            "@type": "WebSite",
            "name": "Lendas do Flu",
            "url": CANONICAL_DOMAIN
          }
        };
        break;
    }

    // Remove only our own structured data script (identified by data-structured attribute)
    const existingScript = document.querySelector('script[type="application/ld+json"][data-structured]');
    if (existingScript) {
      existingScript.remove();
    }

    // Add new structured data script with identifier
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-structured', type);
    script.textContent = JSON.stringify(structuredData);
    document.head.appendChild(script);

    return () => {
      // Cleanup only our own script on unmount
      const scriptToRemove = document.querySelector(`script[type="application/ld+json"][data-structured="${type}"]`);
      if (scriptToRemove) {
        scriptToRemove.remove();
      }
    };
  }, [type, data]);

  return null;
};
