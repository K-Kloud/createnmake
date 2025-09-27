import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.f1ed40793ff64e5aa5136277112295ba',
  appName: 'openteknologies',
  webDir: 'dist',
  server: {
    url: 'https://f1ed4079-3ff6-4e5a-a513-6277112295ba.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"]
    }
  }
};

export default config;