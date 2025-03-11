import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { RootLayout } from "@/components/RootLayout";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <RootLayout>
      <div className="min-h-screen bg-flu-stripes">
        <div className="container mx-auto px-4 py-8 flex flex-col items-center justify-center">
          <h1 className="text-6xl font-bold text-flu-grena mb-4">404</h1>
          <p className="text-2xl text-flu-verde mb-8">Página não encontrada</p>
          <Button onClick={() => navigate("/")} className="bg-flu-grena hover:bg-flu-grena/90 text-white font-bold py-3 px-6">
            Voltar para a página inicial
          </Button>
        </div>
      </div>
    </RootLayout>
  );
}
