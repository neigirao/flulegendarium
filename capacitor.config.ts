import type { CapacitorConfig } from '@capacitor/cli';

// App identifier approved by Nei for Lendas do Flu on September 25, 2026.
// Changing it after store publication would create a different app.
const config: CapacitorConfig = {
  appId: 'com.neigirao.lendasdoflu',
  appName: 'Lendas do Flu',
  webDir: 'dist',
};

export default config;
