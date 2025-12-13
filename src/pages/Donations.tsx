import React from 'react';
import { Heart, Smartphone, Users, Gift } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FluCard, FluCardHeader, FluCardContent } from '@/components/ui/flu-card';
import { SEOHead } from '@/components/SEOHead';

const Donations = () => {
  const donationValues = [
    { amount: 1, icon: '☕', label: 'Um cafézinho', description: 'Ajuda básica' },
    { amount: 5, icon: '🍕', label: 'Uma fatia de pizza', description: 'Apoio simples' },
    { amount: 10, icon: '❤️', label: 'Apoia os servidores', description: 'Suporte essencial' },
    { amount: 25, icon: '⚡', label: 'Auxilia novas funções', description: 'Desenvolvimento' },
    { amount: 50, icon: '🚀', label: 'Contribui para o desenvolvimento', description: 'Crescimento' }
  ];

  const recentSupporters = [
    { name: 'Mia', amount: 25 },
    { name: 'Daniel', amount: 10 }
  ];

  const pixKey = "a772f096-c75d-4c0f-a4fe-2ae2e7884649";

  const copyPixKey = () => {
    navigator.clipboard.writeText(pixKey);
    // Você pode adicionar um toast aqui se quiser
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-primary/80 to-secondary bg-tricolor-vertical-border">
      <SEOHead 
        title="Doações - Lendas do Flu"
        description="Apoie o desenvolvimento do Lendas do Flu e ajude a manter o jogo funcionando"
        canonical="/doacoes"
      />
      
      <div className="container mx-auto px-4 py-8 pt-24 safe-area-top safe-area-bottom">
        <div className="max-w-2xl mx-auto space-y-8">
          
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center space-x-3 mb-6">
              <img 
                src="/lovable-uploads/6b2888cd-7dd2-4048-b4ca-c9636e93d4a6.png" 
                alt="Lendas do Flu Logo" 
                className="w-16 h-16 object-contain"
              />
              <h1 className="text-display-title text-primary-foreground">
                LENDAS DO FLU
              </h1>
            </div>
            
            <h2 className="text-display-subtitle text-primary-foreground mb-4">
              Apoie o Lendas do Flu
            </h2>
            
            <p className="text-xl text-primary-foreground/90 mb-6 font-body">
              Ajude a melhorar e manter o jogo
            </p>
            
            <p className="text-primary-foreground/80 leading-relaxed font-body">
              Seu apoio é essencial para cobrir custos com servidores, 
              desenvolver novos recursos e continuar trazendo melhorias ao 
              quiz. Contribua para o crescimento do Lendas do Flu!
            </p>
          </div>

          {/* PIX Section */}
          <FluCard variant="glass" className="text-center">
            <FluCardContent className="p-8">
              <div className="space-y-6">
                <div className="flex items-center justify-center space-x-4 mb-6">
                  <Smartphone className="h-8 w-8 text-secondary" />
                  <h3 className="text-display-sm text-primary-foreground">Use o PIX para doar</h3>
                </div>
                
                {/* QR Code */}
                <div className="bg-background rounded-lg p-6 max-w-xs mx-auto">
                  <img 
                    src="/lovable-uploads/7df50b87-e220-4f5e-be35-e5f61cb46d2f.png"
                    alt="PIX QR Code para doações"
                    className="w-48 h-48 object-contain mx-auto mb-4"
                  />
                  <p className="text-sm text-muted-foreground font-medium font-body">PIX QR Code</p>
                </div>
                
                <div className="space-y-2">
                  <p className="text-primary-foreground/90 font-body">Escaneie o código para fazer uma doação</p>
                  <p className="text-primary-foreground/90 font-semibold font-body">Qualquer quantia é bem-vinda</p>
                </div>
                
                <Button 
                  onClick={copyPixKey}
                  variant="secondary"
                  className="mt-4 touch-target font-body"
                >
                  Copiar Chave PIX: {pixKey}
                </Button>
              </div>
            </FluCardContent>
          </FluCard>

          {/* Donation Values */}
          <FluCard variant="glass">
            <FluCardHeader>
              <h3 className="text-display-sm text-primary-foreground text-center flex items-center justify-center gap-2">
                <Gift className="h-6 w-6 text-secondary" />
                Valores de doação
              </h3>
            </FluCardHeader>
            <FluCardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {donationValues.map((donation) => (
                  <div 
                    key={donation.amount}
                    className="bg-white/20 backdrop-blur-sm rounded-lg p-6 text-center border border-white/30"
                  >
                    <div className="text-4xl mb-3">{donation.icon}</div>
                    <div className="text-3xl font-display text-primary-foreground mb-2">
                      R$ {donation.amount}
                    </div>
                    <div className="text-base text-primary-foreground font-medium mb-1 font-body">
                      {donation.label}
                    </div>
                    <div className="text-sm text-primary-foreground/90 font-body">
                      {donation.description}
                    </div>
                  </div>
                ))}
              </div>
            </FluCardContent>
          </FluCard>

          {/* Thank You Section */}
          <FluCard variant="glass">
            <FluCardContent className="p-8 text-center">
              <h3 className="text-display-sm text-primary-foreground mb-4 flex items-center justify-center gap-2">
                <Heart className="h-6 w-6 text-destructive" />
                Agradecemos muito pelo seu apoio!
              </h3>
            </FluCardContent>
          </FluCard>

        </div>
      </div>
    </div>
  );
};

export default Donations;