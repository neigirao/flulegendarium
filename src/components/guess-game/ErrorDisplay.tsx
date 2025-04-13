
import { useNavigate } from "react-router-dom";

interface ErrorDisplayProps {
  error: unknown;
}

export const ErrorDisplay = ({ error }: ErrorDisplayProps) => {
  const navigate = useNavigate();
  
  return (
    <div className="text-center p-8">
      <p className="text-red-500 font-semibold mb-4">Erro ao carregar jogadores.</p>
      <p className="text-sm text-gray-600 mb-4">
        {error instanceof Error ? error.message : "Erro desconhecido"}
      </p>
      <button 
        onClick={() => navigate("/")}
        className="bg-flu-grena text-white px-4 py-2 rounded-lg"
      >
        Voltar
      </button>
    </div>
  );
};
