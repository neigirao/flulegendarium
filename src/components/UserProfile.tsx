
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, Trophy, Target, Calendar } from 'lucide-react';

export const UserProfile = () => {
  const { user, signOut } = useAuth();

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <User className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600">Faça login para ver seu perfil</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className="w-12 h-12 bg-flu-grena rounded-full flex items-center justify-center">
              <User size={24} className="text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-flu-grena">
                {user.user_metadata?.full_name || user.email}
              </h2>
              <p className="text-gray-600">{user.email}</p>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-4 bg-flu-verde/10 rounded-lg">
              <Trophy className="w-8 h-8 text-flu-verde" />
              <div>
                <p className="text-sm text-gray-600">Jogos</p>
                <p className="text-xl font-bold text-flu-grena">0</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-flu-grena/10 rounded-lg">
              <Target className="w-8 h-8 text-flu-grena" />
              <div>
                <p className="text-sm text-gray-600">Pontuação</p>
                <p className="text-xl font-bold text-flu-grena">0</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-gray-100 rounded-lg">
              <Calendar className="w-8 h-8 text-gray-600" />
              <div>
                <p className="text-sm text-gray-600">Membro desde</p>
                <p className="text-sm font-medium text-gray-800">
                  {new Date(user.created_at).toLocaleDateString('pt-BR')}
                </p>
              </div>
            </div>
          </div>
          
          <div className="pt-4 border-t">
            <Button
              onClick={signOut}
              variant="outline"
              className="w-full border-red-200 text-red-600 hover:bg-red-50"
            >
              Sair da Conta
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
