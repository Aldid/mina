import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.mina.skincare',
  appName: 'Mina',
  webDir: 'dist-ios',
  loggingBehavior: 'none',
  ios: { contentInset: 'never', backgroundColor: '#faf9f7' },
  server: { hostname: 'localhost' },
};

export default config;
