import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';

export default defineConfig({
  root: 'src/ui',
  plugins: [viteSingleFile()],
  build: {
    outDir: '../../dist',
    emptyOutDir: false,
    assetsInlineLimit: 100000000,
    rollupOptions: {
      output: {
        entryFileNames: 'ui.js',
        assetFileNames: 'ui.[ext]',
      },
    },
  },
});
