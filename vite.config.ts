import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';

export default defineConfig({
  base: '/bounce/', // GitHub Pages repository name
  plugins: [viteSingleFile()],
  build: {
    outDir: 'dist',
  },
});
