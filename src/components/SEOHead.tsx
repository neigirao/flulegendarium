import { useEffect } from 'react';

const CANONICAL_DOMAIN = "https://lendasdoflu.com";

interface SEOHeadProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: string;
  keywords?: string;
  canonical?: string;
  noindex?: boolean;
}

export const SEOHead = ({ 
  title = "Lendas do Flu - Teste seus conhecimentos tricolores",
  description = "Descubra se você realmente conhece as lendas do Fluminense. Adivinhe o jogador pela foto e prove que é um verdadeiro tricolor!",
  image = "/lovable-uploads/1b089617-8fa2-440f-ab41-5192f292f5f3.png",
  url = `${CANONICAL_DOMAIN}/`,
  type = "website",
  keywords = "quiz fluminense, teste fluminense, jogo fluminense, tricolor, futebol, adivinhe jogador",
  canonical,
  noindex = false
}: SEOHeadProps) => {
  useEffect(() => {
    // Update document title
    document.title = title;
    
    // Update meta tags
    const updateMetaTag = (property: string, content: string) => {
      let metaTag = document.querySelector(`meta[property="${property}"]`) || 
                   document.querySelector(`meta[name="${property}"]`);
      
      if (!metaTag) {
        metaTag = document.createElement('meta');
        if (property.startsWith('og:') || property.startsWith('twitter:')) {
          metaTag.setAttribute('property', property);
        } else {
          metaTag.setAttribute('name', property);
        }
        document.head.appendChild(metaTag);
      }
      
      metaTag.setAttribute('content', content);
    };

    const updateLinkTag = (rel: string, href: string) => {
      let linkTag = document.querySelector(`link[rel="${rel}"]`);
      
      if (!linkTag) {
        linkTag = document.createElement('link');
        linkTag.setAttribute('rel', rel);
        document.head.appendChild(linkTag);
      }
      
      linkTag.setAttribute('href', href);
    };

    // Basic SEO tags
    updateMetaTag('description', description);
    updateMetaTag('keywords', keywords);
    
    // Robots tag
    if (noindex) {
      updateMetaTag('robots', 'noindex, nofollow');
    } else {
      updateMetaTag('robots', 'index, follow');
    }

    // Open Graph tags
    updateMetaTag('og:title', title);
    updateMetaTag('og:description', description);
    updateMetaTag('og:image', image);
    updateMetaTag('og:url', url);
    updateMetaTag('og:type', type);
    updateMetaTag('og:site_name', 'Lendas do Flu');
    updateMetaTag('og:locale', 'pt_BR');

    // Twitter Card tags
    updateMetaTag('twitter:card', 'summary_large_image');
    updateMetaTag('twitter:title', title);
    updateMetaTag('twitter:description', description);
    updateMetaTag('twitter:image', image);
    updateMetaTag('twitter:url', url);
    updateMetaTag('twitter:site', '@LendasDoFlu');

    // Canonical URL
    if (canonical) {
      updateLinkTag('canonical', canonical);
    }

    // Structured data for the page
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": title,
      "description": description,
      "url": url,
      "image": image,
      "inLanguage": "pt-BR",
      "isPartOf": {
        "@type": "WebSite",
        "name": "Lendas do Flu",
        "url": `${CANONICAL_DOMAIN}/`
      }
    };

    let jsonLdScript = document.querySelector('script[type="application/ld+json"]');
    if (!jsonLdScript) {
      jsonLdScript = document.createElement('script');
      jsonLdScript.setAttribute('type', 'application/ld+json');
      document.head.appendChild(jsonLdScript);
    }
    jsonLdScript.textContent = JSON.stringify(structuredData);

  }, [title, description, image, url, type, keywords, canonical, noindex]);

  return null;
};
