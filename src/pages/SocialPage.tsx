import { useState } from 'react';
import { Heart, MessageCircle, Share2, Users, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FluCard } from '@/components/ui/flu-card';
import { TopNavigation } from '@/components/navigation/TopNavigation';
import { RootLayout } from '@/components/RootLayout';
import { PlayerCommentsSection } from '@/components/social/PlayerCommentsSection';

// Mock data para demonstração
const mockPlayers = [
  {
    id: '1',
    name: 'Fred',
    image_url: '/lovable-uploads/efaf362c-8726-4049-98bc-ebb26dcdd4e1.png',
    position: 'Atacante',
    decade: '2010s'
  },
  {
    id: '2', 
    name: 'Germán Cano',
    image_url: '/lovable-uploads/20457a11-5436-48c6-906d-82b9451bc16d.png',
    position: 'Atacante',
    decade: '2020s'
  }
];

export const SocialPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPlayer, setSelectedPlayer] = useState(mockPlayers[0]);

  const filteredPlayers = mockPlayers.filter(player =>
    player.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
                  {filteredPlayers.map((player) => (
                    <div
                      key={player.id}
                      onClick={() => setSelectedPlayer(player)}
                      className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all ${
                        selectedPlayer.id === player.id
                          ? 'bg-primary/10 border border-primary/20'
                          : 'hover:bg-muted/50'
                      }`}
                    >
                      <img
                        src={player.image_url}
                        alt={player.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{player.name}</h4>
                        <p className="text-xs text-muted-foreground">
                          {player.position} • {player.decade}
                        </p>
                      </div>
                      {selectedPlayer.id === player.id && (
                        <Crown className="w-4 h-4 text-primary" />
                      )}
                    </div>
                  ))}
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

          {/* Community Stats */}
          <div className="mt-12">
            <FluCard className="p-6">
              <h3 className="text-lg font-semibold mb-6 text-center">
                📊 Estatísticas da Comunidade
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary mb-1">1.2k</div>
                  <div className="text-sm text-muted-foreground">Comentários</div>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-secondary mb-1">347</div>
                  <div className="text-sm text-muted-foreground">Membros Ativos</div>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-accent mb-1">4.8</div>
                  <div className="text-sm text-muted-foreground">Avaliação Média</div>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-flu-verde mb-1">89%</div>
                  <div className="text-sm text-muted-foreground">Aprovação</div>
                </div>
              </div>
            </FluCard>
          </div>
        </div>
      </div>
    </RootLayout>
  );
};