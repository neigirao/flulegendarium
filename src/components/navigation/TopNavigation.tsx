import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { AuthButton } from "@/components/auth/AuthButton";
import { useAuth } from "@/hooks/useAuth";
import { Shield, HelpCircle, User, Menu, Heart, Trophy, Landmark, BarChart3 } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useLinkPrefetch } from "@/hooks/use-route-prefetch";

export const TopNavigation = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const { onMouseEnter } = useLinkPrefetch();

  const navigationItems = [
    ...(user ? [{
      label: "Meu Perfil",
      route: '/perfil',
      onClick: () => navigate('/perfil'),
      icon: User,
    }] : []),
    ...(user ? [{
      label: "Conquistas",
      route: '/conquistas',
      onClick: () => navigate('/conquistas'),
      icon: Trophy,
    }] : []),
    {
      label: "Estatísticas",
      route: '/estatisticas',
      onClick: () => navigate('/estatisticas'),
      icon: BarChart3,
    },
    {
      label: "Doações",
      route: '/doacoes',
      onClick: () => navigate('/doacoes'),
      icon: Heart,
    },
    {
      label: "FAQ",
      route: '/faq',
      onClick: () => navigate('/faq'),
      icon: HelpCircle,
    },
    {
      label: "Jogos do Flu",
      href: 'https://jogodoflu.com/',
      icon: Landmark,
      external: true,
    },
    {
      label: "Admin",
      route: '/admin/login-administrador',
      onClick: () => navigate('/admin/login-administrador'),
      icon: Shield,
    }
  ];

  const handlePrefetch = useCallback((route: string) => {
    onMouseEnter(route);
  }, [onMouseEnter]);

  const handleNavigation = (onClick: () => void) => {
    onClick();
    setIsOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-lg border-b border-secondary/20 shadow-lg bg-tricolor-vertical-border safe-area-top">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo/Brand */}
          <div 
            className="flex items-center space-x-3 cursor-pointer group"
            onClick={() => navigate('/')}
            data-testid="nav-home-link"
          >
            <div className="w-10 h-10 flex items-center justify-center">
              <img 
                src="/lovable-uploads/6b2888cd-7dd2-4048-b4ca-c9636e93d4a6.webp" 
                alt="Lendas do Flu Logo" 
                width="40"
                height="40"
                className="w-10 h-10 object-contain group-hover:scale-105 transition-transform"
                loading="eager"
                decoding="sync"
              />
            </div>
            <div className="flex flex-col">
              <h1 className="text-xl font-display text-primary leading-tight tracking-wide">
                LENDAS DO FLU
              </h1>
              <span className="text-xs text-secondary font-medium font-body">
                Tricolor de Coração
              </span>
            </div>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-2">
            {navigationItems.map((item) => (
              item.external ? (
                <Button
                  key={item.label}
                  variant="ghost"
                  size="sm"
                  asChild
                  className="text-primary hover:bg-secondary/10 hover:text-secondary transition-colors touch-target"
                >
                  <a href={item.href} target="_blank" rel="noopener noreferrer">
                    <item.icon className="h-4 w-4 mr-2" />
                    {item.label}
                  </a>
                </Button>
              ) : (
                <Button
                  key={item.label}
                  variant="ghost"
                  size="sm"
                  onClick={item.onClick}
                  onMouseEnter={() => handlePrefetch(item.route)}
                  className="text-primary hover:bg-secondary/10 hover:text-secondary transition-colors touch-target"
                >
                  <item.icon className="h-4 w-4 mr-2" />
                  {item.label}
                </Button>
              )
            ))}
            
            <div className="flex items-center space-x-2 ml-4 pl-4 border-l border-secondary/20">
              <AuthButton />
            </div>
          </div>

          {/* Mobile Menu */}
          <div className="md:hidden flex items-center space-x-2">
            <AuthButton />
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="text-primary hover:bg-secondary/10 touch-target"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80 bg-background border-l border-secondary/20 bg-tricolor-left-accent safe-area-right">
                <div className="flex flex-col space-y-4 mt-8">
                  <div className="flex items-center space-x-3 pb-4 border-b border-secondary/20">
                    <div className="w-12 h-12 flex items-center justify-center">
                      <img 
                        src="/lovable-uploads/6b2888cd-7dd2-4048-b4ca-c9636e93d4a6.png" 
                        alt="Lendas do Flu Logo" 
                        className="w-12 h-12 object-contain"
                      />
                    </div>
                    <div>
                      <h2 className="font-display text-primary tracking-wide">LENDAS DO FLU</h2>
                      <p className="text-sm text-secondary font-body">Menu Principal</p>
                    </div>
                  </div>
                  
                  {navigationItems.map((item) => (
                    item.external ? (
                      <Button
                        key={item.label}
                        variant="ghost"
                        asChild
                        className="justify-start text-primary hover:bg-secondary/10 hover:text-secondary touch-target-lg"
                      >
                        <a
                          href={item.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => setIsOpen(false)}
                        >
                          <item.icon className="h-5 w-5 mr-3" />
                          {item.label}
                        </a>
                      </Button>
                    ) : (
                      <Button
                        key={item.label}
                        variant="ghost"
                        onClick={() => handleNavigation(item.onClick)}
                        className="justify-start text-primary hover:bg-secondary/10 hover:text-secondary touch-target-lg"
                      >
                        <item.icon className="h-5 w-5 mr-3" />
                        {item.label}
                      </Button>
                    )
                  ))}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
};
