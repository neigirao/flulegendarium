import React, { useState } from 'react';
import { Users, Crown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { FluCard } from '@/components/ui/flu-card';
import { TopNavigation } from '@/components/navigation/TopNavigation';
import { RootLayout } from '@/components/RootLayout';
import { PlayerCommentsSection } from '@/components/social/PlayerCommentsSection';

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const SocialPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPlayer, setSelectedPlayer] = useState<any>(null);

  // Fetch players from Supabase
  const { data: players = [], isLoading } = useQuery({
    queryKey: ['players-social'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('players')
        .select('id, name, image_url, position, decades')
        .order('name');
      
      if (error) throw error;
      return data;
    }
  });

  const filteredPlayers = players.filter(player =>
    player.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Set first player as selected when data loads
  React.useEffect(() => {
    if (players.length > 0 && !selectedPlayer) {
      setSelectedPlayer(players[0]);
    }
  }, [players, selectedPlayer]);

  return (
    <RootLayout>
      <TopNavigation />
      <div className="min-h-screen bg-gradient-to-br from-flu-verde/10 via-white to-flu-grena/10 pt-20">
        <div className="container mx-auto px-4 py-8">
          
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-flu-grena mb-4">
              💬 Comunidade Tricolor
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Compartilhe suas opiniões sobre os jogadores e conecte-se com outros torcedores
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Players List */}
            <div className="lg:col-span-1">
              <FluCard className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Users className="w-5 h-5 text-primary" />
                  <h3 className="text-lg font-semibold">Jogadores</h3>
                </div>
                
                <Input
                  placeholder="Buscar jogador..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="mb-4"
                />

                 <div className="space-y-3">
                   {isLoading ? (
                     <div className="space-y-3">
                       {[...Array(5)].map((_, i) => (
                         <div key={i} className="flex items-center gap-3 p-3">
                           <div className="w-12 h-12 bg-gray-200 rounded-full animate-pulse"></div>
                           <div className="flex-1 space-y-2">
                             <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                             <div className="h-3 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                           </div>
                         </div>
                       ))}
                     </div>
                   ) : filteredPlayers.length > 0 ? (
                     filteredPlayers.map((player) => (
                       <div
                         key={player.id}
                         onClick={() => setSelectedPlayer(player)}
                         className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all ${
                           selectedPlayer?.id === player.id
                             ? 'bg-primary/10 border border-primary/20'
                             : 'hover:bg-muted/50'
                         }`}
                       >
                         <img
                           src={player.image_url}
                           alt={player.name}
                           className="w-12 h-12 rounded-full object-cover"
                           onError={(e) => {
                             (e.target as HTMLImageElement).src = '/placeholder.svg';
                           }}
                         />
                         <div className="flex-1">
                           <h4 className="font-medium text-sm">{player.name}</h4>
                           <p className="text-xs text-muted-foreground">
                             {player.position} • {player.decades?.[0] || 'N/A'}
                           </p>
                         </div>
                         {selectedPlayer?.id === player.id && (
                           <Crown className="w-4 h-4 text-primary" />
                         )}
                       </div>
                     ))
                   ) : (
                     <div className="text-center py-8 text-gray-500">
                       <p>Nenhum jogador encontrado</p>
                     </div>
                   )}
                 </div>
              </FluCard>
            </div>

            {/* Comments Section */}
            <div className="lg:col-span-2">
              {selectedPlayer && (
                <PlayerCommentsSection 
                  playerId={selectedPlayer.id}
                  playerName={selectedPlayer.name}
                />
              )}
            </div>
          </div>

        </div>
      </div>
    </RootLayout>
  );
};