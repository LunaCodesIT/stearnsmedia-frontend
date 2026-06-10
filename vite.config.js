import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
  assetsInclude: ['**/*.glb', '**/*.gltf'],
  server: {
    port: 5173,
    // Same-origin proxy for the WP REST API — the live site sends no
    // Access-Control-Allow-Origin header, so direct browser fetches are
    // CORS-blocked. The ?rest_route= form is used instead of /wp-json because
    // the host intermittently 404s the pretty permalink route. In production
    // vercel.json rewrites /wp-api/* the same way.
    proxy: {
      '/wp-api': {
        target: 'https://stearnsmedia.com',
        changeOrigin: true,
        rewrite: (path) => {
          const stripped = path.replace(/^\/wp-api/, '');
          const [route, query] = stripped.split('?');
          return `/index.php?rest_route=${route}${query ? `&${query}` : ''}`;
        },
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          three: ['three', '@react-three/fiber', '@react-three/drei'],
          gsap: ['gsap', '@gsap/react'],
          vendor: ['react', 'react-dom'],
        },
      },
    },
    chunkSizeWarningLimit: 600,
  },
});
