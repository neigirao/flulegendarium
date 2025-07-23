import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { NotificationCenter } from "@/components/notifications/NotificationCenter";
import { AuthButton } from "@/components/auth/AuthButton";
import { useAuth } from "@/hooks/useAuth";
import { Shield, HelpCircle, User } from "lucide-react";

export const TopNavigation = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-sm border-b border-flu-verde/20">
      <div className="container mx-auto px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-bold text-flu-grena">Lendas do Flu</h2>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/faq')}
              className="text-flu-grena hover:bg-flu-verde/10"
            >
              <HelpCircle className="h-4 w-4 mr-1" />
              FAQ
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/noticias')}
              className="text-flu-grena hover:bg-flu-verde/10"
            >
              📰 Portal de Notícias
            </Button>
            
            
            <NotificationCenter />
            
            <AuthButton />
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/admin/login-administrador')}
              className="text-flu-grena hover:bg-flu-verde/10"
            >
              <Shield className="h-4 w-4 mr-1" />
              Admin
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};