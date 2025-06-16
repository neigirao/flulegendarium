
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Users, TrendingUp, Target, Award } from "lucide-react";
import { UserSegment } from "@/services/adminBusinessIntelligence";

interface UserSegmentationCardProps {
  segments: UserSegment[];
  isLoading?: boolean;
}

export const UserSegmentationCard = ({ segments, isLoading }: UserSegmentationCardProps) => {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Segmentação de Usuários
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse bg-gray-200 h-16 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalUsers = segments.reduce((sum, segment) => sum + segment.user_count, 0);

  const getSegmentIcon = (segmentName: string) => {
    switch (segmentName) {
      case 'Jogadores Hardcore':
        return <Award className="w-4 h-4 text-amber-600" />;
      case 'Jogadores Regulares':
        return <TrendingUp className="w-4 h-4 text-blue-600" />;
      case 'Jogadores Casuais':
        return <Target className="w-4 h-4 text-green-600" />;
      default:
        return <Users className="w-4 h-4 text-gray-600" />;
    }
  };

  const getSegmentColor = (segmentName: string) => {
    switch (segmentName) {
      case 'Jogadores Hardcore':
        return 'bg-amber-100 text-amber-800';
      case 'Jogadores Regulares':
        return 'bg-blue-100 text-blue-800';
      case 'Jogadores Casuais':
        return 'bg-green-100 text-green-800';
      case 'Novos Usuários':
        return 'bg-purple-100 text-purple-800';
      case 'Jogadores Inativos':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5 text-flu-grena" />
          Segmentação de Usuários
          <Badge variant="secondary" className="ml-auto">
            {totalUsers} usuários total
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {segments.map((segment, index) => {
          const percentage = totalUsers > 0 ? (segment.user_count / totalUsers) * 100 : 0;
          
          return (
            <div key={index} className="p-4 border rounded-lg hover:shadow-sm transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {getSegmentIcon(segment.segment_name)}
                  <h4 className="font-semibold">{segment.segment_name}</h4>
                </div>
                <Badge className={getSegmentColor(segment.segment_name)}>
                  {segment.user_count} usuários
                </Badge>
              </div>
              
              <p className="text-sm text-gray-600 mb-3">{segment.description}</p>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Proporção da base</span>
                  <span className="font-medium">{Math.round(percentage)}%</span>
                </div>
                <Progress value={percentage} className="h-2" />
              </div>
              
              <div className="grid grid-cols-3 gap-4 mt-3 text-sm">
                <div className="text-center">
                  <p className="text-gray-500">Score Médio</p>
                  <p className="font-semibold text-flu-grena">{segment.avg_score}</p>
                </div>
                <div className="text-center">
                  <p className="text-gray-500">Precisão</p>
                  <p className="font-semibold text-flu-verde">{segment.avg_accuracy}%</p>
                </div>
                <div className="text-center">
                  <p className="text-gray-500">Retenção</p>
                  <p className="font-semibold text-blue-600">{segment.retention_rate}%</p>
                </div>
              </div>
            </div>
          );
        })}
        
        {segments.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>Dados insuficientes para segmentação</p>
            <p className="text-sm">Aguarde mais usuários para análise</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
