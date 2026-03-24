import React from 'react';
import { Heart, Smartphone, Gift } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { SEOManager } from '@/components/seo/SEOManager';

const Donations = () => {
  const donationValues = [
    { amount: 1, icon: '☕', label: 'Um cafézinho', description: 'Ajuda básica' },
    { amount: 5, icon: '🍕', label: 'Uma fatia de pizza', description: 'Apoio simples' },
    { amount: 10, icon: '❤️', label: 'Apoia os servidores', description: 'Suporte essencial' },
    { amount: 25, icon: '⚡', label: 'Auxilia novas funções', description: 'Desenvolvimento' },
    { amount: 50, icon: '🚀', label: 'Contribui para o desenvolvimento', description: 'Crescimento' }
  ];

  const pixKey = "a772f096-c75d-4c0f-a4fe-2ae2e7884649";

  const copyPixKey = () => {
    navigator.clipboard.writeText(pixKey);
  };

  return (
    <div className="min-h-screen page-warm bg-tricolor-vertical-border">
      <SEOManager 
        title="Doações - Lendas do Flu"
        description="Apoie o desenvolvimento do Lendas do Flu e ajude a manter o jogo funcionando"
        canonical="https://lendasdoflu.com/doacoes"
      />
      
      <div className="container mx-auto px-4 py-8 pt-24 safe-area-top safe-area-bottom">
        <div className="max-w-2xl mx-auto space-y-8">
          
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center space-x-3 mb-6">
              <img 
                src="/lovable-uploads/6b2888cd-7dd2-4048-b4ca-c9636e93d4a6.webp" 
                alt="Lendas do Flu Logo" 
                className="w-16 h-16 object-contain"
              />
              <h1 className="font-display text-display-hero text-primary">
                LENDAS DO FLU
              </h1>
            </div>
            
            <h2 className="font-display text-display-title text-primary mb-4">
              Apoie o Lendas do Flu
            </h2>
            
            <p className="font-body text-xl text-muted-foreground mb-6">
              Ajude a melhorar e manter o jogo
            </p>
            
            <p className="font-body text-muted-foreground leading-relaxed">
              Seu apoio é essencial para cobrir custos com servidores, 
              desenvolver novos recursos e continuar trazendo melhorias ao 
              quiz. Contribua para o crescimento do Lendas do Flu!
            </p>
          </div>

          {/* PIX Section */}
          <Card className="text-center border-gold/30 shadow-md">
            <CardContent className="p-8">
              <div className="space-y-6">
                <div className="flex items-center justify-center space-x-4 mb-6">
                  <Smartphone className="h-8 w-8 text-secondary" />
                  <h3 className="font-display text-display-subtitle text-primary">Use o PIX para doar</h3>
                </div>
                
                {/* QR Code */}
                <div className="bg-card rounded-lg p-6 max-w-xs mx-auto border border-border">
                  <img 
                    src="/lovable-uploads/7df50b87-e220-4f5e-be35-e5f61cb46d2f.png"
                    alt="PIX QR Code para doações"
                    className="w-48 h-48 object-contain mx-auto mb-4"
                  />
                  <p className="text-sm text-muted-foreground font-medium font-body">PIX QR Code</p>
                </div>
                
                <div className="space-y-2">
                  <p className="text-muted-foreground font-body">Escaneie o código para fazer uma doação</p>
                  <p className="text-foreground font-semibold font-body">Qualquer quantia é bem-vinda</p>
                </div>
                
                <Button 
                  onClick={copyPixKey}
                  variant="outline"
                  className="mt-4 touch-target font-body border-primary/30 text-primary hover:bg-primary/5"
                >
                  Copiar Chave PIX: {pixKey}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Donation Values */}
          <Card className="border-border shadow-sm">
            <CardHeader>
              <h3 className="font-display text-display-subtitle text-primary text-center flex items-center justify-center gap-2">
                <Gift className="h-6 w-6 text-gold" />
                Valores de doação
              </h3>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {donationValues.map((donation) => (
                  <div 
                    key={donation.amount}
                    className="bg-card rounded-lg p-6 text-center border border-border shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="text-4xl mb-3">{donation.icon}</div>
                    <div className="text-3xl font-display text-primary mb-2">
                      R$ {donation.amount}
                    </div>
                    <div className="text-base text-foreground font-medium mb-1 font-body">
                      {donation.label}
                    </div>
                    <div className="text-sm text-muted-foreground font-body">
                      {donation.description}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Thank You Section */}
          <Card className="border-border shadow-sm">
            <CardContent className="p-8 text-center">
              <h3 className="font-display text-display-subtitle text-primary mb-4 flex items-center justify-center gap-2">
                <Heart className="h-6 w-6 text-destructive" />
                Agradecemos muito pelo seu apoio!
              </h3>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
};

export default Donations;
