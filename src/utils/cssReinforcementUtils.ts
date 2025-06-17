
import { debugLogger } from '@/utils/debugLogger';

export const cssReinforcementUtils = {
  reinforceStyles() {
    const htmlElement = document.documentElement;
    htmlElement.classList.add('css-loaded');
    
    // Garantir que as variáveis CSS estejam definidas
    const computedStyle = getComputedStyle(document.documentElement);
    if (!computedStyle.getPropertyValue('--primary')) {
      document.documentElement.style.setProperty('--primary', '351 98% 24%');
      document.documentElement.style.setProperty('--secondary', '159 100% 19%');
      debugLogger.info('CSSReinforcement', 'Variáveis CSS reforçadas');
    }
  },

  reinforceBodyStyles() {
    // Garantir que o CSS permaneça aplicado
    const htmlElement = document.documentElement;
    htmlElement.classList.add('css-loaded');
    
    // Verificar se os estilos ainda estão aplicados
    const bodyStyle = getComputedStyle(document.body);
    if (!bodyStyle.backgroundColor || bodyStyle.backgroundColor === 'rgba(0, 0, 0, 0)') {
      document.body.style.backgroundColor = 'hsl(0 0% 100%)';
      debugLogger.info('CSSReinforcement', 'CSS de background reforçado');
    }
  }
};
