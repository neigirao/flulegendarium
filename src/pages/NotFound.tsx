
import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm py-4 sticky top-0 z-50">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <img 
              src="/lovable-uploads/0aa3609f-0584-4bf4-8303-e03f50f7e131.png" 
              alt="Fluminense FC" 
              className="w-8 h-8 object-contain"
            />
            <span className="text-2xl font-bold text-flu-grena">Lendas do Flu</span>
          </Link>
        </div>
      </header>

      <div className="flex items-center justify-center py-20">
        <div className="text-center max-w-md">
          <div className="flex items-center justify-center gap-4 mb-8">
            <img 
              src="/lovable-uploads/0aa3609f-0584-4bf4-8303-e03f50f7e131.png" 
              alt="Fluminense FC" 
              className="w-16 h-16 object-contain drop-shadow-lg"
            />
            <div>
              <h1 className="text-6xl font-black text-flu-grena mb-2">404</h1>
              <div className="w-20 h-1 bg-flu-verde mx-auto"></div>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-flu-grena mb-4">
            Página Não Encontrada
          </h2>
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            Ops! A página que você está procurando não existe ou foi movida.
          </p>
          <Button 
            size="lg" 
            className="bg-flu-grena hover:bg-flu-grena/90 text-white font-bold px-8 py-4 rounded-lg text-lg shadow-lg"
            asChild
          >
            <Link to="/" className="flex items-center gap-2">
              <Home size={20} />
              Voltar ao Início
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
