import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'node:path';
import { sentryVitePlugin } from '@sentry/vite-plugin';

const hasSentryAuth = Boolean(process.env.SENTRY_AUTH_TOKEN && process.env.SENTRY_ORG && process.env.SENTRY_PROJECT);

export default defineConfig({
  build: {
    sourcemap: 'hidden',
    cssMinify: false,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react-router')) return 'vendor-router';
            if (id.includes('motion')) return 'animation';
            if (id.includes('@radix-ui')) return 'ui';
            if (id.includes('@sentry')) return 'sentry';
            return 'vendor';
          }
          if (id.includes('/src/core/')) return 'core';
          if (id.includes('/src/components/')) return 'components';
          if (id.includes('/src/layouts/')) return 'layouts';
          if (id.includes('/src/features/')) return 'features';
          if (id.includes('/src/animations/')) return 'animations';
        },
      },
    },
  },
  plugins: [
    {
      name: 'debug-config',
      configResolved(config) {
        console.log('RESOLVED cssMinify:', config.build.cssMinify);
        console.log('RESOLVED minify:', config.build.minify);
      }
    },
    tailwindcss(),
    react(),
    hasSentryAuth
      ? sentryVitePlugin({
          org: process.env.SENTRY_ORG,
          project: process.env.SENTRY_PROJECT,
          authToken: process.env.SENTRY_AUTH_TOKEN,
        })
      : null,
  ].filter(Boolean),
  resolve: {
    alias: {
      '@': path.resolve(process.cwd(), 'src'),
      '@components': path.resolve(process.cwd(), 'src/components'),
      '@lib': path.resolve(process.cwd(), 'src/lib'),
    },
  },
  server: {
    port: 5173,
    host: '0.0.0.0',
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['src/**/*.test.{ts,tsx}'],
    exclude: ['e2e', 'node_modules'],
  },
});
