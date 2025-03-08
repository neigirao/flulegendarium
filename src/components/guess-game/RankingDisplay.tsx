
import { useQuery } from "@tanstack/react-query";
import { getTopRankings, Ranking } from "@/services/rankingService";
import { Trophy } from "lucide-react";

export const RankingDisplay = () => {
  const { data: rankings = [], isLoading, error } = useQuery({
    queryKey: ['rankings'],
    queryFn: () => getTopRankings(10),
  });

  if (isLoading) {
    return <div className="text-center p-4">Carregando ranking...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500 p-4">Erro ao carregar ranking</div>;
  }

  if (rankings.length === 0) {
    return (
      <div className="text-center p-4 text-gray-500">
        Ainda não há jogadores no ranking
      </div>
    );
  }

  return (
    <div className="mt-4">
      <h3 className="text-lg font-semibold mb-3 text-center text-flu-grena flex items-center justify-center gap-2">
        <Trophy className="h-5 w-5 text-yellow-500" />
        Top 10 Jogadores
      </h3>
      <div className="bg-white/80 rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-flu-verde/20">
            <tr>
              <th className="px-3 py-2 text-left text-xs font-medium text-flu-grena uppercase tracking-wider">#</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-flu-grena uppercase tracking-wider">Nome</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-flu-grena uppercase tracking-wider">Pontos</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {rankings.map((ranking, index) => (
              <tr key={ranking.id} className={index < 3 ? "bg-yellow-50" : ""}>
                <td className="px-3 py-2 whitespace-nowrap text-sm font-medium">
                  {index + 1}
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                  {ranking.player_name}
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                  {ranking.score}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
