import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Wifi, WifiOff, Download, RefreshCw } from 'lucide-react';
import { usePWA } from './PWAProvider';
import { useToast } from '@/hooks/use-toast';

export const PWAStatusIndicator = () => {
  const { isOnline, isInstalled, updateAvailable, reloadApp } = usePWA();
  const { toast } = useToast();

  const handleUpdate = () => {
    toast({
      title: "Atualizando app...",
      description: "A nova versão será aplicada em instantes.",
    });
    
    setTimeout(() => {
      reloadApp();
    }, 1000);
  };

  return (
    <div className="fixed top-4 right-4 z-40 flex flex-col gap-2">
      {/* Status de Conexão */}
      <Badge 
        variant={isOnline ? "default" : "destructive"}
        className="flex items-center gap-1 animate-fadeIn"
      >
        {isOnline ? (
          <>
            <Wifi className="w-3 h-3" />
            Online
          </>
        ) : (
          <>
            <WifiOff className="w-3 h-3" />
            Offline
          </>
        )}
      </Badge>

      {/* Status de Instalação */}
      {isInstalled && (
        <Badge variant="secondary" className="flex items-center gap-1 animate-fadeIn">
          <Download className="w-3 h-3" />
          App Instalado
        </Badge>
      )}

      {/* Botão de Atualização */}
      {updateAvailable && (
        <Button
          size="sm"
          onClick={handleUpdate}
          className="animate-bounce-gentle bg-gradient-to-r from-primary to-secondary"
        >
          <RefreshCw className="w-3 h-3 mr-1" />
          Atualizar
        </Button>
      )}
    </div>
  );
};