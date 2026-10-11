import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// Deployed as a GitHub Pages *project* page at https://ngkaizheng.github.io/portfolio/,
// so every emitted asset URL must carry the /portfolio/ prefix or it 404s.
// Two HTML entries: the portfolio and the mini game at /portfolio/play/.
export default defineConfig({
  base: '/portfolio/',
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, 'index.html'),
        play: resolve(import.meta.dirname, 'play/index.html'),
      },
    },
  },
})
