
import { useQuery } from "@tanstack/react-query";
import { getTopRankings, Ranking } from "@/services/rankingService";

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
    <div className="mt-6">
      <h3 className="text-lg font-semibold mb-3">Top 10 Jogadores</h3>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Posição</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pontuação</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {rankings.map((ranking, index) => (
              <tr key={ranking.id} className={index < 3 ? "bg-yellow-50" : ""}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  {index + 1}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {ranking.player_name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
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
