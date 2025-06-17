
import { useEffect } from 'react';

export const CriticalMeta = () => {
  useEffect(() => {
    // Função para garantir que os estilos críticos estejam sempre aplicados
    const enforceStyles = () => {
      const htmlElement = document.documentElement;
      htmlElement.classList.add('css-loaded');
      
      // Garantir que as variáveis CSS estejam definidas
      const rootStyles = {
        '--background': '0 0% 100%',
        '--foreground': '222.2 84% 4.9%',
        '--primary': '351 98% 24%',
        '--secondary': '159 100% 19%',
        '--muted': '210 40% 96.1%',
        '--border': '214.3 31.8% 91.4%'
      };

      Object.entries(rootStyles).forEach(([property, value]) => {
        if (!getComputedStyle(htmlElement).getPropertyValue(property)) {
          htmlElement.style.setProperty(property, value);
        }
      });
      
      // Garantir estilos do body
      const body = document.body;
      if (!body.style.backgroundColor) {
        body.style.backgroundColor = 'hsl(var(--background))';
        body.style.color = 'hsl(var(--foreground))';
        body.style.fontFamily = 'Inter, system-ui, sans-serif';
      }
    };

    // Otimizar viewport para mobile
    const updateViewport = () => {
      let viewportMeta = document.querySelector('meta[name="viewport"]');
      if (!viewportMeta) {
        viewportMeta = document.createElement('meta');
        viewportMeta.setAttribute('name', 'viewport');
        document.head.appendChild(viewportMeta);
      }
      viewportMeta.setAttribute('content', 'width=device-width, initial-scale=1.0, viewport-fit=cover, user-scalable=no');
    };

    // Aplicar estilos imediatamente
    enforceStyles();
    updateViewport();

    // Reforçar estilos periodicamente
    const styleInterval = setInterval(enforceStyles, 2000);

    // Reforçar estilos em mudanças de visibilidade
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        setTimeout(enforceStyles, 100);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // PWA meta tags
    const addPWAMeta = () => {
      const metas = [
        { name: 'theme-color', content: '#7A0213' },
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'default' },
        { name: 'apple-mobile-web-app-title', content: 'Lendas do Flu' },
        { name: 'mobile-web-app-capable', content: 'yes' }
      ];

      metas.forEach(({ name, content }) => {
        let meta = document.querySelector(`meta[name="${name}"]`);
        if (!meta) {
          meta = document.createElement('meta');
          meta.setAttribute('name', name);
          document.head.appendChild(meta);
        }
        meta.setAttribute('content', content);
      });
    };

    addPWAMeta();

    // Cleanup function
    return () => {
      clearInterval(styleInterval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return null;
};
