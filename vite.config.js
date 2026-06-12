import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icons/icon-192.png', 'icons/icon-512.png'],
      manifest: {
        name: 'FD Web SDK',
        short_name: 'FD SDK',
        description: 'FD Web SDK embedded viewer',
        theme_color: '#16A34A',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/iframe-viewer/',
        start_url: '/iframe-viewer/',
        icons: [
          {
            src: 'icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fd-web-nine\.vercel\.app\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'fd-sdk-content',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 },
            },
          },
        ],
      },
    }),
  ],
  base: '/iframe-viewer/',
})
