import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.loop.app',
  appName: 'Loop',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
