import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Upload, Link, Check, X, RefreshCw, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import { logger } from '@/utils/logger';
import { isProblematicDomain } from '@/utils/player-image/problematicUrls';

interface ProblematicPlayer {
  id: string;
  name: string;
  image_url: string;
  domain: string;
  error?: string;
}

export const ProblematicPlayersManagement = () => {
  const [players, setPlayers] = useState<ProblematicPlayer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadingPlayerId, setUploadingPlayerId] = useState<string | null>(null);
  const [alternativeUrls, setAlternativeUrls] = useState<Record<string, string>>({});

  const loadProblematicPlayers = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('players')
        .select('id, name, image_url')
        .order('name');

      if (error) throw error;

      const problematic = data.filter(player => {
        if (!player.image_url) return true;
        
        const isExternal = player.image_url.startsWith('http://') || 
                          player.image_url.startsWith('https://');
        
        if (!isExternal) return false;
        
        // Check if it's a problematic domain or not from our storage
        const isOurStorage = player.image_url.includes('supabase.co/storage');
        if (isOurStorage) return false;
        
        return isProblematicDomain(player.image_url);
      }).map(player => {
        let domain = '';
        try {
          domain = new URL(player.image_url).hostname;
        } catch {
          domain = 'URL inválida';
        }
        return { ...player, domain };
      });

      setPlayers(problematic);
      logger.info(`Encontrados ${problematic.length} jogadores com URLs problemáticas`);
    } catch (error) {
      logger.error('Erro ao carregar jogadores:', error);
      toast.error('Erro ao carregar jogadores');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProblematicPlayers();
  }, []);

  const handleFileUpload = async (playerId: string, file: File) => {
    setUploadingPlayerId(playerId);
    try {
      const player = players.find(p => p.id === playerId);
      if (!player) throw new Error('Jogador não encontrado');

      // Validate file type
      if (!file.type.startsWith('image/')) {
        throw new Error('Arquivo deve ser uma imagem');
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('Arquivo muito grande (máx 5MB)');
      }

      const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const fileName = `${playerId}.${extension}`;

      logger.info(`Uploading ${fileName} for ${player.name}`);

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from('players')
        .upload(fileName, file, {
          contentType: file.type,
          upsert: true,
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('players')
        .getPublicUrl(fileName);

      // Update database
      const { error: updateError } = await supabase
        .from('players')
        .update({ image_url: publicUrl })
        .eq('id', playerId);

      if (updateError) throw updateError;

      // Remove from list
      setPlayers(prev => prev.filter(p => p.id !== playerId));
      toast.success(`Imagem de ${player.name} atualizada com sucesso!`);
      logger.info(`✅ ${player.name} atualizado com URL local`);

    } catch (error) {
      logger.error('Erro no upload:', error);
      toast.error(error instanceof Error ? error.message : 'Erro no upload');
    } finally {
      setUploadingPlayerId(null);
    }
  };

  const handleUrlUpdate = async (playerId: string) => {
    const newUrl = alternativeUrls[playerId]?.trim();
    if (!newUrl) {
      toast.error('Digite uma URL válida');
      return;
    }

    setUploadingPlayerId(playerId);
    try {
      const player = players.find(p => p.id === playerId);
      if (!player) throw new Error('Jogador não encontrado');

      // Validate URL format
      try {
        new URL(newUrl);
      } catch {
        throw new Error('URL inválida');
      }

      // Try to migrate via Edge Function
      const { data, error } = await supabase.functions.invoke('migrate-player-image', {
        body: {
          playerId,
          playerName: player.name,
          currentUrl: newUrl,
        },
      });

      if (error) throw error;

      if (!data.success) {
        throw new Error(data.error || 'Erro na migração');
      }

      // Remove from list
      setPlayers(prev => prev.filter(p => p.id !== playerId));
      setAlternativeUrls(prev => {
        const updated = { ...prev };
        delete updated[playerId];
        return updated;
      });

      toast.success(`${player.name} migrado com sucesso!`);
      logger.info(`✅ ${player.name} migrado de URL alternativa`);

    } catch (error) {
      logger.error('Erro ao atualizar URL:', error);
      toast.error(error instanceof Error ? error.message : 'Erro ao atualizar');
    } finally {
      setUploadingPlayerId(null);
    }
  };

  const handleDirectUrlUpdate = async (playerId: string) => {
    const newUrl = alternativeUrls[playerId]?.trim();
    if (!newUrl) {
      toast.error('Digite uma URL válida');
      return;
    }

    setUploadingPlayerId(playerId);
    try {
      const player = players.find(p => p.id === playerId);
      if (!player) throw new Error('Jogador não encontrado');

      // Just update the URL directly without migration
      const { error } = await supabase
        .from('players')
        .update({ image_url: newUrl })
        .eq('id', playerId);

      if (error) throw error;

      setPlayers(prev => prev.filter(p => p.id !== playerId));
      setAlternativeUrls(prev => {
        const updated = { ...prev };
        delete updated[playerId];
        return updated;
      });

      toast.success(`URL de ${player.name} atualizada!`);
      logger.info(`✅ ${player.name} URL atualizada diretamente`);

    } catch (error) {
      logger.error('Erro ao atualizar URL:', error);
      toast.error(error instanceof Error ? error.message : 'Erro ao atualizar');
    } finally {
      setUploadingPlayerId(null);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            Jogadores com Imagens Problemáticas
          </CardTitle>
          <CardDescription>
            Upload manual de imagens ou forneça URLs alternativas para jogadores com imagens quebradas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4">
            <Button 
              onClick={loadProblematicPlayers} 
              disabled={isLoading}
              variant="outline"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Atualizar Lista
            </Button>
            <Badge variant="secondary" className="self-center">
              {players.length} jogador{players.length !== 1 ? 'es' : ''} com problema
            </Badge>
          </div>

          {players.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Check className="w-12 h-12 mx-auto mb-2 text-green-500" />
              <p>Nenhum jogador com imagem problemática!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {players.map(player => (
                <Card key={player.id} className="bg-muted/50">
                  <CardContent className="pt-4">
                    <div className="flex flex-col md:flex-row gap-4">
                      {/* Player Info */}
                      <div className="flex items-center gap-3 min-w-[200px]">
                        <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center overflow-hidden">
                          <img 
                            src={player.image_url} 
                            alt={player.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                              (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                            }}
                          />
                          <ImageIcon className="w-8 h-8 text-muted-foreground hidden" />
                        </div>
                        <div>
                          <p className="font-medium">{player.name}</p>
                          <Badge variant="outline" className="text-xs text-red-600">
                            {player.domain}
                          </Badge>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex-1 space-y-3">
                        {/* File Upload */}
                        <div>
                          <Label className="text-sm font-medium mb-1 block">
                            Upload de Arquivo
                          </Label>
                          <div className="flex gap-2">
                            <Input
                              type="file"
                              accept="image/*"
                              disabled={uploadingPlayerId === player.id}
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleFileUpload(player.id, file);
                              }}
                              className="flex-1"
                            />
                          </div>
                        </div>

                        {/* Alternative URL */}
                        <div>
                          <Label className="text-sm font-medium mb-1 block">
                            URL Alternativa
                          </Label>
                          <div className="flex gap-2">
                            <Input
                              type="url"
                              placeholder="https://exemplo.com/imagem.jpg"
                              value={alternativeUrls[player.id] || ''}
                              onChange={(e) => setAlternativeUrls(prev => ({
                                ...prev,
                                [player.id]: e.target.value
                              }))}
                              disabled={uploadingPlayerId === player.id}
                              className="flex-1"
                            />
                            <Button
                              size="sm"
                              onClick={() => handleUrlUpdate(player.id)}
                              disabled={uploadingPlayerId === player.id || !alternativeUrls[player.id]}
                              title="Migrar para storage local"
                            >
                              <Upload className="w-4 h-4 mr-1" />
                              Migrar
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDirectUrlUpdate(player.id)}
                              disabled={uploadingPlayerId === player.id || !alternativeUrls[player.id]}
                              title="Usar URL diretamente (sem migrar)"
                            >
                              <Link className="w-4 h-4 mr-1" />
                              Usar URL
                            </Button>
                          </div>
                        </div>

                        {/* Current URL */}
                        <div className="text-xs text-muted-foreground truncate">
                          <span className="font-medium">URL atual:</span> {player.image_url}
                        </div>
                      </div>

                      {/* Loading indicator */}
                      {uploadingPlayerId === player.id && (
                        <div className="flex items-center justify-center">
                          <RefreshCw className="w-6 h-6 animate-spin text-primary" />
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
