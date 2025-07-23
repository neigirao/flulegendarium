import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { NotificationCenter } from "@/components/notifications/NotificationCenter";
import { AuthButton } from "@/components/auth/AuthButton";
import { useAuth } from "@/hooks/useAuth";
import { Shield, HelpCircle, Menu, X, Newspaper } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

export const TopNavigation = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const MenuItems = () => (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => {
          navigate('/faq');
          setIsMenuOpen(false);
        }}
        className="text-flu-grena hover:bg-flu-verde/10 justify-start w-full md:w-auto"
      >
        <HelpCircle className="h-4 w-4 mr-1" />
        FAQ
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={() => {
          navigate('/noticias');
          setIsMenuOpen(false);
        }}
        className="text-flu-grena hover:bg-flu-verde/10 justify-start w-full md:w-auto"
      >
        <Newspaper className="h-4 w-4 mr-1" />
        Portal de Notícias
      </Button>

      <NotificationCenter />
      
      <AuthButton />
      
      <Button
        variant="ghost"
        size="sm"
        onClick={() => {
          navigate('/admin/login-administrador');
          setIsMenuOpen(false);
        }}
        className="text-flu-grena hover:bg-flu-verde/10 justify-start w-full md:w-auto"
      >
        <Shield className="h-4 w-4 mr-1" />
        Admin
      </Button>
    </>
  );

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-sm border-b border-flu-verde/20">
      <div className="container mx-auto px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <h2 
              className="text-xl font-bold text-flu-grena cursor-pointer" 
              onClick={() => navigate('/')}
            >
              Lendas do Flu
            </h2>
          </div>
          
          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-2">
            <MenuItems />
          </div>

          {/* Mobile Menu */}
          <div className="md:hidden">
            <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-flu-grena"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-64">
                <div className="flex flex-col space-y-4 mt-8">
                  <MenuItems />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
};