import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Loader, AlertTriangle, CheckCircle, Download, Upload, RefreshCw } from 'lucide-react';
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
  migration_status?: 'pending' | 'processing' | 'success' | 'error';
  migration_error?: string;
}

interface MigrationProgress {
  total: number;
  processed: number;
  succeeded: number;
  failed: number;
  current?: string;
}

export const ImageAuditDashboard = () => {
  const [auditResults, setAuditResults] = useState<PlayerImageAudit[]>([]);
  const [isAuditing, setIsAuditing] = useState(false);
  const [isMigrating, setIsMigrating] = useState(false);
  const [selectedPlayers, setSelectedPlayers] = useState<Set<string>>(new Set());
  const [cacheStats, setCacheStats] = useState<{ total: number; urls: string[] }>({ total: 0, urls: [] });
  const [migrationProgress, setMigrationProgress] = useState<MigrationProgress | null>(null);
  const [failedMigrations, setFailedMigrations] = useState<Set<string>>(new Set());

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
          migration_status: 'pending',
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

  const migrateSinglePlayer = async (player: PlayerImageAudit): Promise<boolean> => {
    try {
      logger.info(`🔄 Migrando ${player.name} via Edge Function...`);

      // Atualizar status para "processando"
      setAuditResults(prev => 
        prev.map(p => 
          p.id === player.id 
            ? { ...p, migration_status: 'processing' }
            : p
        )
      );

      // Chamar Edge Function
      const { data, error } = await supabase.functions.invoke('migrate-player-image', {
        body: {
          playerId: player.id,
          playerName: player.name,
          currentUrl: player.image_url,
        },
      });

      if (error) throw error;

      if (!data.success) {
        throw new Error(data.error || 'Erro desconhecido na migração');
      }

      // Atualizar UI com sucesso
      setAuditResults(prev => 
        prev.map(p => 
          p.id === player.id 
            ? { 
                ...p, 
                image_url: data.newUrl, 
                is_external: false, 
                needs_migration: false,
                migration_status: 'success',
              }
            : p
        )
      );

      logger.info(`✅ ${player.name} migrado com sucesso`);
      return true;

    } catch (error) {
      logger.error(`❌ Erro ao migrar ${player.name}:`, error);
      
      // Atualizar UI com erro
      setAuditResults(prev => 
        prev.map(p => 
          p.id === player.id 
            ? { 
                ...p, 
                migration_status: 'error',
                migration_error: error instanceof Error ? error.message : 'Erro desconhecido',
              }
            : p
        )
      );

      setFailedMigrations(prev => new Set([...prev, player.id]));
      return false;
    }
  };

  const migrateSelectedImages = async () => {
    if (selectedPlayers.size === 0) {
      toast.error('Selecione pelo menos um jogador para migrar');
      return;
    }

    setIsMigrating(true);
    setFailedMigrations(new Set());
    
    const playersToMigrate = auditResults.filter(p => selectedPlayers.has(p.id));
    const total = playersToMigrate.length;
    const BATCH_SIZE = 5;
    const DELAY_BETWEEN_BATCHES = 2000; // 2 segundos

    setMigrationProgress({
      total,
      processed: 0,
      succeeded: 0,
      failed: 0,
    });

    try {
      logger.info(`🚀 Iniciando migração de ${total} imagens em lotes de ${BATCH_SIZE}...`);

      // Processar em lotes
      for (let i = 0; i < playersToMigrate.length; i += BATCH_SIZE) {
        const batch = playersToMigrate.slice(i, i + BATCH_SIZE);
        logger.info(`📦 Processando lote ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(total / BATCH_SIZE)}`);

        // Processar batch em paralelo
        const batchResults = await Promise.all(
          batch.map(async (player) => {
            setMigrationProgress(prev => prev ? { ...prev, current: player.name } : null);
            const success = await migrateSinglePlayer(player);
            
            setMigrationProgress(prev => prev ? {
              ...prev,
              processed: prev.processed + 1,
              succeeded: prev.succeeded + (success ? 1 : 0),
              failed: prev.failed + (success ? 0 : 1),
            } : null);

            return success;
          })
        );

        // Aguardar entre lotes (exceto no último)
        if (i + BATCH_SIZE < playersToMigrate.length) {
          logger.info(`⏳ Aguardando ${DELAY_BETWEEN_BATCHES / 1000}s antes do próximo lote...`);
          await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_BATCHES));
        }
      }

      const succeeded = migrationProgress?.succeeded || 0;
      const failed = migrationProgress?.failed || 0;

      toast.success(`Migração concluída: ${succeeded} sucesso, ${failed} erros`);
      
      if (failed === 0) {
        setSelectedPlayers(new Set());
      }
      
    } catch (error) {
      logger.error('❌ Erro geral na migração:', error);
      toast.error('Erro ao migrar imagens');
    } finally {
      setIsMigrating(false);
      setMigrationProgress(null);
    }
  };

  const retryFailedMigrations = async () => {
    const failedPlayersList = auditResults.filter(p => failedMigrations.has(p.id));
    setSelectedPlayers(new Set(failedPlayersList.map(p => p.id)));
    await migrateSelectedImages();
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
          <div className="flex gap-2 flex-wrap">
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
                      Migrando...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Migrar Selecionadas ({selectedPlayers.size})
                    </>
                  )}
                </Button>
                
                {failedMigrations.size > 0 && !isMigrating && (
                  <Button 
                    variant="destructive"
                    onClick={retryFailedMigrations}
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Tentar Novamente ({failedMigrations.size})
                  </Button>
                )}
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

          {/* Barra de Progresso */}
          {migrationProgress && (
            <Card className="bg-muted">
              <CardContent className="pt-6 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">
                    Progresso: {migrationProgress.processed}/{migrationProgress.total}
                  </span>
                  <span className="text-muted-foreground">
                    ✅ {migrationProgress.succeeded} | ❌ {migrationProgress.failed}
                  </span>
                </div>
                <Progress 
                  value={(migrationProgress.processed / migrationProgress.total) * 100} 
                  className="h-2"
                />
                {migrationProgress.current && (
                  <p className="text-sm text-muted-foreground">
                    Processando: <span className="font-medium">{migrationProgress.current}</span>
                  </p>
                )}
              </CardContent>
            </Card>
          )}

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
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{player.name}</span>
                        {player.migration_status === 'processing' && (
                          <Loader className="w-4 h-4 animate-spin text-blue-600" />
                        )}
                        {player.migration_status === 'success' && (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        )}
                        {player.migration_status === 'error' && (
                          <AlertTriangle className="w-4 h-4 text-red-600" />
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground truncate max-w-md">
                        {player.image_url}
                      </div>
                      {player.domain && (
                        <div className="text-xs text-muted-foreground mt-1">
                          Domínio: {player.domain}
                        </div>
                      )}
                      {player.migration_error && (
                        <div className="text-xs text-red-600 mt-1">
                          Erro: {player.migration_error}
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
