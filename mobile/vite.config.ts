import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: { alias: { '@': '/src' } },
  // IMPORTANT for Cordova/Android:
  // - App runs from file://android_asset/www/index.html
  // - Setting base to './' makes asset URLs relative (./assets/...)
  //   so they resolve correctly inside the APK instead of /assets/... (which would be broken).
  base: './',
  build: {
    outDir: 'www',
    emptyOutDir: true,
  },
});
