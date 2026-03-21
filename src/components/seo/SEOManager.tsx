import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const CANONICAL_DOMAIN = "https://lendasdoflu.com";

type SchemaType = 'WebSite' | 'Game' | 'Organization' | 'FAQ' | 'WebPage';

interface SEOManagerProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  canonical?: string;
  type?: string;
  noindex?: boolean;
  schema?: SchemaType;
  gameMode?: string;
  difficulty?: string;
}

const SCHEMA_GENERATORS: Record<SchemaType, (props: { title: string; description: string; url: string; image: string }) => Record<string, unknown>> = {
  WebSite: ({ title, description, url }) => ({
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Lendas do Flu",
    "description": description,
    "url": `${CANONICAL_DOMAIN}/`,
    "publisher": {
      "@type": "Organization",
      "name": "Lendas do Flu",
      "logo": {
        "@type": "ImageObject",
        "url": `${CANONICAL_DOMAIN}/og-image.png`
      }
    }
  }),

  Game: ({ title, description }) => ({
    "@context": "https://schema.org",
    "@type": "Game",
    "name": title,
    "description": description,
    "url": `${CANONICAL_DOMAIN}/selecionar-modo-jogo`,
    "genre": ["Quiz", "Sports", "Educational"],
    "numberOfPlayers": "1",
    "publisher": { "@type": "Organization", "name": "Lendas do Flu" },
    "applicationCategory": "Game",
    "operatingSystem": "Web Browser",
    "offers": { "@type": "Offer", "price": "0", "priceCurrency": "BRL" }
  }),

  Organization: () => ({
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Lendas do Flu",
    "description": "Plataforma interativa para testar conhecimentos sobre a história do Fluminense",
    "url": `${CANONICAL_DOMAIN}/`,
    "logo": `${CANONICAL_DOMAIN}/og-image.png`,
    "sameAs": [
      "https://twitter.com/lendasdoflu",
      "https://instagram.com/lendasdoflu"
    ]
  }),

  FAQ: ({ description }) => ({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "name": "FAQ - Lendas do Flu",
    "description": description,
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
  }),

  WebPage: ({ title, description, url }) => ({
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": title,
    "description": description,
    "url": url,
    "inLanguage": "pt-BR",
    "isPartOf": {
      "@type": "WebSite",
      "name": "Lendas do Flu",
      "url": `${CANONICAL_DOMAIN}/`
    }
  })
};

export const SEOManager = ({
  title = "Lendas do Flu - Teste seus conhecimentos tricolores",
  description = "Descubra se você realmente conhece as lendas do Fluminense. Adivinhe o jogador pela foto e prove que é um verdadeiro tricolor!",
  keywords = "quiz fluminense, teste fluminense, jogo fluminense, tricolor, futebol, adivinhe jogador",
  image = "/lovable-uploads/1b089617-8fa2-440f-ab41-5192f292f5f3.png",
  url,
  canonical,
  type = "website",
  noindex = false,
  schema,
}: SEOManagerProps) => {
  const location = useLocation();
  const resolvedUrl = url || `${CANONICAL_DOMAIN}${location.pathname}`;
  const resolvedCanonical = canonical || resolvedUrl;

  useEffect(() => {
    // Update document title
    document.title = title;

    // Helper to upsert meta tags
    const updateMeta = (attr: string, key: string, content: string) => {
      let el = document.querySelector(`meta[${attr}="${key}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attr, key);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    // Basic meta
    updateMeta('name', 'description', description);
    updateMeta('name', 'keywords', keywords);
    updateMeta('name', 'robots', noindex ? 'noindex, nofollow' : 'index, follow');

    // Open Graph
    updateMeta('property', 'og:title', title);
    updateMeta('property', 'og:description', description);
    updateMeta('property', 'og:image', image);
    updateMeta('property', 'og:url', resolvedUrl);
    updateMeta('property', 'og:type', type);
    updateMeta('property', 'og:site_name', 'Lendas do Flu');
    updateMeta('property', 'og:locale', 'pt_BR');

    // Twitter Card
    updateMeta('name', 'twitter:card', 'summary_large_image');
    updateMeta('name', 'twitter:title', title);
    updateMeta('name', 'twitter:description', description);
    updateMeta('name', 'twitter:image', image);
    updateMeta('name', 'twitter:url', resolvedUrl);
    updateMeta('name', 'twitter:site', '@LendasDoFlu');

    // Canonical link
    let linkEl = document.querySelector('link[rel="canonical"]');
    if (!linkEl) {
      linkEl = document.createElement('link');
      linkEl.setAttribute('rel', 'canonical');
      document.head.appendChild(linkEl);
    }
    linkEl.setAttribute('href', resolvedCanonical);

    // JSON-LD structured data (single script, replaces all previous approaches)
    const schemaType = schema || 'WebPage';
    const generator = SCHEMA_GENERATORS[schemaType];
    const structuredData = generator({ title, description, url: resolvedUrl, image });

    let jsonLdScript = document.querySelector('script[data-seo-manager]');
    if (!jsonLdScript) {
      jsonLdScript = document.createElement('script');
      jsonLdScript.setAttribute('type', 'application/ld+json');
      jsonLdScript.setAttribute('data-seo-manager', 'true');
      document.head.appendChild(jsonLdScript);
    }
    jsonLdScript.textContent = JSON.stringify(structuredData);

    return () => {
      // Cleanup JSON-LD on unmount
      const script = document.querySelector('script[data-seo-manager]');
      if (script) script.remove();
    };
  }, [title, description, keywords, image, resolvedUrl, resolvedCanonical, type, noindex, schema]);

  return null;
};
