import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.example.ankiblog',
  appName: 'AnkiBlog',
  webDir: 'dist',
  server: {
    url: undefined, // 确保没有覆盖
    cleartext: true,  
    allowNavigation: ["*"]
  }
};

export default config;