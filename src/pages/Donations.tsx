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

  const pixKey = "lendas.do.flu@pix.com"; // Substitua pela chave PIX real

  const copyPixKey = () => {
    navigator.clipboard.writeText(pixKey);
    // Você pode adicionar um toast aqui se quiser
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-flu-grena via-red-800 to-flu-verde">
      <SEOHead 
        title="Doações - Lendas do Flu"
        description="Apoie o desenvolvimento do Lendas do Flu e ajude a manter o jogo funcionando"
        canonical="/doacoes"
      />
      
      <div className="container mx-auto px-4 py-8 pt-24">
        <div className="max-w-2xl mx-auto space-y-8">
          
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center space-x-3 mb-6">
              <img 
                src="/lovable-uploads/6b2888cd-7dd2-4048-b4ca-c9636e93d4a6.png" 
                alt="Lendas do Flu Logo" 
                className="w-16 h-16 object-contain"
              />
              <h1 className="text-4xl md:text-5xl font-bold text-white">
                LENDAS DO FLU
              </h1>
            </div>
            
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Apoie o Lendas do Flu
            </h2>
            
            <p className="text-xl text-white/90 mb-6">
              Ajude a melhorar e manter o jogo
            </p>
            
            <p className="text-white/80 leading-relaxed">
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
                  <Smartphone className="h-8 w-8 text-flu-verde" />
                  <h3 className="text-2xl font-bold text-white">Use o PIX para doar</h3>
                </div>
                
                {/* QR Code Placeholder */}
                <div className="bg-white rounded-lg p-6 max-w-xs mx-auto">
                  <div className="w-48 h-48 bg-gray-200 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <div className="text-center text-gray-500">
                      <div className="text-4xl mb-2">📱</div>
                      <div className="text-sm font-medium">PIX QR Code</div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 font-medium">PIX QR Code</p>
                </div>
                
                <div className="space-y-2">
                  <p className="text-white/90">Escaneie o código para fazer uma doação</p>
                  <p className="text-white/90 font-semibold">Qualquer quantia é bem-vinda</p>
                </div>
                
                <Button 
                  onClick={copyPixKey}
                  variant="secondary"
                  className="mt-4"
                >
                  Copiar Chave PIX: {pixKey}
                </Button>
              </div>
            </FluCardContent>
          </FluCard>

          {/* Donation Values */}
          <FluCard variant="glass">
            <FluCardHeader>
              <h3 className="text-2xl font-bold text-white text-center flex items-center justify-center gap-2">
                <Gift className="h-6 w-6 text-flu-verde" />
                Valores de doação
              </h3>
            </FluCardHeader>
            <FluCardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {donationValues.map((donation) => (
                  <div 
                    key={donation.amount}
                    className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center hover:bg-white/20 transition-colors cursor-pointer"
                  >
                    <div className="text-3xl mb-2">{donation.icon}</div>
                    <div className="text-2xl font-bold text-white mb-1">
                      R$ {donation.amount}
                    </div>
                    <div className="text-sm text-white/90 font-medium mb-1">
                      {donation.label}
                    </div>
                    <div className="text-xs text-white/70">
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
              <h3 className="text-2xl font-bold text-white mb-6 flex items-center justify-center gap-2">
                <Heart className="h-6 w-6 text-red-400" />
                Agradecemos muito pelo seu apoio!
              </h3>
              
              <div className="space-y-4">
                <h4 className="text-xl font-semibold text-white flex items-center justify-center gap-2">
                  <Users className="h-5 w-5 text-flu-verde" />
                  Apoiadores recentes
                </h4>
                
                <div className="space-y-2">
                  {recentSupporters.map((supporter, index) => (
                    <div key={index} className="flex justify-between items-center bg-white/10 rounded-lg px-4 py-2">
                      <span className="text-white font-medium">{supporter.name}</span>
                      <span className="text-flu-verde font-bold">R$ {supporter.amount}</span>
                    </div>
                  ))}
                </div>
              </div>
            </FluCardContent>
          </FluCard>

        </div>
      </div>
    </div>
  );
};

export default Donations;