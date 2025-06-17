
import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { debugLogger } from '@/utils/debugLogger'

// Log de inicialização
debugLogger.info('Main', 'Aplicação iniciando...');

const rootElement = document.getElementById("root");
if (!rootElement) {
  debugLogger.error('Main', 'Elemento root não encontrado!');
  throw new Error("Root element not found");
}

// Adicionar classe CSS para garantir que os estilos sejam aplicados
document.documentElement.classList.add('css-loaded');

const root = createRoot(rootElement);

try {
  root.render(<App />);
  debugLogger.info('Main', 'Aplicação renderizada com sucesso');
} catch (error) {
  debugLogger.error('Main', 'Erro ao renderizar aplicação', error);
  throw error;
}
