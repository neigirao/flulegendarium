import { Link } from 'react-router-dom';
import { Instagram, Heart } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="mt-16 border-t border-border bg-card">
      {/* Tricolor stripe */}
      <div className="h-1 w-full flex">
        <div className="flex-1 bg-[hsl(var(--primary))]" />
        <div className="flex-1 bg-background" />
        <div className="flex-1 bg-[hsl(var(--secondary))]" />
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center gap-6 text-center">
          {/* Logo + tagline */}
          <div>
            <h3 className="font-display text-lg text-primary mb-1">Lendas do Flu</h3>
            <p className="text-xs text-muted-foreground">O quiz definitivo do torcedor tricolor</p>
          </div>

          {/* Nav links */}
          <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm">
            <Link to="/selecionar-modo-jogo" className="text-muted-foreground hover:text-foreground transition-colors">
              Jogar
            </Link>
            <Link to="/estatisticas" className="text-muted-foreground hover:text-foreground transition-colors">
              Estatísticas
            </Link>
            <Link to="/ranking" className="text-muted-foreground hover:text-foreground transition-colors">
              Ranking
            </Link>
            <a
              href="https://www.instagram.com/lendasdoflu"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1"
            >
              <Instagram className="w-3.5 h-3.5" />
              @lendasdoflu
            </a>
          </nav>

          {/* Copyright */}
          <p className="text-xs text-muted-foreground/60 flex items-center gap-1">
            © 2024 Lendas do Flu — Feito com <Heart className="w-3 h-3 text-primary fill-primary" /> por tricolores, para tricolores
          </p>
        </div>
      </div>
    </footer>
  );
};
