import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader, AlertTriangle, CheckCircle, Download, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { logger } from '@/utils/logger';
import { 
  isProblematicDomain, 
  getProblematicUrlsStats,
  clearProblematicUrlsCache 
} from '@/utils/player-image/problematicUrls';

interface PlayerImageAudit {
  id: string;
  name: string;
  image_url: string;
  is_external: boolean;
  is_problematic: boolean;
  domain: string;
  needs_migration: boolean;
}

export const ImageAuditDashboard = () => {
  const [auditResults, setAuditResults] = useState<PlayerImageAudit[]>([]);
  const [isAuditing, setIsAuditing] = useState(false);
  const [isMigrating, setIsMigrating] = useState(false);
  const [selectedPlayers, setSelectedPlayers] = useState<Set<string>>(new Set());
  const [cacheStats, setCacheStats] = useState<{ total: number; urls: string[] }>({ total: 0, urls: [] });

  useEffect(() => {
    setCacheStats(getProblematicUrlsStats());
  }, []);

  const auditDatabase = async () => {
    setIsAuditing(true);
    try {
      logger.info('🔍 Iniciando auditoria de imagens no banco de dados...');
      
      const { data: players, error } = await supabase
        .from('players')
        .select('id, name, image_url')
        .order('name');

      if (error) throw error;

      const results: PlayerImageAudit[] = players.map(player => {
        const isExternal = player.image_url.startsWith('http://') || 
                          player.image_url.startsWith('https://');
        let domain = '';
        let isProblematic = false;

        if (isExternal) {
          try {
            const url = new URL(player.image_url);
            domain = url.hostname;
            isProblematic = isProblematicDomain(player.image_url);
          } catch {
            domain = 'URL inválida';
            isProblematic = true;
          }
        }

        return {
          id: player.id,
          name: player.name,
          image_url: player.image_url,
          is_external: isExternal,
          is_problematic: isProblematic,
          domain,
          needs_migration: isExternal && (isProblematic || domain.includes('globo') || domain.includes('uol')),
        };
      });

      setAuditResults(results);
      
      const problematicCount = results.filter(r => r.needs_migration).length;
      logger.info(`✅ Auditoria concluída: ${problematicCount} jogadores precisam de migração`);
      
      toast.success(`Auditoria concluída: ${problematicCount} imagens precisam de migração`);
    } catch (error) {
      logger.error('❌ Erro na auditoria:', error);
      toast.error('Erro ao auditar banco de dados');
    } finally {
      setIsAuditing(false);
    }
  };

  const togglePlayerSelection = (playerId: string) => {
    setSelectedPlayers(prev => {
      const newSet = new Set(prev);
      if (newSet.has(playerId)) {
        newSet.delete(playerId);
      } else {
        newSet.add(playerId);
      }
      return newSet;
    });
  };

  const selectAllProblematic = () => {
    const problematicIds = auditResults
      .filter(r => r.needs_migration)
      .map(r => r.id);
    setSelectedPlayers(new Set(problematicIds));
  };

  const migrateSelectedImages = async () => {
    if (selectedPlayers.size === 0) {
      toast.error('Selecione pelo menos um jogador para migrar');
      return;
    }

    setIsMigrating(true);
    let successCount = 0;
    let errorCount = 0;

    try {
      logger.info(`🚀 Iniciando migração de ${selectedPlayers.size} imagens...`);

      for (const playerId of selectedPlayers) {
        const player = auditResults.find(p => p.id === playerId);
        if (!player) continue;

        try {
          // Download da imagem externa
          logger.info(`📥 Baixando imagem de ${player.name}...`);
          const response = await fetch(player.image_url);
          
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
          }

          const blob = await response.blob();
          const fileExt = player.image_url.split('.').pop()?.split('?')[0] || 'jpg';
          const fileName = `${player.id}.${fileExt}`;

          // Upload para Supabase Storage
          logger.info(`📤 Fazendo upload para Storage: ${fileName}`);
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('players')
            .upload(fileName, blob, {
              contentType: blob.type,
              upsert: true,
            });

          if (uploadError) throw uploadError;

          // Obter URL pública
          const { data: { publicUrl } } = supabase.storage
            .from('players')
            .getPublicUrl(fileName);

          // Atualizar banco de dados
          logger.info(`💾 Atualizando banco de dados para ${player.name}...`);
          const { error: updateError } = await supabase
            .from('players')
            .update({ 
              image_url: publicUrl,
            })
            .eq('id', playerId);

          if (updateError) throw updateError;

          logger.info(`✅ Migração concluída para ${player.name}`);
          successCount++;
          
          // Atualizar UI
          setAuditResults(prev => 
            prev.map(p => 
              p.id === playerId 
                ? { ...p, image_url: publicUrl, is_external: false, needs_migration: false }
                : p
            )
          );
        } catch (error) {
          logger.error(`❌ Erro ao migrar ${player.name}:`, error);
          errorCount++;
        }
      }

      toast.success(`Migração concluída: ${successCount} sucesso, ${errorCount} erros`);
      setSelectedPlayers(new Set());
    } catch (error) {
      logger.error('❌ Erro geral na migração:', error);
      toast.error('Erro ao migrar imagens');
    } finally {
      setIsMigrating(false);
    }
  };

  const clearCache = () => {
    clearProblematicUrlsCache();
    setCacheStats(getProblematicUrlsStats());
    toast.success('Cache de URLs problemáticas limpo');
  };

  const stats = {
    total: auditResults.length,
    external: auditResults.filter(r => r.is_external).length,
    problematic: auditResults.filter(r => r.needs_migration).length,
    local: auditResults.filter(r => !r.is_external).length,
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Auditoria de Imagens de Jogadores
          </CardTitle>
          <CardDescription>
            Identifique e migre imagens externas problemáticas para o storage local
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button 
              onClick={auditDatabase} 
              disabled={isAuditing || isMigrating}
            >
              {isAuditing ? (
                <>
                  <Loader className="w-4 h-4 mr-2 animate-spin" />
                  Auditando...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Iniciar Auditoria
                </>
              )}
            </Button>

            {auditResults.length > 0 && (
              <>
                <Button 
                  variant="outline" 
                  onClick={selectAllProblematic}
                  disabled={isMigrating}
                >
                  Selecionar Problemáticas
                </Button>
                <Button 
                  variant="default"
                  onClick={migrateSelectedImages}
                  disabled={selectedPlayers.size === 0 || isMigrating}
                >
                  {isMigrating ? (
                    <>
                      <Loader className="w-4 h-4 mr-2 animate-spin" />
                      Migrando {selectedPlayers.size}...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Migrar Selecionadas ({selectedPlayers.size})
                    </>
                  )}
                </Button>
              </>
            )}

            <Button 
              variant="outline" 
              onClick={clearCache}
              disabled={cacheStats.total === 0}
            >
              Limpar Cache ({cacheStats.total})
            </Button>
          </div>

          {auditResults.length > 0 && (
            <div className="grid grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold">{stats.total}</div>
                  <p className="text-sm text-muted-foreground">Total de Jogadores</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-blue-600">{stats.external}</div>
                  <p className="text-sm text-muted-foreground">URLs Externas</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-red-600">{stats.problematic}</div>
                  <p className="text-sm text-muted-foreground">Precisam Migração</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-green-600">{stats.local}</div>
                  <p className="text-sm text-muted-foreground">Locais (OK)</p>
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>

      {auditResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Resultados da Auditoria</CardTitle>
            <CardDescription>
              Clique em um jogador para selecioná-lo para migração
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {auditResults.map(player => (
                <div
                  key={player.id}
                  onClick={() => player.needs_migration && togglePlayerSelection(player.id)}
                  className={`flex items-center justify-between p-3 border rounded-lg transition-colors ${
                    player.needs_migration 
                      ? 'cursor-pointer hover:bg-accent' 
                      : 'opacity-50'
                  } ${
                    selectedPlayers.has(player.id) 
                      ? 'bg-accent border-primary' 
                      : ''
                  }`}
                >
                  <div className="flex items-center gap-3 flex-1">
                    <input
                      type="checkbox"
                      checked={selectedPlayers.has(player.id)}
                      onChange={() => {}}
                      disabled={!player.needs_migration}
                      className="w-4 h-4"
                    />
                    <div className="flex-1">
                      <div className="font-medium">{player.name}</div>
                      <div className="text-sm text-muted-foreground truncate max-w-md">
                        {player.image_url}
                      </div>
                      {player.domain && (
                        <div className="text-xs text-muted-foreground mt-1">
                          Domínio: {player.domain}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {player.is_external ? (
                      <Badge variant="outline" className="text-blue-600">
                        Externa
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-green-600">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Local
                      </Badge>
                    )}
                    {player.needs_migration && (
                      <Badge variant="destructive">
                        <AlertTriangle className="w-3 h-3 mr-1" />
                        Migrar
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
