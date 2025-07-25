import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { NotificationCenter } from "@/components/notifications/NotificationCenter";
import { AuthButton } from "@/components/auth/AuthButton";
import { useAuth } from "@/hooks/useAuth";
import { Shield, HelpCircle, User, Menu, X, Newspaper, Heart } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export const TopNavigation = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const navigationItems = [
    {
      label: "Portal de Notícias",
      onClick: () => navigate('/noticias'),
      icon: Newspaper,
    },
    {
      label: "Doações",
      onClick: () => navigate('/doacoes'),
      icon: Heart,
    },
    {
      label: "FAQ",
      onClick: () => navigate('/faq'),
      icon: HelpCircle,
    },
    {
      label: "Admin",
      onClick: () => navigate('/admin/login-administrador'),
      icon: Shield,
    }
  ];

  const handleNavigation = (onClick: () => void) => {
    onClick();
    setIsOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-lg border-b border-flu-verde/20 shadow-lg">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo/Brand */}
          <div 
            className="flex items-center space-x-3 cursor-pointer group"
            onClick={() => navigate('/')}
          >
            <div className="w-10 h-10 flex items-center justify-center">
              <img 
                src="/lovable-uploads/6b2888cd-7dd2-4048-b4ca-c9636e93d4a6.png" 
                alt="Lendas do Flu Logo" 
                className="w-10 h-10 object-contain group-hover:scale-105 transition-transform"
              />
            </div>
            <div className="flex flex-col">
              <h1 className="text-xl font-bold text-flu-grena leading-tight">
                Lendas do Flu
              </h1>
              <span className="text-xs text-flu-verde font-medium">
                Tricolor de Coração
              </span>
            </div>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-2">
            {navigationItems.map((item) => (
              <Button
                key={item.label}
                variant="ghost"
                size="sm"
                onClick={item.onClick}
                className="text-flu-grena hover:bg-flu-verde/10 hover:text-flu-verde transition-colors"
              >
                <item.icon className="h-4 w-4 mr-2" />
                {item.label}
              </Button>
            ))}
            
            <div className="flex items-center space-x-2 ml-4 pl-4 border-l border-flu-verde/20">
              <NotificationCenter />
              <AuthButton />
            </div>
          </div>

          {/* Mobile Menu */}
          <div className="md:hidden flex items-center space-x-2">
            <NotificationCenter />
            <AuthButton />
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="text-flu-grena hover:bg-flu-verde/10"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80 bg-background border-l border-flu-verde/20">
                <div className="flex flex-col space-y-4 mt-8">
                  <div className="flex items-center space-x-3 pb-4 border-b border-flu-verde/20">
                    <div className="w-12 h-12 flex items-center justify-center">
                      <img 
                        src="/lovable-uploads/6b2888cd-7dd2-4048-b4ca-c9636e93d4a6.png" 
                        alt="Lendas do Flu Logo" 
                        className="w-12 h-12 object-contain"
                      />
                    </div>
                    <div>
                      <h2 className="font-bold text-flu-grena">Lendas do Flu</h2>
                      <p className="text-sm text-flu-verde">Menu Principal</p>
                    </div>
                  </div>
                  
                  {navigationItems.map((item) => (
                    <Button
                      key={item.label}
                      variant="ghost"
                      onClick={() => handleNavigation(item.onClick)}
                      className="justify-start text-flu-grena hover:bg-flu-verde/10 hover:text-flu-verde h-12"
                    >
                      <item.icon className="h-5 w-5 mr-3" />
                      {item.label}
                    </Button>
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