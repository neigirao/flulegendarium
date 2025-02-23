
import { useState } from "react";
import { motion } from "framer-motion";
import { Trophy, Users, PlayCircle } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-flu-verde to-white">
      <div className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-6xl font-bold text-flu-grena mb-4">
            Fluminense Legends
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Monte o time dos sonhos e teste seus conhecimentos sobre a história do Tricolor
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="glass rounded-lg p-6 card-hover"
          >
            <Trophy className="w-12 h-12 text-flu-grena mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Monte seu Time</h3>
            <p className="text-gray-600">
              Crie o time dos sonhos com as maiores lendas do Fluminense
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="glass rounded-lg p-6 card-hover"
          >
            <PlayCircle className="w-12 h-12 text-flu-grena mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Adivinhe o Jogador</h3>
            <p className="text-gray-600">
              Teste seus conhecimentos em um jogo desafiador
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="glass rounded-lg p-6 card-hover"
          >
            <Users className="w-12 h-12 text-flu-grena mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Compare Jogadores</h3>
            <p className="text-gray-600">
              Analise estatísticas e compare os craques do Tricolor
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Index;
