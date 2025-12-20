import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Loader, AlertTriangle, CheckCircle, Download, Upload, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { logger } from '@/utils/logger';

interface JerseyImageAudit {
  id: string;
  years: number[];
  image_url: string;
  type: string;
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

// List of problematic domains for jerseys
const PROBLEMATIC_DOMAINS = [
  'globo.com', 'globoesporte.globo.com', 'ge.globo.com',
  'uol.com.br', 'esporte.uol.com.br',
  'lance.com.br', 'placar.abril.com.br',
  'espn.com', 'espn.com.br',
  'instagram.com', 'fbcdn.net',
  'twitter.com', 'twimg.com',
  'facebook.com',
];

const isProblematicDomain = (url: string): boolean => {
  try {
    const hostname = new URL(url).hostname;
    return PROBLEMATIC_DOMAINS.some(domain => hostname.includes(domain));
  } catch {
    return true;
  }
};

export const JerseyImageAuditDashboard = () => {
  const [auditResults, setAuditResults] = useState<JerseyImageAudit[]>([]);
  const [isAuditing, setIsAuditing] = useState(false);
  const [isMigrating, setIsMigrating] = useState(false);
  const [selectedJerseys, setSelectedJerseys] = useState<Set<string>>(new Set());
  const [migrationProgress, setMigrationProgress] = useState<MigrationProgress | null>(null);
  const [failedMigrations, setFailedMigrations] = useState<Set<string>>(new Set());

  const auditDatabase = async () => {
    setIsAuditing(true);
    try {
      logger.info('🔍 Iniciando auditoria de imagens de camisas...');
      
      const { data: jerseys, error } = await supabase
        .from('jerseys')
        .select('id, years, image_url, type')
        .order('years');

      if (error) throw error;

      const results: JerseyImageAudit[] = jerseys.map(jersey => {
        const isExternal = jersey.image_url.startsWith('http://') || 
                          jersey.image_url.startsWith('https://');
        let domain = '';
        let isProblematic = false;

        if (isExternal) {
          try {
            const url = new URL(jersey.image_url);
            domain = url.hostname;
            isProblematic = isProblematicDomain(jersey.image_url);
          } catch {
            domain = 'URL inválida';
            isProblematic = true;
          }
        }

        return {
          id: jersey.id,
          years: jersey.years,
          image_url: jersey.image_url,
          type: jersey.type,
          is_external: isExternal,
          is_problematic: isProblematic,
          domain,
          needs_migration: isExternal && isProblematic,
          migration_status: 'pending',
        };
      });

      setAuditResults(results);
      
      const problematicCount = results.filter(r => r.needs_migration).length;
      logger.info(`✅ Auditoria concluída: ${problematicCount} camisas precisam de migração`);
      
      toast.success(`Auditoria concluída: ${problematicCount} imagens precisam de migração`);
    } catch (error) {
      logger.error('❌ Erro na auditoria:', error);
      toast.error('Erro ao auditar banco de dados');
    } finally {
      setIsAuditing(false);
    }
  };

  const toggleJerseySelection = (jerseyId: string) => {
    setSelectedJerseys(prev => {
      const newSet = new Set(prev);
      if (newSet.has(jerseyId)) {
        newSet.delete(jerseyId);
      } else {
        newSet.add(jerseyId);
      }
      return newSet;
    });
  };

  const selectAllProblematic = () => {
    const problematicIds = auditResults
      .filter(r => r.needs_migration)
      .map(r => r.id);
    setSelectedJerseys(new Set(problematicIds));
  };

  const migrateSingleJersey = async (jersey: JerseyImageAudit): Promise<boolean> => {
    try {
      logger.info(`🔄 Migrando camisa ${jersey.years.join('/')}...`);

      // Update status to processing
      setAuditResults(prev => 
        prev.map(j => 
          j.id === jersey.id 
            ? { ...j, migration_status: 'processing' }
            : j
        )
      );

      // Fetch image
      const response = await fetch(jersey.image_url);
      if (!response.ok) throw new Error(`Falha ao baixar imagem: ${response.status}`);
      
      const blob = await response.blob();
      const ext = jersey.image_url.split('.').pop()?.split('?')[0]?.toLowerCase() || 'jpg';
      const fileName = `jersey-${jersey.id}.${ext}`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from('jerseys')
        .upload(fileName, blob, { 
          contentType: blob.type || 'image/jpeg',
          upsert: true 
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('jerseys')
        .getPublicUrl(fileName);

      // Update database
      const { error: updateError } = await supabase
        .from('jerseys')
        .update({ image_url: publicUrl })
        .eq('id', jersey.id);

      if (updateError) throw updateError;

      // Update UI with success
      setAuditResults(prev => 
        prev.map(j => 
          j.id === jersey.id 
            ? { 
                ...j, 
                image_url: publicUrl, 
                is_external: false, 
                needs_migration: false,
                migration_status: 'success',
              }
            : j
        )
      );

      logger.info(`✅ Camisa ${jersey.years.join('/')} migrada com sucesso`);
      return true;

    } catch (error) {
      logger.error(`❌ Erro ao migrar camisa ${jersey.years.join('/')}:`, error);
      
      // Update UI with error
      setAuditResults(prev => 
        prev.map(j => 
          j.id === jersey.id 
            ? { 
                ...j, 
                migration_status: 'error',
                migration_error: error instanceof Error ? error.message : 'Erro desconhecido',
              }
            : j
        )
      );

      setFailedMigrations(prev => new Set([...prev, jersey.id]));
      return false;
    }
  };

  const migrateSelectedImages = async () => {
    if (selectedJerseys.size === 0) {
      toast.error('Selecione pelo menos uma camisa para migrar');
      return;
    }

    setIsMigrating(true);
    setFailedMigrations(new Set());
    
    const jerseysToMigrate = auditResults.filter(j => selectedJerseys.has(j.id));
    const total = jerseysToMigrate.length;
    const BATCH_SIZE = 5;
    const DELAY_BETWEEN_BATCHES = 2000;

    setMigrationProgress({
      total,
      processed: 0,
      succeeded: 0,
      failed: 0,
    });

    try {
      logger.info(`🚀 Iniciando migração de ${total} imagens em lotes de ${BATCH_SIZE}...`);

      for (let i = 0; i < jerseysToMigrate.length; i += BATCH_SIZE) {
        const batch = jerseysToMigrate.slice(i, i + BATCH_SIZE);
        logger.info(`📦 Processando lote ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(total / BATCH_SIZE)}`);

        const batchResults = await Promise.all(
          batch.map(async (jersey) => {
            setMigrationProgress(prev => prev ? { ...prev, current: jersey.years.join('/') } : null);
            const success = await migrateSingleJersey(jersey);
            
            setMigrationProgress(prev => prev ? {
              ...prev,
              processed: prev.processed + 1,
              succeeded: prev.succeeded + (success ? 1 : 0),
              failed: prev.failed + (success ? 0 : 1),
            } : null);

            return success;
          })
        );

        if (i + BATCH_SIZE < jerseysToMigrate.length) {
          await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_BATCHES));
        }
      }

      const succeeded = migrationProgress?.succeeded || 0;
      const failed = migrationProgress?.failed || 0;

      toast.success(`Migração concluída: ${succeeded} sucesso, ${failed} erros`);
      
      if (failed === 0) {
        setSelectedJerseys(new Set());
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
    const failedJerseysList = auditResults.filter(j => failedMigrations.has(j.id));
    setSelectedJerseys(new Set(failedJerseysList.map(j => j.id)));
    await migrateSelectedImages();
  };

  const handleManualUpload = async (jersey: JerseyImageAudit, file: File) => {
    try {
      const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const fileName = `jersey-${jersey.id}.${ext}`;
      
      const { error: uploadError } = await supabase.storage
        .from('jerseys')
        .upload(fileName, file, { contentType: file.type, upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('jerseys')
        .getPublicUrl(fileName);

      const { error: updateError } = await supabase
        .from('jerseys')
        .update({ image_url: publicUrl })
        .eq('id', jersey.id);

      if (updateError) throw updateError;

      setAuditResults(prev =>
        prev.map(j =>
          j.id === jersey.id
            ? {
                ...j,
                image_url: publicUrl,
                is_external: false,
                needs_migration: false,
                migration_status: 'success',
                migration_error: undefined,
              }
            : j
        )
      );

      setFailedMigrations(prev => {
        const newSet = new Set(prev);
        newSet.delete(jersey.id);
        return newSet;
      });

      toast.success(`Imagem da camisa ${jersey.years.join('/')} atualizada!`);
    } catch (error) {
      toast.error('Erro ao fazer upload manual');
      logger.error('Upload manual falhou:', error);
    }
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
            Auditoria de Imagens de Camisas
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
                  disabled={selectedJerseys.size === 0 || isMigrating}
                >
                  {isMigrating ? (
                    <>
                      <Loader className="w-4 h-4 mr-2 animate-spin" />
                      Migrando...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Migrar Selecionadas ({selectedJerseys.size})
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
          </div>

          {/* Progress Bar */}
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
                  <p className="text-sm text-muted-foreground">Total de Camisas</p>
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
              Clique em uma camisa para selecioná-la para migração
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {auditResults.map(jersey => (
                <div
                  key={jersey.id}
                  onClick={() => jersey.needs_migration && toggleJerseySelection(jersey.id)}
                  className={`flex items-center justify-between p-3 border rounded-lg transition-colors ${
                    jersey.needs_migration 
                      ? 'cursor-pointer hover:bg-accent' 
                      : 'opacity-50'
                  } ${
                    selectedJerseys.has(jersey.id) 
                      ? 'bg-accent border-primary' 
                      : ''
                  }`}
                >
                  <div className="flex items-center gap-3 flex-1">
                    <input
                      type="checkbox"
                      checked={selectedJerseys.has(jersey.id)}
                      onChange={() => {}}
                      disabled={!jersey.needs_migration}
                      className="w-4 h-4"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Camisa {jersey.years.join('/')}</span>
                        <Badge variant="secondary">{jersey.type}</Badge>
                        {jersey.migration_status === 'processing' && (
                          <Loader className="w-4 h-4 animate-spin text-blue-600" />
                        )}
                        {jersey.migration_status === 'success' && (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        )}
                        {jersey.migration_status === 'error' && (
                          <AlertTriangle className="w-4 h-4 text-red-600" />
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground truncate max-w-md">
                        {jersey.image_url}
                      </div>
                      {jersey.domain && (
                        <div className="text-xs text-muted-foreground mt-1">
                          Domínio: {jersey.domain}
                        </div>
                      )}
                      {jersey.migration_error && (
                        <div className="text-xs text-red-600 mt-1 flex items-center gap-2">
                          <span>Erro: {jersey.migration_error}</span>
                          <label className="cursor-pointer inline-flex items-center gap-1 text-primary hover:underline">
                            <Upload className="w-3 h-3" />
                            <span>Upload manual</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onClick={(e) => e.stopPropagation()}
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleManualUpload(jersey, file);
                              }}
                            />
                          </label>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {jersey.needs_migration ? (
                      <Badge variant="destructive">Migrar</Badge>
                    ) : jersey.is_external ? (
                      <Badge variant="secondary">Externa</Badge>
                    ) : (
                      <Badge variant="default" className="bg-green-600">Local</Badge>
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
