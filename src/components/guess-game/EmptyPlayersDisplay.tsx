
import { useNavigate } from "react-router-dom";

export const EmptyPlayersDisplay = () => {
  const navigate = useNavigate();
  
  return (
    <div className="text-center p-8">
      <p className="mb-4">Nenhum jogador cadastrado ainda.</p>
      <button 
        onClick={() => navigate("/")}
        className="bg-flu-grena text-white px-4 py-2 rounded-lg"
      >
        Voltar
      </button>
    </div>
  );
};
