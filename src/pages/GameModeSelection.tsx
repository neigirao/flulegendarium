
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

const GameModeSelection = () => {
  const navigate = useNavigate();
  const { loading } = useAuth();

  // Redireciona automaticamente para o modo adaptativo
  useEffect(() => {
    if (!loading) {
      navigate("/quiz-adaptativo", { replace: true });
    }
  }, [loading, navigate]);

  // Mostra loading enquanto redireciona
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 p-6 bg-white/80 backdrop-blur-sm rounded-xl shadow-lg">
          <div className="w-8 h-8 border-4 border-flu-grena border-t-transparent rounded-full animate-spin"></div>
          <p className="text-flu-grena font-semibold">Redirecionando...</p>
        </div>
      </div>
    );
  }

  return null;
};

export default GameModeSelection;
