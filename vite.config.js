import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    target: 'es2019',
    // three.js is deliberately split into an on-demand chunk (see below), so
    // its size doesn't affect first paint — no need for the default warning.
    chunkSizeWarningLimit: 900,
    // Split the heavy 3D libraries into their own chunk so the initial
    // page becomes interactive quickly and Three.js is lazy-loaded.
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined;
          // Keep only the React runtime eager (needed for first paint).
          if (
            /[\\/]node_modules[\\/](react|react-dom|scheduler|object-assign)[\\/]/.test(id)
          ) {
            return 'vendor';
          }
          // Everything else (three.js, @react-three/fiber and its reconciler,
          // zustand, etc.) is only reached through the lazily-imported
          // EarthScene, so it lands in a chunk that loads on demand.
          return 'three';
        },
      },
    },
  },
});
