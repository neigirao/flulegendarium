
import React from "react";
import { Link } from "react-router-dom";
import { AuthButton } from "@/components/auth/AuthButton";

interface GameHeaderProps {
  user: any;
  trackEvent: (event: any) => void;
}

export const GameHeader = ({ user, trackEvent }: GameHeaderProps) => {
  return (
    <header className="bg-white/90 backdrop-blur-sm shadow-sm py-4 sticky top-0 z-50">
      <div className="container mx-auto px-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <img 
            src="/lovable-uploads/0aa3609f-0584-4bf4-8303-e03f50f7e131.png" 
            alt="Escudo Fluminense FC" 
            className="w-8 h-8 object-contain"
          />
          <span className="text-2xl font-bold text-flu-grena">Lendas do Flu</span>
        </Link>
        <nav className="flex items-center space-x-6">
          <Link 
            to="/" 
            className="text-flu-verde hover:text-flu-grena transition-colors"
            onClick={() => trackEvent({
              action: 'navigation_click',
              category: 'Navigation',
              label: 'home_from_game'
            })}
          >
            Início
          </Link>
          <Link 
            to="/selecionar-modo-jogo" 
            className="text-flu-verde hover:text-flu-grena transition-colors"
            onClick={() => trackEvent({
              action: 'navigation_click',
              category: 'Navigation',
              label: 'select_mode_from_game'
            })}
          >
            Jogar
          </Link>
          {user && (
            <Link 
              to="/meu-perfil-tricolor" 
              className="text-flu-verde hover:text-flu-grena transition-colors"
              onClick={() => trackEvent({
                action: 'navigation_click',
                category: 'Navigation',
                label: 'profile_from_game'
              })}
            >
              Meu Perfil
            </Link>
          )}
          <Link 
            to="/admin/login-administrador" 
            className="text-flu-verde hover:text-flu-grena transition-colors"
            onClick={() => trackEvent({
              action: 'navigation_click',
              category: 'Navigation',
              label: 'admin_from_game'
            })}
          >
            Admin
          </Link>
          <AuthButton />
        </nav>
      </div>
    </header>
  );
};
