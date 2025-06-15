
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Target, TrendingDown, Star } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useUserSpecialties } from "@/hooks/use-user-specialties";

export const UserSpecialties = () => {
  const { user } = useAuth();
  const { strengths, weaknesses, isLoading } = useUserSpecialties(user?.id!);

  if (!user) return null;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-flu-grena">
            <Star className="w-5 h-5" />
            Análise de Especialidades
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8">
            <div className="w-6 h-6 border-2 border-flu-grena border-t-transparent rounded-full animate-spin"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-flu-grena">
          <Star className="w-5 h-5" />
          Análise de Especialidades
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Pontos Fortes */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Trophy className="w-4 h-4 text-flu-verde" />
            <h3 className="font-semibold text-flu-verde">Seus Pontos Fortes</h3>
          </div>
          
          {strengths.length > 0 ? (
            <div className="grid gap-3">
              {strengths.map((player, index) => (
                <div 
                  key={player.player_name}
                  className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-6 h-6 bg-flu-verde text-white text-xs font-bold rounded-full">
                      {index + 1}
                    </div>
                    <span className="font-medium text-gray-800">{player.player_name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                      {player.success_rate.toFixed(1)}% de acerto
                    </Badge>
                    <span className="text-sm text-gray-600">
                      {player.correct_attempts}/{player.total_attempts}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-gray-500">
              <Trophy className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              <p>Continue jogando para descobrir seus pontos fortes!</p>
            </div>
          )}
        </div>

        {/* Pontos Fracos */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <TrendingDown className="w-4 h-4 text-orange-600" />
            <h3 className="font-semibold text-orange-600">Área para Melhorar</h3>
          </div>
          
          {weaknesses.length > 0 ? (
            <div className="grid gap-3">
              {weaknesses.map((player, index) => (
                <div 
                  key={player.player_name}
                  className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-200"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-6 h-6 bg-orange-600 text-white text-xs font-bold rounded-full">
                      {index + 1}
                    </div>
                    <span className="font-medium text-gray-800">{player.player_name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-300">
                      {player.success_rate.toFixed(1)}% de acerto
                    </Badge>
                    <span className="text-sm text-gray-600">
                      {player.correct_attempts}/{player.total_attempts}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-gray-500">
              <Target className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              <p>Você está indo muito bem! Continue assim!</p>
            </div>
          )}
        </div>

        {strengths.length === 0 && weaknesses.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Star className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <h3 className="font-semibold mb-2">Comece a Jogar!</h3>
            <p>Jogue mais partidas para descobrir suas especialidades e áreas de melhoria.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
